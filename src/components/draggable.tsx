import { useDraggable } from "@dnd-kit/core";
import React from "react";
import type { DroppableId } from "~/hooks/droppable-manager";
import { cn } from "~/utils/cn";

type Props = {
  id: string;
  droppableId: DroppableId;
  isDraggable: boolean;
  children: React.ReactNode;
};
export default function Draggable({
  id,
  droppableId,
  isDraggable,
  children,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: {
        droppableId,
        isDraggable,
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
      {...(isDraggable ? listeners : {})} // Only add listeners if draggable
      {...attributes}
      className={cn(
        "border-2",
        isDragging
          ? "cursor-grabbing border-amber-500"
          : isDraggable
            ? "cursor-grab hover:border-green-500"
            : "cursor-not-allowed border-black",
      )}
    >
      {children}
    </button>
  );
}
