import React from "react";
import type { TGraveyard } from "~/types/TGraveyard";

export default function Graveyard({ graveyard }: { graveyard: TGraveyard }) {
  return (
    <div
      className={`${graveyard.opponentsGraveyard ? "col-start-1" : "col-start-3"} border-2`}
    >
      {graveyard.name}
    </div>
  );
}
