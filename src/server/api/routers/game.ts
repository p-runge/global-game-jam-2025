import { TRPCError } from "@trpc/server";
import { emit } from "process";
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
async function createNewGame(){
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
      return id;
}
type GameState = {
  turn: "player" | "opponent";
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
  
  lobby: publicProcedure
  .subscription(async function* ({ signal }) {
    let player;
    console.log("queuedPlayers", queuedPlayers);
    if (queuedPlayers[0]) {
        console.log("queuedPlayers found", queuedPlayers);
        player = queuedPlayers.shift()!;
        const newGameId = await createNewGame();
        ee.emit(`joinLobby-${player}`, newGameId);
        yield newGameId;
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
            console.log("wtf is going on here", data);
            const newGameId = data as string;
            yield newGameId;
          }
        }
      }
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
    .mutation(({ ctx: { gameId }, input: { cardId, to } }) => {
      // TODO: check for game state in context and put it there

      const game = gameStates[gameId]!;
      if (!game) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Game not found",
        });
      }

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
