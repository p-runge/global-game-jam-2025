import React from "react";
import type { TCard } from "~/types/TCard";
import { Card } from "./card";

export function Hand({ cards }: { cards: TCard[] }) {
  return (
    <div className="col-start-2 grid grid-cols-7 grid-rows-1 border-2">
      {cards.map((card) => (
        <Card key={card.id} card={card}></Card>
      ))}
    </div>
  );
}
