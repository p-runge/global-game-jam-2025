export default function Lobby() {
  const user = ["user1", "user2", "user3", "user4"];
  function join() {
    //TODO: join game via socket
    console.log("join");
  }

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
