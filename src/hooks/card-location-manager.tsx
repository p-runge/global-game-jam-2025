import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { CARDS } from "~/assets/cards";
import { initMonster, type Card } from "~/types/models";
import { api } from "~/utils/api";

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
  const [cardLocations, setCardLocations] = useState<CardLocationMap>({
    "player-deck": [],
    "player-hand": [],
    "player-board": [],
    "player-discard-pile": [],
    "opponent-deck": [],
    "opponent-hand": [],
    "opponent-board": [],
    "opponent-discard-pile": [],
  });

  const { data } = api.card.getAllMonsters.useQuery();

  useEffect(() => {
    if (!data) return;

    const allCards = data.map((card) =>
      initMonster({
        id: card.id,
        name: card.name,
        image: card.image,
        type: "monster",
        cost: card.cost,
        size: card.size,
        stability: card.stability,
      }),
    );

    setCardLocations((prevLocations) => ({
      ...prevLocations,
      "player-hand": allCards.filter((_, i) => i % 2 === 0),
      "opponent-hand": allCards.filter((_, i) => i % 2 === 1),
    }));
  }, [data]);

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
