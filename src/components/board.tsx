import React from "react";
import type { TBoard } from "~/types/TBoard";

export function Board({ board }: { board: TBoard }) {
  return (
    <div className="col-start-2 h-80 border-2 text-white">
      <h1>{board.name}</h1>
    </div>
  );
}
