import React from "react";
import type { TDiscardPile } from "~/types/TDiscardPile";

export default function DiscardPile({
  children,
}: {
  discardPile: TDiscardPile;
  children: React.ReactNode;
}) {
  return <div className="h-card w-card bg-black text-white">{children}</div>;
}
