import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { cn } from "~/utils/cn";

export default function Home() {
  const router = useRouter();
  function join() {
    console.log("join");
    void router.push("/lobby");
  }

  useEffect(() => {
    // clear cookies
    document.cookie = "gameId=";
    document.cookie = "playerId=";
  }, []);

  return (
    <div>
      <div className="flex h-screen items-center justify-center bg-gray-800">
        <div
          className="relative flex h-[500px] w-[500px] flex-col rounded-lg p-4"
          style={{
            backgroundImage: "url('/splash.jpeg')",
            backgroundSize: "cover",
          }}
        >
          <div className="absolute bottom-[50px] left-1/2 flex -translate-x-1/2 flex-col gap-2">
            <button
              className={cn(
                "rounded-lg border border-white bg-amber-600 px-2 py-1 text-3xl font-bold text-white transition-colors",
                "hover:bg-amber-800",
              )}
              onClick={() => join()}
            >
              QuickPlay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
