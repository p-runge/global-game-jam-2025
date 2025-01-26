import { TRPCError } from "@trpc/server";
import { EventEmitter, on } from "stream";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { initMonster, type Card } from "~/server/types/models";

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

function getUniqueDeckFromCards(cards: Card[]) {
  return cards
    .sort(() => Math.random() - 0.5)
    .map((card) => ({
      ...card,
      id: Math.random().toString(36).substring(7),
    }));
}

type GameState = {
  turn: "player" | "opponent";
  turnCount: number;
  cardLocations: CardLocationMap;
};
const gameStates: Record<string, GameState> = {};

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

  create: publicProcedure
    .output(z.object({ id: z.string() }))
    .mutation(async ({ ctx }) => {
      const id = Math.random().toString(36).substring(7);

      const allMonsters = await ctx.db.monster.findMany();

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
        turn: "player",
        turnCount: 0,
        cardLocations: {
          "player-deck": getUniqueDeckFromCards(allCards),
          "opponent-deck": getUniqueDeckFromCards(allCards),
          "player-hand": [],
          "player-board": [],
          "player-discard-pile": [],
          "opponent-hand": [],
          "opponent-board": [],
          "opponent-discard-pile": [],
        },
      };

      // save the game state in the server session
      gameStates[id] = game;

      return {
        id,
        state: game,
      };
    }),

  moveCard: publicProcedure
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
    .mutation(({ input: { cardId, to } }) => {
      // TODO: check for game state in context and put it there

      const gameId = Object.keys(gameStates)[0];
      if (!gameId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No game found",
        });
      }

      const game = gameStates[gameId]!;

      const location = (Object.keys(game.cardLocations) as CardLocation[]).find(
        (loc) => game.cardLocations[loc].some((card) => card.id === cardId),
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

      game.cardLocations[location] = game.cardLocations[location].filter(
        (card) => card.id !== cardId,
      );
      game.cardLocations[to].push(card);

      ee.emit(`updateGameState-${gameId}`, game);

      return game;
    }),
});
