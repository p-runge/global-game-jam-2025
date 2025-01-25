import React from "react";
import type { TBoard } from "~/types/TBoard";

export function Board({ board }: { board: TBoard }) {
  return (
    <div className="h-[300px] w-[900px] bg-red-400">
      <h1>{board.name}</h1>
    </div>
  );
}
