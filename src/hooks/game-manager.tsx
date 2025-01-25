import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { initMonster, type Monster, type Card } from "~/types/models";
import { api } from "~/utils/api";

type CardLocation =
  | "player-deck"
  | "player-hand"
  | "player-board"
  | "player-discard-pile"
  | "opponent-deck"
  | "opponent-hand"
  | "opponent-board"
  | "opponent-discard-pile";

type CardLocationMap = Record<CardLocation, Card[]>;

type GameManager = {
  turn: "player" | "opponent";
  turnCount: number;
  cardLocations: CardLocationMap;
  moveCard: (cardId: string, to: CardLocation) => void;
  updateMonster: (
    cardId: string,
    card: Pick<Monster, "currentSize" | "currentStability">,
  ) => void;
};
const GameManagerContext = createContext<GameManager | undefined>(undefined);

function getUniqueDeckFromCards(cards: Card[]) {
  return cards
    .sort(() => Math.random() - 0.5)
    .map((card) => ({
      ...card,
      id: Math.random().toString(36).substring(7),
    }));
}

export function GameManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cardLocations, setCardLocations] = useState<CardLocationMap>({
    "player-deck": [],
    "player-hand": [],
    "player-board": [],
    "player-discard-pile": [],
    "opponent-deck": [],
    "opponent-hand": [],
    "opponent-board": [],
    "opponent-discard-pile": [],
  });

  const { data } = api.card.getAllMonsters.useQuery();

  useEffect(() => {
    if (!data) return;

    const allCards = data.map((card) =>
      initMonster({
        id: card.id,
        name: card.name,
        image: card.image,
        type: "monster",
        cost: card.cost,
        size: card.size,
        stability: card.stability,
      }),
    );

    setCardLocations({
      "player-deck": getUniqueDeckFromCards(allCards),
      "opponent-deck": getUniqueDeckFromCards(allCards),
      "player-hand": [],
      "player-board": [],
      "player-discard-pile": [],
      "opponent-hand": [],
      "opponent-board": [],
      "opponent-discard-pile": [],
    });
  }, [data]);

  const allCards = useMemo(() => {
    return Object.values(cardLocations).flat();
  }, [cardLocations]);

  const { data: turnData } = api.game.getTurn.useQuery();

  const [turn, setTurn] = useState<"player" | "opponent">("player");
  const [turnCount, setTurnCount] = useState(0);
  useEffect(() => {
    if (!turnData) return;

    setTurn(turnData.turn);
    setTurnCount(turnData.turnCount);
  }, [turnData]);

  const moveCard = useCallback(
    (cardId: string, to: CardLocation) => {
      // prevent moving card to the same location

      const movingCard = allCards.find((c) => c.id === cardId);
      if (!movingCard) return;

      console.log("move card", cardId, "to", to);

      // update card locations
      setCardLocations((prevLocations) => {
        const newLocations = { ...prevLocations };
        (Object.entries(newLocations) as [CardLocation, Card[]][]).forEach(
          ([location, cards]) => {
            // remove card from all locations
            newLocations[location] = cards.filter((card) => card.id !== cardId);

            // add card to new location
            if (location === to) {
              newLocations[to] = [...cards, movingCard];
            }
          },
        );

        return newLocations;
      });
    },
    [allCards],
  );

  // update currentSize and currentStability when card is updated
  function updateMonster(
    cardId: string,
    monsterUpdates: Pick<Monster, "currentSize" | "currentStability">,
  ) {
    const isMonsterDefeated = monsterUpdates.currentStability <= 0;
    const isPlayerCard = cardLocations["player-board"].some(
      (c) => c.id === cardId,
    );
    if (isMonsterDefeated) {
      moveCard(
        cardId,
        isPlayerCard ? "player-discard-pile" : "opponent-discard-pile",
      );
    }

    setCardLocations((prevLocations) => {
      const newLocations = { ...prevLocations };
      (Object.entries(newLocations) as [CardLocation, Card[]][]).forEach(
        ([location, cards]) => {
          newLocations[location] = cards.map((card) =>
            card.id === cardId
              ? {
                  ...card,
                  currentSize: Math.max(monsterUpdates.currentSize, 0),
                  currentStability: Math.max(
                    monsterUpdates.currentStability,
                    0,
                  ),
                }
              : card,
          );
        },
      );

      return newLocations;
    });
  }

  return (
    <GameManagerContext.Provider
      value={{
        turn,
        turnCount,
        cardLocations,
        moveCard,
        updateMonster,
      }}
    >
      {children}
    </GameManagerContext.Provider>
  );
}

export function useGameManager() {
  const context = useContext(GameManagerContext);
  if (!context) {
    throw new Error("useGameManager must be used within a GameProvider");
  }

  return context;
}
