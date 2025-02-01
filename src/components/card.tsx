// import { GiLiquidSoap } from "react-icons/gi";
// import { GiSoap } from "react-icons/gi";
import { TbRulerMeasure2 } from "react-icons/tb";
import type { Card, Monster, Spell } from "~/server/types/models";
import { cn } from "~/utils/cn";

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

      <div
        className={cn(
          "flex flex-col items-center gap-2 p-2",
          card.damage > 0 ? "bg-red-500" : "bg-green-500",
        )}
      >
        {/* render only stats with their value and regarding icons if they are not 0 */}
        {card.damage !== 0 && (
          <div className="flex w-full items-center justify-center">
            <span className="text-6xl">
              <TbRulerMeasure2 />
            </span>
            <span className="text-6xl">{`${card.damage > 0 ? "-" : "+"}${Math.abs(card.damage)}`}</span>
          </div>
        )}
        {/*
            // TODO: replace damage with size and stability as soon as they are implemented
          */}
        {/* {card.size !== 0 && (
          <div className="flex w-full items-center justify-center">
            <span className="text-6xl">
              <MdOutlineHealthAndSafety />
            </span>
            <span className="text-6xl">{`${card.size > 0 ? "-" : "+"}${Math.abs(card.size)}`}</span>
          </div>
        )}
        {card.stability !== 0 && (
          <div className="flex w-full items-center justify-center">
            <span className="text-6xl">
              <MdOutlineHealthAndSafety />
            </span>
            <span className="text-6xl">{`${card.stability > 0 ? "-" : "+"}${Math.abs(card.stability)}`}</span>
          </div>
        )} */}
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
