import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Card } from "~/components/card";
import Draggable from "~/components/draggable";
import Droppable, {
  isDroppableMonsterOpponent,
  isDroppableMonsterPlayer,
  type DroppableId,
} from "~/components/droppable";
import { useDraggingManager } from "~/hooks/dragging-manager";
import Frame from "~/hooks/frame";
import { useGameManager } from "~/hooks/game-manager";
import type { Card as TCard } from "~/server/types/models";
import { api } from "~/utils/api";
import { cn } from "~/utils/cn";

declare module "@dnd-kit/core" {
  export interface DragStartEvent {
    active: { id: string; data: { current: TCard } } | null;
  }

  export interface DragEndEvent {
    active: { id: string; data: { current: TCard } };
    over: { id: DroppableId } | null;
  }
}

export default function Game() {
  const router = useRouter();
  useEffect(() => {
    const gameId = document.cookie
      .split(";")
      .find((c) => c.includes("gameId"))
      ?.split("=")[1];
    const playerId = document.cookie
      .split(";")
      .find((c) => c.includes("playerId"))
      ?.split("=")[1];
    if (!gameId || !playerId) {
      void router.push("/");
    }
  }, [router]);

  const {
    turn,
    turnCount,
    cardLocations,
    moveCard,
    winner,
    getCardLocation,
    getCardById,
  } = useGameManager();

  const { startDragging, stopDragging, moveItem, draggableId } =
    useDraggingManager();

  const isDraggingSpellFromHand =
    draggableId !== null &&
    getCardById(draggableId)?.type === "spell" &&
    getCardLocation(draggableId) === "player-hand";
  const isDraggingMonsterFromBoard =
    draggableId !== null &&
    getCardById(draggableId)?.type === "monster" &&
    getCardLocation(draggableId) === "player-board";
  const isDraggingMonsterFromHand =
    draggableId !== null &&
    getCardById(draggableId)?.type === "monster" &&
    getCardLocation(draggableId) === "player-hand";
  const hasSpellTarget =
    cardLocations["player-board"].length > 0 ||
    cardLocations["opponent-board"].length > 0;

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    if (!active) return;

    // TODO: don't allow dragging cards if the conditions are not met. create a layer for that

    startDragging(active.id);
  }

  const { mutate: endTurn } = api.game.endTurn.useMutation();

  const canDragTo = (cardId: string, targetArea: DroppableId) => {
    const draggedCard = getCardById(cardId);
    if (!draggedCard) return false;

    const cardLocation = getCardLocation(cardId);
    if (
      cardLocation === "player-hand" &&
      draggedCard.type === "monster" &&
      targetArea === "player-board"
    ) {
      // play monster from hand to board
      return true;
    } else if (
      cardLocation === "player-hand" &&
      draggedCard.type === "spell" &&
      (isDroppableMonsterOpponent.test(targetArea) ||
        isDroppableMonsterPlayer.test(targetArea))
    ) {
      // target spell to player's or opponent's monster
      return true;
    } else if (
      cardLocation === "player-board" &&
      draggedCard.type === "monster" &&
      isDroppableMonsterOpponent.test(targetArea)
    ) {
      // attack opponent's monster
      return true;
    }

    return false;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    stopDragging();
    const { active, over } = event;
    if (!over) return;

    const draggedCard = getCardById(active.id);
    if (!draggedCard) return;

    if (canDragTo(active.id, over.id)) {
      moveItem(active.id, over.id);
    }
  };

  return (
    <Frame>
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="relative h-full bg-[url('/background.jpg')] bg-cover bg-center">
          {/* turn info */}
          <div className="absolute left-2 top-1/2 w-[200px] -translate-y-1/2 rounded bg-primary-darkest px-2 py-1 text-center">
            <div className="font-bold text-white">Round: {turnCount}</div>
            <hr className="my-2 border-t-xs text-white" />
            <div className="hyphens-auto break-words font-bold text-white">
              {turn === "player" ? "Your Turn" : "Opponent's Turn"}
            </div>
          </div>

          {/* game board anchor */}
          <div className="absolute left-1/2 top-1/2">
            {/* opponent */}
            <div className="absolute -top-[305px] left-[570px] -translate-x-1/2">
              <div className="relative h-card w-card">
                {cardLocations["opponent-discard-pile"].map((card) => (
                  <div className="absolute" key={card.id}>
                    <Card card={card} hidden={false}></Card>
                  </div>
                ))}
                {cardLocations["opponent-discard-pile"].length > 0 && (
                  <div className="absolute inset-0 rounded-lg bg-black/70"></div>
                )}
              </div>
            </div>

            <div className="absolute -top-[305px] z-10 -translate-x-1/2">
              <div className="flex h-card w-[940px] gap-[10px]">
                {cardLocations["opponent-board"].map((card) => (
                  <Droppable
                    key={card.id}
                    id={`monster-opponent-${card.id}`}
                    enabled={
                      isDraggingSpellFromHand || isDraggingMonsterFromBoard
                    }
                  >
                    <Card card={card} hidden={false}></Card>
                  </Droppable>
                ))}
              </div>
            </div>

            <div className="absolute -left-[570px] -top-[305px] -translate-x-1/2">
              <div className="h-card w-card">
                {cardLocations["opponent-deck"].map((card) => (
                  <div className="absolute" key={card.id}>
                    <Card card={card} hidden></Card>
                  </div>
                ))}
              </div>
            </div>

            {/* player */}
            <div className="absolute -bottom-[305px] left-[570px] -translate-x-1/2">
              <div className="h-card w-card">
                {cardLocations["player-deck"].map((card) => (
                  <div
                    className={cn(
                      "absolute",
                      turn === "player" && "cursor-pointer",
                    )}
                    key={card.id}
                    onClick={() => {
                      if (turn !== "player") return;
                      console.log("Draw card from player deck");
                      if (cardLocations["player-hand"].length < 5) {
                        moveCard({ cardId: card.id, to: "player-hand" });
                      }
                    }}
                  >
                    <Card card={card} hidden></Card>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -bottom-[305px] z-10 -translate-x-1/2">
              <Droppable id="player-board" enabled={isDraggingMonsterFromHand}>
                <div className="flex h-card w-[940px] gap-[10px]">
                  {cardLocations["player-board"].map((card) => (
                    <Droppable
                      key={card.id}
                      id={`monster-player-${card.id}`}
                      enabled={isDraggingSpellFromHand}
                    >
                      <Draggable
                        id={card.id}
                        enabled={turn === "player"}
                        droppableIds={cardLocations["opponent-board"]
                          .filter(
                            (c) =>
                              card.type === "monster" &&
                              c.type === "monster" &&
                              c.currentSize < card.currentSize,
                          )
                          .map(
                            (c) => `monster-opponent-${c.id}` as DroppableId,
                          )}
                      >
                        <Card card={card} hidden={false}></Card>
                      </Draggable>
                    </Droppable>
                  ))}
                </div>
              </Droppable>
            </div>
            <div className="absolute -bottom-[305px] right-[570px] translate-x-1/2">
              <div className="relative h-card w-card">
                {cardLocations["player-discard-pile"].map((card) => (
                  <div className="absolute" key={card.id}>
                    <Card card={card} hidden={false}></Card>
                  </div>
                ))}
                {cardLocations["player-discard-pile"].length > 0 && (
                  <div className="absolute inset-0 rounded-lg bg-black/70"></div>
                )}
              </div>
            </div>
          </div>

          {/* hands */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 scale-50">
            <div className="pointer-events-none flex">
              {cardLocations["opponent-hand"].map((card) => (
                <div
                  key={card.id}
                  className="pointer-events-auto -mx-[45px] origin-top"
                >
                  <Card card={card} hidden></Card>
                </div>
              ))}
            </div>
          </div>
          {turn === "player" && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border bg-primary p-4 text-center shadow-xl transition-all hover:scale-110 hover:bg-primary-dark"
              onClick={() => endTurn()}
            >
              End Turn
            </button>
          )}
          <div className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2 transition-transform hover:translate-y-0">
            <div className="pointer-events-none flex">
              {cardLocations["player-hand"].map((card) => (
                <div
                  key={card.id}
                  className="pointer-events-auto origin-bottom transition-transform hover:z-10 hover:scale-125"
                >
                  <Draggable
                    id={card.id}
                    enabled={
                      turn === "player" &&
                      (getCardById(card.id)?.type === "monster" ||
                        (hasSpellTarget &&
                          getCardById(card.id)?.type === "spell"))
                    }
                    droppableIds={
                      cardLocations["player-board"].length < 5
                        ? ["player-board"]
                        : []
                    }
                  >
                    <Card card={card} hidden={false}></Card>
                  </Draggable>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DndContext>
      {winner !== null && (
        <div className="">
          <div className="absolute inset-0 left-1/4 top-1/4 h-1/2 w-1/2 content-center justify-center bg-black/80 text-center text-white">
            {winner === "player" && <p>You Won</p>}
            {winner === "opponent" && <p>You Lost</p>}
          </div>
        </div>
      )}
    </Frame>
  );
}
