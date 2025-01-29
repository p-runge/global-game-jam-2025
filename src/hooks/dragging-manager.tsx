import { useCallback, useState } from "react";
import type { TDraggable } from "~/components/draggable";
import { useGameManager } from "./game-manager";

export type DroppableId = "player-board" | `opponent-card-${string}`;

export const useDraggingManager = () => {
  const [draggable, setDraggableId] = useState<TDraggable | null>(null);

  const {
    cardLocations,
    moveCard,
    updateMonster,
    getCardById,
    getCardLocation,
  } = useGameManager();

  const moveItem = useCallback(
    (cardId: string, to: DroppableId) => {
      const card = getCardById(cardId);
      if (!card) return;

      // prevent moving card to the same location
      const from = getCardLocation(cardId);
      if (!from) return;
      if (from === to) return;

      console.log("move draggable", cardId, "from", from, "to", to);
      if (to === "player-board") {
        moveCard({ cardId, to: "player-board" });
      } else if (
        card.type === "spell" &&
        from === "player-hand" &&
        to.startsWith("opponent-card-")
      ) {
        // trigger spell
        const targetCardId = to.replace("opponent-card-", "");
        const target = cardLocations["opponent-board"]
          .filter((c) => c.type === "monster")
          .find((c) => c.id === targetCardId);
        if (!target) return;

        updateMonster({
          cardId: target.id,
          currentSize: target.currentSize - card.damage,
        });
      } else if (
        card.type === "monster" &&
        from === "player-board" &&
        to.startsWith("opponent-card-")
      ) {
        // trigger attack
        const defenderCardId = to.replace("opponent-card-", "");
        const defender = cardLocations["opponent-board"].find(
          (c) => c.id === defenderCardId,
        );
        const attacker = cardLocations[from].find((c) => c.id === cardId);
        if (attacker?.type !== "monster" || defender?.type !== "monster")
          return;

        updateMonster({
          cardId: attacker.id,
          currentSize: attacker.currentSize + defender.currentSize,
          currentStability: attacker.currentStability - defender.currentSize,
        });

        updateMonster({
          cardId: defender.id,
          currentSize: 0,
          currentStability: 0,
        });
      }
    },
    [cardLocations, getCardById, getCardLocation, moveCard, updateMonster],
  );

  const startDragging = useCallback((draggable: TDraggable | null) => {
    setDraggableId(draggable);
  }, []);

  const droppables = draggable?.droppableIds ?? [];

  return { droppables, startDragging, moveItem, draggable };
};
