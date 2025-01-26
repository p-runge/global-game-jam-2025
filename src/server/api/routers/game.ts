import { TRPCError } from "@trpc/server";
import { EventEmitter, on } from "stream";
import { z } from "zod";
import {
  createTRPCRouter,
  gameProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { initMonster, type Card } from "~/server/types/models";

type CardLocation =
  | "player-1-deck"
  | "player-1-hand"
  | "player-1-board"
  | "player-1-discard-pile"
  | "player-2-deck"
  | "player-2-hand"
  | "player-2-board"
  | "player-2-discard-pile";

type CardLocationMap = Record<CardLocation, Card[]>;

function getUniqueDeckFromCards(cards: Card[]) {
  return cards
    .sort(() => Math.random() - 0.5)
    .map((card) => ({
      ...card,
      id: Math.random().toString(36).substring(7),
    }));
}
async function createNewGame() {
  const id = Math.random().toString(36).substring(7);

  const allMonsters = await db.monster.findMany();

  const allCards: Card[] = allMonsters.map((monster) =>
    initMonster({
      id: monster.id,
      name: monster.name,
      image: monster.image,
      type: "monster",
      cost: monster.cost,
      size: monster.size,
      stability: monster.stability,
    }),
  );

  // somehow save the game state
  const game: GameState = {
    activePlayer: "player-1",
    turnCount: 0,
    cardLocations: {
      "player-1-deck": getUniqueDeckFromCards(allCards),
      "player-1-hand": [],
      "player-1-board": [],
      "player-1-discard-pile": [],
      "player-2-deck": getUniqueDeckFromCards(allCards),
      "player-2-hand": [],
      "player-2-board": [],
      "player-2-discard-pile": [],
    },
  };

  // save the game state in the server session
  gameStates[id] = game;
  return id;
}
type GameState = {
  activePlayer: "player-1" | "player-2";
  turnCount: number;
  cardLocations: CardLocationMap;
};
const gameStates: Record<string, GameState> = {};

const queuedPlayers: string[] = [];

const ee = new EventEmitter();

export const gameRouter = createTRPCRouter({
  gameData: publicProcedure
    .input(
      z.object({
        id: z.string().nullable(),
      }),
    )
    .subscription(async function* ({ input: { id }, signal }) {
      if (!id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Missing game id",
        });
      }

      // emit the initial game state
      const game = gameStates[id];
      if (!game) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Game not found",
        });
      }

      yield game;

      while (true) {
        // listen for new events
        for await (const [data] of on(ee, `updateGameState-${id}`, {
          signal,
        })) {
          const game = data as GameState;
          yield game;
        }
      }
    }),

  lobby: publicProcedure.subscription(async function* ({ signal }) {
    let player;
    console.log("queuedPlayers", queuedPlayers);
    if (queuedPlayers[0]) {
      console.log("queuedPlayers found", queuedPlayers);
      player = queuedPlayers.shift()!;
      const gameId = await createNewGame();
      ee.emit(`joinLobby-${player}`, { gameId, playerId: "player-1" });
      yield { gameId, playerId: "player-2" };
    } else {
      console.log("queuedPlayers not found", queuedPlayers);
      player = Math.random().toString(36).substring(7);
      queuedPlayers.push(player);
      console.log("queuedPlayers after push", queuedPlayers);
      while (true) {
        // listen for new events
        for await (const [data] of on(ee, `joinLobby-${player}`, {
          signal,
        })) {
          yield data as { gameId: string; playerId: string };
        }
      }
    }
  }),

  endTurn: publicProcedure.mutation(async ({ ctx: { gameId } }) => {
    const game = gameStates[gameId!];
    if (!game) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Game not found",
      });
    }

    game.turn = game.turn === "player" ? "opponent" : "player";
    game.turnCount++;

    ee.emit(`updateGameState-${gameId}`, game);

    return game;
  }),

  create: publicProcedure
    .output(z.object({ id: z.string() }))
    .mutation(async () => {
      const gameId = await createNewGame();

      return {
        id: gameId,
        state: gameStates[gameId],
      };
    }),

  moveCard: gameProcedure
    .input(
      z.object({
        cardId: z.string(),
        to: z.union([
          z.literal("player-deck"),
          z.literal("player-hand"),
          z.literal("player-board"),
          z.literal("player-discard-pile"),
          z.literal("opponent-deck"),
          z.literal("opponent-hand"),
          z.literal("opponent-board"),
          z.literal("opponent-discard-pile"),
        ]),
      }),
    )
    .mutation(({ ctx: { gameId, playerId }, input: { cardId, to } }) => {
      // TODO: check for game state in context and put it there

      // map client card locations to server ones based on isPlayer1
      const serverTo = (
        (playerId === "player-1" && to.startsWith("player")) ||
        (playerId === "player-2" && to.startsWith("opponent"))
          ? to.replace("player", "player-1").replace("opponent", "player-2")
          : to.replace("player", "player-2").replace("opponent", "player-1")
      ) as CardLocation;
      console.table([
        ["playerId", playerId],
        ["to", to],
        ["serverTo", serverTo],
      ]);

      const game = gameStates[gameId]!;
      if (!game) {
        console.error("Game not found", gameId, Object.keys(gameStates));
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Game not found",
        });
      }

      const updatedGame = moveCard({ game, cardId, to: serverTo });

      ee.emit(`updateGameState-${gameId}`, updatedGame);

      return game;
    }),

  updateMonster: gameProcedure
    .input(
      z.object({
        cardId: z.string(),
        currentSize: z.number(),
        currentStability: z.number(),
      }),
    )
    .mutation(
      ({
        ctx: { gameId },
        input: { cardId, currentSize, currentStability },
      }) => {
        const game = gameStates[gameId]!;
        if (!game) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Game not found",
          });
        }

        const location = (
          Object.keys(game.cardLocations) as CardLocation[]
        ).find((loc) =>
          game.cardLocations[loc].some((card) => card.id === cardId),
        );
        if (!location) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Card not found",
          });
        }

        const card = game.cardLocations[location].find(
          (card) => card.id === cardId,
        );
        if (!card) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Card not found",
          });
        }

        if (card.type !== "monster") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Card is not a monster",
          });
        }

        card.currentSize = Math.max(currentSize, 0);
        card.currentStability = Math.max(currentStability, 0);

        const isMonsterDefeated = card.currentStability <= 0;

        let updatedGame = game;
        if (isMonsterDefeated) {
          updatedGame = moveCard({
            game,
            cardId: card.id,
            to: location.startsWith("player-1")
              ? "player-1-discard-pile"
              : "player-2-discard-pile",
          });
        }

        ee.emit(`updateGameState-${gameId}`, updatedGame);

        return game;
      },
    ),
});

function moveCard({
  game,
  cardId,
  to,
}: {
  game: GameState;
  cardId: string;
  to: CardLocation;
}) {
  const location = (Object.keys(game.cardLocations) as CardLocation[]).find(
    (loc) => game.cardLocations[loc].some((card) => card.id === cardId),
  );
  if (!location) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Card not found",
    });
  }

  const card = game.cardLocations[location].find((card) => card.id === cardId);
  if (!card) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Card not found",
    });
  }

  game.cardLocations[location] = game.cardLocations[location].filter(
    (card) => card.id !== cardId,
  );
  game.cardLocations[to].push(card);

  return game;
}
