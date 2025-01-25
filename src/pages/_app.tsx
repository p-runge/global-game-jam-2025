import { GeistSans } from "geist/font/sans";
import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { CardLocationManagerProvider } from "~/hooks/card-location-manager";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <div className={GeistSans.className}>
      <CardLocationManagerProvider>
        <Component {...pageProps} />
      </CardLocationManagerProvider>
    </div>
  );
};

export default api.withTRPC(MyApp);
