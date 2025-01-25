import React from "react";
<<<<<<< HEAD
=======
import Image from "next/image";
import type { TCard } from "~/types/TCard";
>>>>>>> ffc5c1e (so that I can rebase ffs)

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
<<<<<<< HEAD
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
=======
    <div className="h-card w-card rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
      <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {card.id + card.name}
      </h5>
      <Image src="/bubble.webp" alt={card.name} width={200} height={200} />
      <p className="font-normal text-gray-700 dark:text-gray-400">
        {card.location}
      </p>
>>>>>>> ffc5c1e (so that I can rebase ffs)
    </div>
  );
}
