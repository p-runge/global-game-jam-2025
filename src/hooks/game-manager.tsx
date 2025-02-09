import { useRouter } from "next/router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { type Card, type Monster } from "~/server/types/models";
import { api } from "~/utils/api";
import { getKeys } from "~/utils/common";

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
    currentSize?: Monster["currentSize"];
    currentStability?: Monster["currentStability"];
  }) => void;
  winner: "player" | "opponent" | null;
  getCardById: (cardId: string) => Card | null;
  getCardLocation: (cardId: string) => CardLocation | null;
};
const GameManagerContext = createContext<GameManager | undefined>(undefined);

export function GameManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [playerId, setPlayerId] = useState<string | undefined>();
  useEffect(() => {
    // read playerId from cookie
    const cookieValue = document.cookie
      .split(";")
      .find((c) => c.includes("playerId"))
      ?.split("=")[1];

    const playerId = cookieValue || undefined;
    setPlayerId(playerId);
  }, []);

  const [cardLocations, setCardLocations] = useState<CardLocationMap>();
  const { data } = api.game.gameData.useSubscription(undefined, {
    onError: (error) => {
      if (error.data?.code === "BAD_REQUEST") {
        void router.push("/");
      } else if (error.data?.code === "NOT_FOUND") {
        void router.push("/");
      } else if (error.data?.code === "FORBIDDEN") {
        void router.push("/");
      }
    },
    onData: (data) => {
      const isPlayer1 = playerId === data.players.player1;

      // map server card locations to client ones based on isPlayer1
      const clientCardLocations: CardLocationMap = isPlayer1
        ? {
            "player-deck": data.cardLocations["player-1-deck"],
            "player-hand": data.cardLocations["player-1-hand"],
            "player-board": data.cardLocations["player-1-board"],
            "player-discard-pile": data.cardLocations["player-1-discard-pile"],
            "opponent-deck": data.cardLocations["player-2-deck"],
            "opponent-hand": data.cardLocations["player-2-hand"],
            "opponent-board": data.cardLocations["player-2-board"],
            "opponent-discard-pile":
              data.cardLocations["player-2-discard-pile"],
          }
        : {
            "player-deck": data.cardLocations["player-2-deck"],
            "player-hand": data.cardLocations["player-2-hand"],
            "player-board": data.cardLocations["player-2-board"],
            "player-discard-pile": data.cardLocations["player-2-discard-pile"],
            "opponent-deck": data.cardLocations["player-1-deck"],
            "opponent-hand": data.cardLocations["player-1-hand"],
            "opponent-board": data.cardLocations["player-1-board"],
            "opponent-discard-pile":
              data.cardLocations["player-1-discard-pile"],
          };

      setCardLocations(clientCardLocations);
    },
  });

  const getCardById = useCallback(
    (cardId: string) => {
      if (!cardLocations) return null;
      return (
        Object.values(cardLocations)
          .flatMap((cards) => cards)
          .find((card) => card.id === cardId) ?? null
      );
    },
    [cardLocations],
  );

  const getCardLocation = useCallback(
    (cardId: string) => {
      if (!cardLocations) return null;
      return (
        getKeys(cardLocations).find((location) =>
          cardLocations[location].some((card) => card.id === cardId),
        ) ?? null
      );
    },
    [cardLocations],
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
        winner: !data?.winner
          ? null
          : data.winner === playerId
            ? "player"
            : "opponent",
        getCardById,
        getCardLocation,
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
