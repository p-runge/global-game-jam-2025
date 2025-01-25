import type { TDeck } from "~/types/TDeck";
export function Deck({ deck }: { deck: TDeck }) {
  return <div className="h-card w-card bg-green-400">Deck {deck.name}</div>;
}
