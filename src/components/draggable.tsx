import { useDraggable } from "@dnd-kit/core";
import React from "react";
import { useDraggingManager } from "~/hooks/dragging-manager";
import { useFrame } from "~/hooks/frame";
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
  const { scale } = useFrame();

  const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = (event) => {
    // center the draggable on the cursor
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetToDraggableCenter = {
      x: event.clientX - rect.left - rect.width / 2,
      y: event.clientY - rect.top - rect.height / 2,
    };
    event.currentTarget.style.transform = `translate3d(${
      offsetToDraggableCenter.x / scale
    }px, ${offsetToDraggableCenter.y / scale}px, 0)`;
  };

  console.log("Draggable", id, enabled, draggableId);

  if (!enabled) {
    return children;
  }

  if (draggableId !== null && draggableId === id) {
    return children;
  }

  return (
    <div
      ref={setNodeRef}
      onMouseDown={handleMouseDown}
      style={
        transform
          ? {
              transform: `translate3d(${transform.x / scale}px, ${
                transform.y / scale
              }px, 0)`,
            }
          : undefined
      }
      {...listeners}
      {...attributes}
      className={cn("relative", isDragging ? "z-20" : "hover:z-10")}
    >
      <button
        className={cn(
          "rounded-lg transition-all",
          isDragging
            ? "glow-green scale-125 cursor-grabbing"
            : "hover:glow-green cursor-grab hover:scale-125",
        )}
      >
        {children}
      </button>
    </div>
  );
}
