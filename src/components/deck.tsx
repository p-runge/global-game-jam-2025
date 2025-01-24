import React from "react";
import type { TDeck } from "~/types/TDeck";
export function Deck({ deck }: { deck: TDeck }) {
  return (
    <div
      className={`${deck.opponentsDeck ? "col-start-3" : "col-start-1"} border-2`}
    >
      Deck
    </div>
  );
}
