import { useRouter } from "next/router";
import { api } from "~/utils/api";

export default function Lobby() {
  const router = useRouter();
  const { data } = api.game.lobby.useSubscription(undefined, {
    onData: (data) => {
      console.log("meine Daten", data);
      void router.push(`/game/${data}`);
    },
    onError: (error) => {
      console.log("wtf error:", error);
    },
    onStarted: () => {
      console.log("wtf started", data);
    },
  });
  console.log("meine Daten", data);

  return <div>Lobby</div>;
}
