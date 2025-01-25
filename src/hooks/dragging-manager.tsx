import { useCallback, useState } from "react";
import type { TDraggable } from "~/components/draggable";
import { useGameManager } from "./game-manager";

export type DroppableId = "player-board" | `opponent-card-${number}`;

export const useDraggingManager = () => {
  const [draggable, setDraggableId] = useState<TDraggable | null>(null);

  const { cardLocations, moveCard } = useGameManager();

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
