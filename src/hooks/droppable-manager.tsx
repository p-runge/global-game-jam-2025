import { useCallback, useState } from "react";
import { type TCard } from "~/types/TCard";

export type DroppableId = "player-hand" | "player-board";
export type DraggableDroppableMap = Record<DroppableId, TCard[]>;

export const useDroppableManager = (initialState: DraggableDroppableMap) => {
  const [droppables, setDroppables] =
    useState<DraggableDroppableMap>(initialState);

  const moveItem = useCallback(
    (itemId: string, fromDroppable: DroppableId, toDroppable: DroppableId) => {
      setDroppables((prev) => {
        const source = prev[fromDroppable] ?? [];
        const destination = prev[toDroppable] ?? [];

        // Find and remove the item from the source droppable
        const itemIndex = source.findIndex((item) => item.id === itemId);
        if (itemIndex === -1) return prev; // Item not found, do nothing

        const [movedItem] = source.splice(itemIndex, 1);

        // Add the item to the destination droppable
        destination.push(movedItem!);

        return {
          ...prev,
          [fromDroppable]: [...source],
          [toDroppable]: [...destination],
        };
      });
    },
    [],
  );

  return { droppables, moveItem };
};
