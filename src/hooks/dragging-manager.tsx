import { useDndContext, type DragEndEvent } from "@dnd-kit/core";
import { useCallback, useState } from "react";
import type { DroppableId } from "~/components/droppable";
import type { Card } from "~/server/types/models";
import { useGameManager } from "./game-manager";

declare module "@dnd-kit/core" {
  export interface DragStartEvent {
    active: { id: string; data: { current: Card } } | null;
  }

  export interface DragEndEvent {
    active: { id: string; data: { current: Card } };
    over: { id: DroppableId } | null;
  }
}

export const useDraggingManager = () => {
  const [draggableId, setDraggableId] = useState<string | null>(null);

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

      console.log("Move draggable", cardId, "from", from, "to", to);
      if (from === "player-hand" && to === "player-board") {
        // play card
        moveCard({ cardId, to: "player-board" });
      } else if (
        card.type === "spell" &&
        from === "player-hand" &&
        (to.startsWith("monster-opponent-") || to.startsWith("monster-player-"))
      ) {
        // trigger spell
        const targetCardId = to
          .replace("monster-opponent-", "")
          .replace("monster-player-", "");
        const target = getCardById(targetCardId);
        if (!target || target.type !== "monster") return;

        updateMonster({
          cardId: target.id,
          currentSize: target.currentSize - card.damage,
        });
        moveCard({
          cardId,
          to: "player-discard-pile",
        });
      } else if (
        card.type === "monster" &&
        from === "player-board" &&
        to.startsWith("monster-opponent-")
      ) {
        // trigger attack
        const defenderCardId = to.replace("monster-opponent-", "");
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

  const startDragging = useCallback((draggableId: string) => {
    setDraggableId(draggableId);
  }, []);
  const stopDragging = useCallback(() => {
    setDraggableId(null);
  }, []);

  return { startDragging, stopDragging, moveItem, draggableId };
};

export const useDndBehavior = (onDragEnd: (event: DragEndEvent) => void) => {
  const { active, over } = useDndContext();

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (!over) return;
      onDragEnd(event);
    },
    [onDragEnd, over],
  );

  return {
    handleDragEnd,
    isDragging: !!active,
    draggedId: active?.id,
    overId: over?.id,
  };
};

import { type CollisionDetection } from "@dnd-kit/core";

export const cursorIntersection: CollisionDetection = ({
  droppableContainers,
  pointerCoordinates,
}) => {
  if (!pointerCoordinates) {
    return [];
  }

  const collisions = droppableContainers
    .map((droppable) => {
      const rect = droppable.rect.current;

      if (!rect) {
        return null;
      }

      const isOver =
        pointerCoordinates.x >= rect.left &&
        pointerCoordinates.x <= rect.right &&
        pointerCoordinates.y >= rect.top &&
        pointerCoordinates.y <= rect.bottom;

      return isOver
        ? { id: droppable.id, data: { droppableContainer: droppable } }
        : null;
    })
    .filter(Boolean);

  // const firstCollision = collisions.length > 0 ? [getFirstCollision(collisions, "id")!] : [];
  return collisions;
};
