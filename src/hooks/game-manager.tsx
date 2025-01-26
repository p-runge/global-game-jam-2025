import { useRouter } from "next/router";
import { createContext, useContext, useState } from "react";
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
  moveCard: (data: { cardId: string; to: CardLocation }) => void;
  updateMonster: (data: {
    cardId: string;
    currentSize: Monster["currentSize"];
    currentStability: Monster["currentStability"];
  }) => void;
};
const GameManagerContext = createContext<GameManager | undefined>(undefined);

export function GameManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const gameId = router.query.id as string | undefined;

  // TODO: this must returned by lobby subscription endpoint and set in its onData
  const [playerId] = useState<"player-1" | "player-2">("player-1");

  const [cardLocations, setCardLocations] = useState<CardLocationMap>();
  const { data } = api.game.gameData.useSubscription(
    { id: gameId ?? null },
    {
      onError: (error) => {
        if (error.data?.code === "NOT_FOUND") {
          // TODO: this might be nicessary later on, no idea
          void router.push("/");
        }
      },
      onData: (data) => {
        if (playerId === undefined) {
          console.error("isPlayer1 is not set");
          // return;
        }

        // map server card locations to client ones based on isPlayer1
        const clientCardLocations: CardLocationMap = {
          "player-deck":
            playerId === "player-1"
              ? data.cardLocations["player-1-deck"]
              : data.cardLocations["player-2-deck"],
          "player-hand":
            playerId === "player-1"
              ? data.cardLocations["player-1-hand"]
              : data.cardLocations["player-2-hand"],
          "player-board":
            playerId === "player-1"
              ? data.cardLocations["player-1-board"]
              : data.cardLocations["player-2-board"],
          "player-discard-pile":
            playerId === "player-1"
              ? data.cardLocations["player-1-discard-pile"]
              : data.cardLocations["player-2-discard-pile"],
          "opponent-deck":
            playerId === "player-1"
              ? data.cardLocations["player-2-deck"]
              : data.cardLocations["player-1-deck"],
          "opponent-hand":
            playerId === "player-1"
              ? data.cardLocations["player-2-hand"]
              : data.cardLocations["player-1-hand"],
          "opponent-board":
            playerId === "player-1"
              ? data.cardLocations["player-2-board"]
              : data.cardLocations["player-1-board"],
          "opponent-discard-pile":
            playerId === "player-1"
              ? data.cardLocations["player-2-discard-pile"]
              : data.cardLocations["player-1-discard-pile"],
        };

        setCardLocations(clientCardLocations);
      },
    },
  );

  const { mutate: moveCard } = api.game.moveCard.useMutation();
  const { mutate: updateMonster } = api.game.updateMonster.useMutation();

  return (
    <GameManagerContext.Provider
      value={{
        turn: data?.activePlayer === playerId ? "player" : "opponent",
        turnCount: data?.turnCount ?? 0,
        cardLocations: cardLocations ?? {
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
