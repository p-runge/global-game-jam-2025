import { useDroppable } from "@dnd-kit/core";
import React from "react";
import type { DroppableId } from "~/hooks/droppable-manager";
import { cn } from "~/utils/cn";

type Props = {
  id: DroppableId;
  children: React.ReactNode;
};
export default function Droppable({ id, children }: Props) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn("border-4", isOver ? "bg-green-500" : "border-black")}
    >
      {children}
    </div>
  );
}
