import { TRPCError } from "@trpc/server";
import { EventEmitter, on } from "stream";
import { z } from "zod";
import {
  createTRPCRouter,
  gameProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import {
  initMonster,
  type MonsterCore,
  type Spell,
  type Card,
} from "~/server/types/models";
import { getKeys } from "~/utils/common";

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
async function createNewGame(player1: string, player2: string) {
  console.log("Creating new game... Starting with player:", player1);
  const id = Math.random().toString(36).substring(7);

  const allMonsters = await db.monster.findMany();
  const allSpells = await db.spell.findMany();

  const allCards: Card[] = [
    ...allMonsters.map((monster) =>
      initMonster({
        id: monster.id,
        name: monster.name,
        image: monster.image,
        type: "monster",
        cost: monster.cost,
        size: monster.size,
        stability: monster.stability,
      } satisfies MonsterCore),
    ),
    ...allSpells.map(
      (spell) =>
        ({
          id: spell.id,
          name: spell.name,
          image: spell.image,
          type: "spell",
          damage: spell.damage,
        }) satisfies Spell,
    ),
  ];

  // somehow save the game state
  const game: GameState = {
    players: {
      player1,
      player2,
    },
    activePlayer: player1,
    turnCount: 0,
    winner: null,
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
  players: {
    player1: string;
    player2: string;
  };
  activePlayer: string;
  turnCount: number;
  winner: string | null;
  cardLocations: CardLocationMap;
};
const gameStates: Record<string, GameState> = {};

const queuedPlayers: string[] = [];

const ee = new EventEmitter();

export const gameRouter = createTRPCRouter({
  gameData: publicProcedure.subscription(async function* ({
    signal,
    ctx: { gameId, playerId },
  }) {
    if (!gameId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Missing game id",
      });
    }

    const game = gameStates[gameId];
    if (!game) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Game not found",
      });
    }

    const isGamePlayer =
      playerId === game.players.player1 || playerId === game.players.player2;
    if (!isGamePlayer) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Player is not in the game",
      });
    }

    yield game;

    while (true) {
      // listen for new events
      for await (const [data] of on(ee, `updateGameState-${gameId}`, {
        signal,
      })) {
        const game = data as GameState;
        yield game;
      }
    }
  }),

  lobby: publicProcedure.subscription(async function* ({ signal }) {
    const opponentPlayerId = queuedPlayers.shift();
    if (opponentPlayerId) {
      const playerId = Math.random().toString(36).substring(7);
      // decide who goes first by random
      const shuffledPlayers =
        Math.random() > 0.5
          ? ([playerId, opponentPlayerId] as const)
          : ([opponentPlayerId, playerId] as const);
      const gameId = await createNewGame(...shuffledPlayers);

      // notify opponent player of created game
      ee.emit(`joinLobby-${opponentPlayerId}`, {
        gameId,
        playerId: opponentPlayerId,
      });

      // notify player of created game
      yield { gameId, playerId };
    } else {
      // add player to queue
      const playerId = Math.random().toString(36).substring(7);
      queuedPlayers.push(playerId);

      // wait for other player to join
      while (true) {
        for await (const [data] of on(ee, `joinLobby-${playerId}`, {
          signal,
        })) {
          // notify player of created game
          yield data as { gameId: string; playerId: string };
        }
      }
    }
  }),

  endTurn: gameProcedure.mutation(async ({ ctx: { gameId, playerId } }) => {
    const game = gameStates[gameId];
    if (!game) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Game not found",
      });
    }

    game.activePlayer =
      game.players.player1 === playerId
        ? game.players.player2
        : game.players.player1;
    game.turnCount++;

    ee.emit(`updateGameState-${gameId}`, game);

    return game;
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
      const isPlayersTurn = playerId === gameStates[gameId]?.activePlayer;
      if (!isPlayersTurn) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not player's turn",
        });
      }

      // map client card locations to server ones based on isPlayer1
      const isPlayer1 = playerId === gameStates[gameId]?.players.player1;
      const serverTo = (
        (isPlayer1 && to.startsWith("player")) ||
        (!isPlayer1 && to.startsWith("opponent"))
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
        console.error("Game not found", gameId, getKeys(gameStates));
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
        currentSize: z.number().optional(),
        currentStability: z.number().optional(),
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

        const location = getKeys(game.cardLocations).find((loc) =>
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

        if (currentSize !== undefined) {
          card.currentSize = Math.max(currentSize, 0);
        }
        if (currentStability !== undefined) {
          card.currentStability = Math.max(currentStability, 0);
        }

        const isMonsterDefeated = card.currentStability <= 0;
        if (card.currentSize >= 20) {
          game.winner = game.activePlayer;
        }
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
  const location = getKeys(game.cardLocations).find((loc) =>
    game.cardLocations[loc].some((card) => card.id === cardId),
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

  const maxHandCards = 5;
  if (
    (to === "player-1-hand" || to === "player-2-hand") &&
    game.cardLocations[to].length >= maxHandCards
  ) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Hand is full",
    });
  }

  const maxBoardCards = 5;
  if (
    (to === "player-1-board" || to === "player-2-board") &&
    game.cardLocations[to].length >= maxBoardCards
  ) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Board is full",
    });
  }

  game.cardLocations[location] = game.cardLocations[location].filter(
    (card) => card.id !== cardId,
  );
  game.cardLocations[to].push(card);

  return game;
}
