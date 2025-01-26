import { useRouter } from "next/router";
import React, { useEffect } from "react";

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
        <div className="flex flex-col rounded-lg bg-white p-4">
          <h1 className="text-center text-2xl font-bold">Lobby</h1>
          <div className="mt-4 flex flex-col">
            <div className="flex items-center justify-between border-b p-2">
              <button
                className="rounded-lg bg-blue-500 px-2 py-1 text-white"
                onClick={() => join()}
              >
                QuickPlay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
