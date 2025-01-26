import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { MonsterCoreSchema } from "~/server/types/models";

export const cardRouter = createTRPCRouter({
  getAllMonsters: publicProcedure
    .output(z.array(MonsterCoreSchema))
    .query(async ({ ctx }) => {
      const monsters = await ctx.db.monster.findMany();

      return monsters.map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ createdAt, updatedAt, ...monster }) => ({
          type: "monster",
          ...monster,
        }),
      );
    }),
});
