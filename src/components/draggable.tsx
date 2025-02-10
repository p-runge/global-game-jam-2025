import { useDraggable } from "@dnd-kit/core";
import React from "react";
import { useDraggingManager } from "~/hooks/dragging-manager";
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
  const { draggableId } = useDraggingManager();

  console.log("Draggable", id, enabled, draggableId);

  if (!enabled) {
    return children;
  }

  if (draggableId !== null && draggableId === id) {
    return children;
  }

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
      {...listeners}
      {...attributes}
      className={cn(
        "rounded-lg",
        isDragging
          ? "glow-green z-20 scale-125 cursor-grabbing"
          : "hover:glow-green cursor-grab hover:z-10 hover:scale-125",
      )}
    >
      {children}
    </button>
  );
}
