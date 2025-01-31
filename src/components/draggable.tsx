import { useDraggable } from "@dnd-kit/core";
import React from "react";
import { cn } from "~/utils/cn";
import type { DroppableId } from "./droppable";

export type TDraggable = {
  id: string;
  enabled: boolean;
  droppableIds: DroppableId[];
};
type Props = TDraggable & {
  children: React.ReactNode;
};
export default function Draggable({ id, enabled, children }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
    });

  return (
    <button
      ref={setNodeRef}
      style={
        transform
          ? {
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
            }
          : undefined
      }
      {...listeners} // Only add listeners if draggable
      {...attributes}
      className={cn(
        isDragging
          ? "scale-125 cursor-grabbing"
          : enabled &&
              "hover:glow-green cursor-grab hover:z-10 hover:scale-125",
      )}
    >
      {children}
    </button>
  );
}
