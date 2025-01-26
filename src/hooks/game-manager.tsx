import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { type Card, type Monster } from "~/server/types/models";
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

export function GameManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [gameId, setGameId] = useState<string | null>();
  const { data } = api.game.gameData.useSubscription(
    { id: gameId ?? null },
    {
      onError: () => {
        localStorage.removeItem("gameId");
        setGameId(null);
      },
    },
  );
  const { mutate: createGame } = api.game.create.useMutation({
    onSuccess: (data) => {
      setGameId(data.id);
    },
  });

  useEffect(() => {
    if (gameId === undefined) {
      return;
    }

    if (!gameId) {
      createGame();
    }
  }, [gameId]);

  useEffect(() => {
    // get game id from local storage
    const gameId = localStorage.getItem("gameId");
    if (!gameId) {
      setGameId(null);
      return;
    }

    setGameId(gameId);
  }, []);

  useEffect(() => {
    if (!gameId) return;

    // save game id to local storage
    localStorage.setItem("gameId", gameId);
  }, [gameId]);

  // const allCards = useMemo(() => {
  //   if (!data) return [];
  //   return Object.values(data.cardLocations).flat();
  // }, [data]);

  const { mutate: moveCardMutation } = api.game.moveCard.useMutation();

  const moveCard = useCallback((cardId: string, to: CardLocation) => {
    // prevent moving card to the same location

    moveCardMutation({
      cardId,
      to,
    });

    // const movingCard = allCards.find((c) => c.id === cardId);
    // if (!movingCard) return;

    // console.log("move card", cardId, "to", to);

    // // update card locations
    // setCardLocations((prevLocations) => {
    //   const newLocations = { ...prevLocations };
    //   (Object.entries(newLocations) as [CardLocation, Card[]][]).forEach(
    //     ([location, cards]) => {
    //       // remove card from all locations
    //       newLocations[location] = cards.filter((card) => card.id !== cardId);

    //       // add card to new location
    //       if (location === to) {
    //         newLocations[to] = [...cards, movingCard];
    //       }
    //     },
    //   );

    //   return newLocations;
    // });
  }, []);

  // update currentSize and currentStability when card is updated
  function updateMonster(
    cardId: string,
    monsterUpdates: Pick<Monster, "currentSize" | "currentStability">,
  ) {
    if (!data) return;
    const { cardLocations } = data;

    const isMonsterDefeated = monsterUpdates.currentStability <= 0;
    const isPlayerCard = cardLocations["player-board"].some(
      (c) => c.id === cardId,
    );
    if (isMonsterDefeated) {
      // moveCard(
      //   cardId,
      //   isPlayerCard ? "player-discard-pile" : "opponent-discard-pile",
      // );
    }

    // (prevLocations) => {
    //   const newLocations = { ...prevLocations };
    //   (Object.entries(newLocations) as [CardLocation, Card[]][]).forEach(
    //     ([location, cards]) => {
    //       newLocations[location] = cards.map((card) =>
    //         card.id === cardId
    //           ? {
    //               ...card,
    //               currentSize: Math.max(monsterUpdates.currentSize, 0),
    //               currentStability: Math.max(
    //                 monsterUpdates.currentStability,
    //                 0,
    //               ),
    //             }
    //           : card,
    //       );
    //     },
    //   );

    //   return newLocations;
    // };
  }

  return (
    <GameManagerContext.Provider
      value={{
        turn: data?.turn ?? "player",
        turnCount: data?.turnCount ?? 0,
        cardLocations: data?.cardLocations ?? {
          "player-deck": [],
          "player-hand": [],
          "player-board": [],
          "player-discard-pile": [],
          "opponent-deck": [],
          "opponent-hand": [],
          "opponent-board": [],
          "opponent-discard-pile": [],
        },
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
