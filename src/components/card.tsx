import React from "react";

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
    <div className="h-card w-card relative flex flex-col justify-between rounded-lg border-4 border-black bg-gray-800 p-6 text-white shadow-sm hover:bg-gray-700">
      <div className="mb-2 text-3xl font-bold tracking-tight">{card.name}</div>

      <div className="mx-auto h-[100px] w-[70px] content-center rounded-[50%] border-4 text-3xl">
        {":)"}
      </div>

      <div className="text-[80px] font-normal leading-none">{card.size}</div>

      <div className="absolute right-4 top-4 aspect-square rounded-full border py-2">
        {card.cost}
      </div>
      <div className="absolute bottom-4 right-4 text-2xl">{card.stability}</div>
    </div>
  );
}
