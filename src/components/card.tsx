import React from "react";
import Image from "next/image";

// type CardType = "monster" | "spell" | "trap";
export type TCard = {
  id: string;
  name: string;
  // type: CardType;
  cost: number;
  size: number;
  stability: number;
};
export function Card({ card }: { card: TCard }) {
  return (
    <div className="h-card w-card relative flex flex-col justify-between rounded-lg border-4 border-black bg-gray-800 bg-[url('/bubble.webp')] bg-cover text-white shadow-sm hover:bg-gray-700">
      <div className="mb-2 text-xl font-bold tracking-tight">{card.name}</div>

      <div className="flex items-center justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border bg-[url('/bubble-plain.jpg')] bg-cover p-2 text-center text-[80px] font-normal leading-none">
          {card.size}
        </div>

        <div className="absolute right-2 top-2 flex aspect-square h-7 w-7 items-center justify-center rounded-full border bg-[url('/bubble-plain.jpg')] bg-cover py-2">
          {card.cost}
        </div>
      </div>
      <div className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full border bg-[url('/bubble-plain.jpg')] bg-cover text-2xl">
        {card.stability}
      </div>
    </div>
  );
}
