/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from "zod";

// every card has this
const CardBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
});

/**
 * Monsters
 */
// the core data that is also stored in the db
export const MonsterCoreSchema = CardBaseSchema.extend({
  type: z.literal("monster"),
  cost: z.number(),
  size: z.number(),
  stability: z.number(),
});
export type MonsterCore = z.infer<typeof MonsterCoreSchema>;

// the data that is used in the game
const MonsterSchema = MonsterCoreSchema.extend({
  currentSize: z.number(),
  currentStability: z.number(),
});
export type Monster = z.infer<typeof MonsterSchema>;

export function initMonster(monster: MonsterCore) {
  const playedMonster: Monster = {
    ...monster,
    currentSize: monster.size,
    currentStability: monster.stability,
  };

  return playedMonster;
}

/**
 * Spells
 */
export const SpellSchema = CardBaseSchema.extend({
  type: z.literal("spell"),
  damage: z.number().int(),
});
export type Spell = z.infer<typeof SpellSchema>;

/**
 * Union type for all cards
 */
const CardCoreSchema = z.union([MonsterCoreSchema, SpellSchema]);
export type CardCore = z.infer<typeof CardCoreSchema>;

const CardSchema = z.union([MonsterSchema, SpellSchema]);
export type Card = z.infer<typeof CardSchema>;
