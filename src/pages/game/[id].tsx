import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import Head from "next/head";
import { Card } from "~/components/card";
import Draggable from "~/components/draggable";
import Droppable from "~/components/droppable";
import { Frame } from "~/components/frame";
import { useGameManager } from "~/hooks/game-manager";
import { useDraggingManager, type DroppableId } from "~/hooks/dragging-manager";

export default function Game() {
  const { turn, turnCount, cardLocations, moveCard } = useGameManager();
  const { startDragging, moveItem, draggable } = useDraggingManager();

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;

    if (!active?.id || !active.data.current) return;

    const droppableIds = active.data.current.droppableIds as DroppableId[];

    const allCardsInGame = Object.values(cardLocations).reduce(
      (acc, cards) => [...acc, ...cards],
      [],
    );

    const draggingCard = allCardsInGame.find((card) => card.id === active.id);
    if (!draggingCard) return;

    startDragging({
      id: draggingCard.id,
      droppableIds,
    });
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    startDragging(null);

    if (!over?.id) return;

    if (typeof active?.id !== "string") {
      console.error("Active id is not a string");
      return;
    }
    if (typeof over?.id !== "string") {
      console.error("Over id is not a string");
      return;
    }

    if (over) {
      moveItem(active.id, over.id as DroppableId);
    }
  };

  return (
    <Frame>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="relative h-full bg-blue-500">
          {/* turn info */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-center">
            <div className="text-3xl font-bold">Turn Count: {turnCount}</div>
            <div className="text-3xl font-bold">
              {turn === "player" ? "Your Turn" : "Opponent's Turn"}
            </div>
          </div>

          {/* game board anchor */}
          <div className="absolute left-1/2 top-1/2">
            {/* opponent */}
            <div className="absolute -top-[305px] left-[570px] -translate-x-1/2">
              <div className="h-card w-card bg-black text-white">
                {cardLocations["opponent-discard-pile"].map((card) => (
                  <div key={card.id}>
                    <Card card={card} hidden={false}></Card>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -top-[305px] -translate-x-1/2">
              <div className="flex h-card w-[940px] gap-[10px] bg-red-400">
                {cardLocations["opponent-board"].map((card) => (
                  <div key={card.id}>
                    {draggable?.droppableIds.find(
                      (id) => id === `opponent-card-${card.id}`,
                    ) ? (
                      <Droppable id={`opponent-card-${card.id}`}>
                        <Card card={card} hidden={false}></Card>
                      </Droppable>
                    ) : (
                      <Card card={card} hidden={false}></Card>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -left-[570px] -top-[305px] -translate-x-1/2">
              <div className="h-card w-card bg-green-400">
                {cardLocations["opponent-deck"].map((card) => (
                  <div className="absolute" key={card.id}>
                    <Card card={card} hidden></Card>
                  </div>
                ))}
              </div>
            </div>

            {/* player */}
            <div className="absolute -bottom-[305px] left-[570px] -translate-x-1/2">
              <div className="h-card w-card bg-green-400">
                {cardLocations["player-deck"].map((card) => (
                  <div
                    className="absolute cursor-pointer"
                    key={card.id}
                    onClick={() => {
                      console.log("draw card from player deck");
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

            <div className="absolute -bottom-[305px] -translate-x-1/2">
              {(() => {
                const content = (
                  <div className="flex h-card w-[940px] gap-[10px] bg-red-400">
                    {cardLocations["player-board"].map((card) => (
                      <div key={card.id}>
                        <Draggable
                          id={card.id}
                          droppableIds={cardLocations["opponent-board"]
                            .filter(
                              (c) =>
                                card.type === "monster" &&
                                c.type === "monster" &&
                                c.currentSize < card.currentSize,
                            )
                            .map((c) => `opponent-card-${c.id}` as DroppableId)}
                        >
                          <Card card={card} hidden={false}></Card>
                        </Draggable>
                      </div>
                    ))}
                  </div>
                );
                return draggable?.droppableIds.includes("player-board") ? (
                  <Droppable id="player-board">{content}</Droppable>
                ) : (
                  <>{content}</>
                );
              })()}
            </div>

            <div className="absolute -bottom-[305px] right-[570px] translate-x-1/2">
              <div className="h-card w-card bg-black text-white">
                {cardLocations["player-discard-pile"].map((card) => (
                  <div key={card.id}>
                    <Card card={card} hidden={false}></Card>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* hands */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2">
            <div className="pointer-events-none flex">
              {cardLocations["opponent-hand"].map((card) => (
                <div
                  key={card.id}
                  className="pointer-events-auto origin-top scale-50"
                >
                  <Card card={card} hidden={false}></Card>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
            <div className="pointer-events-none flex">
              {cardLocations["player-hand"].map((card) => (
                <div
                  key={card.id}
                  className="pointer-events-auto -mx-[45px] origin-bottom scale-50 transition-transform hover:z-10 hover:scale-100"
                >
                  <Draggable
                    id={card.id}
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
    </Frame>
  );
}
