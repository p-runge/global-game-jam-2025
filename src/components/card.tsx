import type { Card, Monster, Spell } from "~/server/types/models";

export function Card({ card, hidden }: { card: Card; hidden: boolean }) {
  if (hidden) {
    return <BackSideCard />;
  }
  if (card.type === "monster") {
    return <MonsterCard card={card} />;
  }
  if (card.type === "spell") {
    return <SpellCard card={card} />;
  }
}

function BackSideCard() {
  return (
    <div className="relative flex h-card w-card flex-col justify-between rounded-lg border-4 border-black bg-gray-800 bg-[url('/bubble.webp')] bg-cover bg-center text-white shadow-sm hover:bg-gray-700"></div>
  );
}

function SpellCard({ card }: { card: Spell }) {
  return (
    <div
      style={{ backgroundImage: `url(/${card.image})` }}
      className={`relative flex h-card w-card flex-col justify-between rounded-lg border-4 border-black bg-gray-800 bg-cover bg-center text-white shadow-sm hover:bg-gray-700`}
    >
      <div className="mb-2 text-xl font-bold tracking-tight">{card.name}</div>

      <div className="flex items-center justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border bg-[url('/bubble-plain.jpg')] bg-cover p-2 text-center text-[80px] font-normal leading-none">
          {card.damage}
        </div>
      </div>
    </div>
  );
}

function MonsterCard({ card }: { card: Monster }) {
  return (
    <div
      style={{ backgroundImage: `url(/${card.image})` }}
      className={`relative flex h-card w-card flex-col justify-between rounded-lg border-4 border-black bg-gray-800 bg-cover bg-center text-white shadow-sm hover:bg-gray-700`}
    >
      <div className="mb-2 text-xl font-bold tracking-tight">{card.name}</div>

      <div className="flex items-center justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border bg-[url('/bubble-plain.jpg')] bg-cover p-2 text-center text-[80px] font-normal leading-none">
          {card.currentSize}
        </div>

        <div className="absolute right-2 top-2 flex aspect-square h-7 w-7 items-center justify-center rounded-full border bg-[url('/bubble-plain.jpg')] bg-cover py-2">
          {card.cost}
        </div>
      </div>
      <div className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full border bg-[url('/bubble-plain.jpg')] bg-cover text-2xl">
        {card.currentStability}
      </div>
    </div>
  );
}
