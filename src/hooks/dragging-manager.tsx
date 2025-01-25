import { useCallback, useState } from "react";
import type { TCard } from "~/components/card";
import type { TDraggable } from "~/components/draggable";
import { useCardLocationManager } from "./card-location-manager";

export type DroppableId = "player-board" | `opponent-card-${number}`;
export type DraggableDroppableMap = Record<DroppableId, TCard[]>;

export const useDraggingManager = () => {
  const [draggable, setDraggableId] = useState<TDraggable | null>(null);

  const { cardLocations, moveCard } = useCardLocationManager();

  const moveItem = useCallback(
    (cardId: string, to: DroppableId) => {
      // prevent moving card to the same location
      const from = (
        Object.keys(cardLocations) as (keyof typeof cardLocations)[]
      ).find((location) =>
        cardLocations[location].some((c) => c.id === cardId),
      );
      if (!from) return;
      if (from === to) return;

      console.log("move draggable", cardId, "from", from, "to", to);
      if (to === "player-board") {
        moveCard(cardId, "player-board");
      } else if (to.startsWith("opponent-card-")) {
        // trigger attack
      }
    },
    [cardLocations, moveCard],
  );

  const startDragging = useCallback((draggable: TDraggable) => {
    setDraggableId(draggable);
  }, []);

  const droppables = draggable?.droppableIds ?? [];

  return { droppables, startDragging, moveItem };
};
