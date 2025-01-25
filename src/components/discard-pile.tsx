import React from "react";
import type { TDiscardPile } from "~/types/TDiscardPile";

export default function DiscardPile({
  discardPile,
}: {
  discardPile: TDiscardPile;
}) {
  return (
    <div className="h-card w-card bg-black text-white">
      Discard Pile {discardPile.name}
    </div>
  );
}
