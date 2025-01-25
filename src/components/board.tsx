import React from "react";
import type { TBoard } from "~/types/TBoard";

export function Board({
  board,
  children,
}: {
  board: TBoard;
  children: React.ReactNode;
}) {
  return <div className="flex h-[300px] w-[900px] bg-red-400">{children}</div>;
}
