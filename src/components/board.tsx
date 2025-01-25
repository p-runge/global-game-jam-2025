import React from "react";
import type { TBoard } from "~/types/TBoard";

export function Board({
  children,
}: {
  board: TBoard;
  children: React.ReactNode;
}) {
  return <div className="h-card flex w-[900px] bg-red-400">{children}</div>;
}
