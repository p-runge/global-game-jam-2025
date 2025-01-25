import { useCallback, useState } from "react";
import type { TDraggable } from "~/components/draggable";
import { useGameManager } from "./game-manager";

export type DroppableId = "player-board" | `opponent-card-${string}`;

export const useDraggingManager = () => {
  const [draggable, setDraggableId] = useState<TDraggable | null>(null);

  const { cardLocations, moveCard, updateMonster } = useGameManager();

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
        console.log("length", cardLocations["player-board"].length);
      } else if (to.startsWith("opponent-card-")) {
        // trigger attack
        const defenderCardId = to.replace("opponent-card-", "");
        const defender = cardLocations["opponent-board"].find(
          (c) => c.id === defenderCardId,
        );
        const attacker = cardLocations[from].find((c) => c.id === cardId);
        if (attacker?.type !== "monster" || defender?.type !== "monster")
          return;

        const newSize = attacker.currentSize + defender.currentSize;
        const newStability = attacker.currentStability - defender.currentSize;

        updateMonster(attacker.id, {
          currentSize: newSize,
          currentStability: newStability,
        });

        updateMonster(defender.id, {
          currentSize: 0,
          currentStability: 0,
        });
      }
    },
    [cardLocations, moveCard, updateMonster],
  );

  const startDragging = useCallback((draggable: TDraggable | null) => {
    setDraggableId(draggable);
  }, []);

  const droppables = draggable?.droppableIds ?? [];

  return { droppables, startDragging, moveItem, draggable };
};
