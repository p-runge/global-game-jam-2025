import { useDroppable } from "@dnd-kit/core";
import React from "react";
import { cn } from "~/utils/cn";

export type DroppableId = "player-board" | `opponent-card-${string}`;
type Props = {
  id: DroppableId;
  children: React.ReactNode;
};
export default function Droppable({ id, children }: Props) {
  const { isOver, setNodeRef, active } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(isOver ? "glow-green" : active && "glow-white")}
    >
      {children}
    </div>
  );
}
