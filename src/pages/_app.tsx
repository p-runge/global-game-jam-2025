import { GeistSans } from "geist/font/sans";
import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { GameManagerProvider } from "~/hooks/game-manager";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <div className={GeistSans.className}>
      <GameManagerProvider>
        <Component {...pageProps} />
      </GameManagerProvider>
    </div>
  );
};

export default api.withTRPC(MyApp);
