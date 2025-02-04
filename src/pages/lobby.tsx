import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { set } from "zod";
import { Frame } from "~/components/frame";
import { api } from "~/utils/api";

export default function Lobby() {
  const router = useRouter();

  const [status, setStatus] = useState<"waiting" | "ready">("waiting");

  api.game.lobby.useSubscription(undefined, {
    onData: ({ gameId, playerId }) => {
      document.cookie = `gameId=${gameId}`;
      document.cookie = `playerId=${playerId}`;

      setStatus("ready");
    },
  });

  useEffect(() => {
    if (status !== "ready") {
      return;
    }

    const interval = setInterval(() => {
      const gameId = document.cookie.replace(
        /(?:(?:^|.*;\s*)gameId\s*=\s*([^;]*).*$)|^.*$/,
        "$1",
      );
      void router.push(`/game/${gameId}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [status, router]);

  return (
    <Frame>
      <div className="flex h-full items-center justify-center">
        <div className="bg-primary items-center rounded-lg p-4 text-center">
          {status === "ready" ? (
            <>
              <h2 className="text-xl">Opponent found!</h2>
              <p className="text-sm">Match is starting...</p>
            </>
          ) : (
            <>
              <h2 className="mb-2 text-xl">Waiting for opponent...</h2>
              {/* loading spinner */}
              <div className="border-primary-darkest border-t-sm mx-auto h-8 w-8 animate-spin rounded-full" />
            </>
          )}
        </div>
      </div>
    </Frame>
  );
}
