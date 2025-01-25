import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const monsterRouter = createTRPCRouter({
  
  getAllCards: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.monster.findMany();
  }),
});
