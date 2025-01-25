import { useDraggable } from "@dnd-kit/core";
import React from "react";
import type { DroppableId } from "~/hooks/dragging-manager";
import { cn } from "~/utils/cn";

export type TDraggable = {
  id: string;
  droppableIds: DroppableId[];
};
type Props = TDraggable & {
  children: React.ReactNode;
};
export default function Draggable({ id, droppableIds, children }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: {
        droppableIds,
      },
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
        "border-2",
        isDragging
          ? "cursor-grabbing border-amber-500"
          : "cursor-grab hover:border-green-500",
      )}
    >
      {children}
    </button>
  );
}
