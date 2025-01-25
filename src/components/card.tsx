import React from "react";
import type { TCard } from "~/types/TCard";

export function Card({ card }: { card: TCard }) {
  return (
    <div className="h-[300px] w-[180px] rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
      <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {card.id + card.name}
      </h5>

      <p className="font-normal text-gray-700 dark:text-gray-400">
        {card.location}
      </p>
    </div>
  );
}
