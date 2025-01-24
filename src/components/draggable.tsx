import { useDraggable } from "@dnd-kit/core";
import React from "react";
import type { DroppableId } from "~/hooks/droppable-manager";

type Props = {
  id: string;
  droppableId: DroppableId;
  children: React.ReactNode;
};
export default function Draggable({ id, droppableId, children }: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data: {
      droppableId,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <button ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </button>
  );
}
