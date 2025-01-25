import { createContext, useCallback, useContext, useState } from "react";
import { CARDS } from "~/assets/cards";
import type { TCard } from "~/components/card";

type CardLocation =
  | "player-deck"
  | "player-hand"
  | "player-board"
  | "player-discard-pile"
  | "opponent-deck"
  | "opponent-hand"
  | "opponent-board"
  | "opponent-discard-pile";

const initialLocations: Record<CardLocation, TCard[]> = {
  "player-deck": CARDS.filter((_, i) => i % 8 === 0),
  "player-hand": CARDS.filter((_, i) => i % 8 === 1),
  "player-board": CARDS.filter((_, i) => i % 8 === 2),
  "player-discard-pile": CARDS.filter((_, i) => i % 8 === 3),
  "opponent-deck": CARDS.filter((_, i) => i % 8 === 4),
  "opponent-hand": CARDS.filter((_, i) => i % 8 === 5),
  "opponent-board": CARDS.filter((_, i) => i % 8 === 6),
  "opponent-discard-pile": CARDS.filter((_, i) => i % 8 === 7),
};

type CardLocationManager = {
  cardLocations: Record<CardLocation, TCard[]>;
  moveCard: (cardId: string, to: CardLocation) => void;
};
const CardLocationManagerContext = createContext<
  CardLocationManager | undefined
>(undefined);

export function CardLocationManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cardLocations, setCardLocations] =
    useState<Record<CardLocation, TCard[]>>(initialLocations);

  const moveCard = useCallback((cardId: string, to: CardLocation) => {
    // prevent moving card to the same location
    const movingCard = CARDS.find((c) => c.id === cardId);
    if (!movingCard) return;

    console.log("move card", cardId, "to", to);

    // update card locations
    setCardLocations((prevLocations) => {
      if (!movingCard) return prevLocations;

      const newLocations = { ...prevLocations };
      (Object.entries(newLocations) as [CardLocation, TCard[]][]).forEach(
        ([location, cards]) => {
          // remove card from all locations
          newLocations[location] = cards.filter((c) => c.id !== cardId);

          // add card to new location
          if (location === to) {
            newLocations[to] = [...cards, movingCard];
          }
        },
      );

      return newLocations;
    });
  }, []);

  return (
    <CardLocationManagerContext.Provider
      value={{
        cardLocations,
        moveCard,
      }}
    >
      {children}
    </CardLocationManagerContext.Provider>
  );
}

export function useCardLocationManager() {
  const context = useContext(CardLocationManagerContext);
  if (!context) {
    throw new Error(
      "useCardLocationManager must be used within a CardLocationManagerProvider",
    );
  }

  return context;
}
