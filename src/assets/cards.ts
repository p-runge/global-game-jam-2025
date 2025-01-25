import { type Card, type CardCore, initMonster } from "~/types/models";

const storedMonsters: CardCore[] = [
  {
    id: "1",
    name: "Bernd",
    type: "monster",
    cost: 1,
    size: 1,
    stability: 1,
  },
  {
    id: "2",
    name: "Bärbel",
    type: "monster",
    cost: 2,
    size: 2,
    stability: 2,
  },
  {
    id: "3",
    name: "Bobo",
    type: "monster",
    cost: 3,
    size: 3,
    stability: 3,
  },
  {
    id: "4",
    name: "Ben",
    type: "monster",
    cost: 4,
    size: 4,
    stability: 4,
  },
  {
    id: "5",
    name: "Bonnie",
    type: "monster",
    cost: 5,
    size: 5,
    stability: 5,
  },
  {
    id: "6",
    name: "Billy",
    type: "monster",
    cost: 6,
    size: 6,
    stability: 6,
  },
  {
    id: "7",
    name: "Bella",
    type: "monster",
    cost: 7,
    size: 7,
    stability: 7,
  },
  {
    id: "8",
    name: "Benny",
    type: "monster",
    cost: 8,
    size: 8,
    stability: 8,
  },
  {
    id: "9",
    name: "Poke",
    type: "spell",
    effect: "Draw a card",
  },
];

export const CARDS: Card[] = storedMonsters.map((card) => {
  return card.type === "monster" ? initMonster(card) : card;
});
