import { createContext, useCallback, useContext, useState } from "react";
import { CARDS } from "~/assets/cards";
import type { Card } from "~/types/models";

type CardLocation =
  | "player-deck"
  | "player-hand"
  | "player-board"
  | "player-discard-pile"
  | "opponent-deck"
  | "opponent-hand"
  | "opponent-board"
  | "opponent-discard-pile";

type CardLocationMap = Record<CardLocation, Card[]>;

type CardLocationManager = {
  cardLocations: CardLocationMap;
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
  const [allCards] = useState<Card[]>(CARDS);
  const [cardLocations, setCardLocations] = useState<CardLocationMap>({
    "player-deck": allCards.filter((_, i) => i % 8 === 0),
    "player-hand": allCards.filter((_, i) => i % 8 === 1),
    "player-board": allCards.filter((_, i) => i % 8 === 2),
    "player-discard-pile": allCards.filter((_, i) => i % 8 === 3),
    "opponent-deck": allCards.filter((_, i) => i % 8 === 4),
    "opponent-hand": allCards.filter((_, i) => i % 8 === 5),
    "opponent-board": allCards.filter((_, i) => i % 8 === 6),
    "opponent-discard-pile": allCards.filter((_, i) => i % 8 === 7),
  });

  const moveCard = useCallback((cardId: string, to: CardLocation) => {
    // prevent moving card to the same location
    const movingCard = CARDS.find((c) => c.id === cardId);
    if (!movingCard) return;

    console.log("move card", cardId, "to", to);

    // update card locations
    setCardLocations((prevLocations) => {
      const newLocations = { ...prevLocations };
      (Object.entries(newLocations) as [CardLocation, Card[]][]).forEach(
        ([location, cards]) => {
          // remove card from all locations
          newLocations[location] = cards.filter((card) => card.id !== cardId);

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
