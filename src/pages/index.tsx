import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { Frame } from "~/components/frame";
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
    <Frame>
      <div className="flex h-full items-center justify-center">
        <div
          className="relative flex h-[1080px] w-[1080px] flex-col rounded-lg p-4"
          style={{
            backgroundImage: "url('/splash.jpeg')",
            backgroundSize: "cover",
          }}
        >
          <div className="absolute bottom-[10%] left-1/2 flex -translate-x-1/2 flex-col gap-2">
            <button
              className={cn(
                "from-yellow to-orange rounded-full border-[8px] border-black bg-gradient-to-b px-8 py-4 text-6xl font-bold text-black transition-all",
                "hover:scale-110 hover:bg-opacity-100 hover:shadow-2xl",
              )}
              onClick={() => join()}
            >
              Quick Play
            </button>
          </div>
        </div>
      </div>
    </Frame>
  );
}
