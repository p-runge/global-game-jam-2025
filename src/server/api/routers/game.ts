import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const gameRouter = createTRPCRouter({
  getTurn: publicProcedure
    .output(
      z.object({
        turn: z.union([z.literal("player"), z.literal("opponent")]),
        turnCount: z.number(),
      }),
    )
    .query(() => {
      return {
        turn: "player" as "player" | "opponent",
        turnCount: 1,
      };
    }),
});
