import { useRouter } from "next/router";
import { api } from "~/utils/api";

export default function Lobby() {
  const router = useRouter();
  api.game.lobby.useSubscription(undefined, {
    onData: ({ gameId, playerId }) => {
      document.cookie = `gameId=${gameId}`;
      document.cookie = `playerId=${playerId}`;

      void router.push(`/game/${gameId}`);
    },
  });

  return <div>Lobby</div>;
}
