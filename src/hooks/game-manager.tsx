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
  cardLocations: CardLocationMap;
  moveCard: (cardId: string, to: CardLocation) => void;
  updateMonster: (
    cardId: string,
    card: Pick<Monster, "currentSize" | "currentStability">,
  ) => void;
};
const GameManagerContext = createContext<GameManager | undefined>(undefined);

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
    function shuffleArray<T>(array: T[]): T[] {
      const shuffled = [...array]; // Create a copy to avoid mutating the original array
      for (let i = shuffled.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[randomIndex]] = [
          shuffled[randomIndex],
          shuffled[i],
        ]; // Swap elements
      }
      return shuffled;
    }

    setCardLocations((prevLocations) => ({
      // TODO: correctly set initial data
      ...prevLocations,
      "player-deck": shuffleArray(allCards),
      "opponent-deck": shuffleArray(allCards),
      "player-hand": allCards.filter((_, i) => i % 3 === 0),
      "player-board": allCards.filter((_, i) => i % 3 === 1),
      "opponent-board": allCards.filter((_, i) => i % 3 === 2),
    }));
  }, [data]);

  const allCards = useMemo(() => {
    return Object.values(cardLocations).flat();
  }, [cardLocations]);

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

    setCardLocations((prevLocations) => {
      const newLocations = { ...prevLocations };
      (Object.entries(newLocations) as [CardLocation, Card[]][]).forEach(
        ([location, cards]) => {
          newLocations[location] = cards
            .map((card) =>
              card.id === cardId
                ? isMonsterDefeated
                  ? undefined
                  : {
                      ...card,
                      currentSize: monsterUpdates.currentSize,
                      currentStability: monsterUpdates.currentStability,
                    }
                : card,
            )
            .filter(Boolean);
        },
      );

      return newLocations;
    });
  }

  return (
    <GameManagerContext.Provider
      value={{
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
