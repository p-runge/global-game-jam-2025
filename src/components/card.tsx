// import { GiLiquidSoap } from "react-icons/gi";
// import { GiSoap } from "react-icons/gi";
import { TbRulerMeasure2 } from "react-icons/tb";
import type { Card, Monster, Spell } from "~/server/types/models";
import { cn } from "~/utils/cn";
import FittingText from "./fitting-text";

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
    <div className="relative flex h-card w-card flex-col justify-between rounded-lg border border-black bg-[url('/bubble.webp')] bg-cover bg-center text-white shadow-sm"></div>
  );
}

function SpellCard({ card }: { card: Spell }) {
  return (
    <div
      style={{ backgroundImage: `url(/cards/${card.image})` }}
      className="relative flex h-card w-card flex-col justify-between overflow-hidden rounded-lg border border-black bg-cover bg-center text-white shadow-sm"
    >
      <div className="h-4 bg-black font-bold tracking-tight text-white">
        <FittingText>{card.name}</FittingText>
      </div>

      <div
        className={cn(
          "flex flex-col items-center gap-2",
          card.damage > 0 ? "bg-orange" : "bg-primary",
        )}
      >
        {/* render only stats with their value and regarding icons if they are not 0 */}
        {card.damage !== 0 && (
          <div className="flex w-full items-center justify-center">
            <span className="text-xl">
              <TbRulerMeasure2 />
            </span>
            <span className="text-xl">{`${card.damage > 0 ? "-" : "+"}${Math.abs(card.damage)}`}</span>
          </div>
        )}
        {/*
            // TODO: replace damage with size and stability as soon as they are implemented
          */}
        {/* {card.size !== 0 && (
          <div className="flex w-full items-center justify-center">
            <span className="text-xl">
              <MdOutlineHealthAndSafety />
            </span>
            <span className="text-xl">{`${card.size > 0 ? "-" : "+"}${Math.abs(card.size)}`}</span>
          </div>
        )}
        {card.stability !== 0 && (
          <div className="flex w-full items-center justify-center">
            <span className="text-xl">
              <MdOutlineHealthAndSafety />
            </span>
            <span className="text-xl">{`${card.stability > 0 ? "-" : "+"}${Math.abs(card.stability)}`}</span>
          </div>
        )} */}
      </div>
    </div>
  );
}

function MonsterCard({ card }: { card: Monster }) {
  return (
    <div
      style={{ backgroundImage: `url(/cards/${card.image})` }}
      className="relative flex h-card w-card flex-col justify-between rounded-lg border border-black bg-cover bg-center shadow-sm"
    >
      <div className="h-4 overflow-hidden bg-black font-bold tracking-tight text-white">
        <FittingText>{card.name}</FittingText>
      </div>

      <div className="flex items-center justify-center">
        <Value
          value={card.currentSize}
          className="h-10 w-10 bg-primary-light text-xl"
        />

        <Value
          value={card.cost}
          className="absolute -right-1 -top-1 h-4 w-4 border-sm bg-white text-xs text-black"
        />
      </div>

      <Value
        value={card.currentStability}
        className="absolute bottom-0 right-0 h-5 w-5 border-sm bg-orange text-sm"
      />
    </div>
  );
}

function Value({ value, className }: { value: number; className: string }) {
  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-full border",
        className,
      )}
    >
      {value}
    </span>
  );
}
