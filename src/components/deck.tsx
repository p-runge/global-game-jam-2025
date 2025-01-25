import type { TDeck } from "~/types/TDeck";

type Props = {
  deck: TDeck;
  children: React.ReactNode;
};
export function Deck({ children }: Props) {
  return <div className="h-card w-card bg-green-400">{children}</div>;
}
