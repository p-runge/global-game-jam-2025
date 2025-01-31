import { useDroppable } from "@dnd-kit/core";
import React from "react";
import { cn } from "~/utils/cn";

export type DroppableId =
  | "player-board"
  | `monster-player-${string}`
  | `monster-opponent-${string}`;

export const isDroppableMonsterPlayer = /^monster-player-{.*}$/;
export const isDroppableMonsterOpponent = /^monster-opponent-{.*}$/;

type Props = {
  id: DroppableId;
  enabled: boolean;
  children: React.ReactNode;
};
export default function Droppable({ id, enabled, children }: Props) {
  const { isOver, setNodeRef, active } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        enabled && (isOver ? "glow-green" : active && "glow-white"),
      )}
    >
      {children}
    </div>
  );
}
