import "@total-typescript/ts-reset";
import { GeistSans } from "geist/font/sans";
import { type AppType } from "next/app";
import Head from "next/head";
import { GameManagerProvider } from "~/hooks/game-manager";
import "~/styles/globals.css";
import { api } from "~/utils/api";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <div className={GeistSans.className}>
      <Head>
        <title>Magic: The Bubbling</title>
        <meta
          name="description"
          content="Slurp smaller bubbles to grow bigger and win the game"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <GameManagerProvider>
        <Component {...pageProps} />
      </GameManagerProvider>
    </div>
  );
};

export default api.withTRPC(MyApp);
