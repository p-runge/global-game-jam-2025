import type { TDeck } from "~/types/TDeck";
export function Deck({ deck }: { deck: TDeck }) {
  return (
    <div className="h-[300px] w-[180px] bg-green-400">Deck {deck.name}</div>
  );
}
