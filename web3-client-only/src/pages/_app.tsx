import { CssBaseline } from '@mui/material';
import GlobalStyles from '@mui/material/GlobalStyles';
import { ThemeProvider } from '@mui/material/styles';
import { Web3Modal } from '@web3modal/react';
import { type NextPage } from 'next';
import { type AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import { type ReactElement, type ReactNode, Fragment } from 'react';
import { WagmiConfig } from 'wagmi';

import { ethereumClient, wagmiClient } from '../apis/initWeb3.api';
import { globalStyles } from '../styles/global.style';
import { theme } from '../styles/theme.style';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const App = ({ Component, pageProps }: AppPropsWithLayout) => {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <Fragment>
      <WagmiConfig client={wagmiClient}>
        <ThemeProvider theme={theme}>
          {getLayout(
            <>
              <CssBaseline />
              <GlobalStyles styles={globalStyles} />
              <Component {...pageProps} />
            </>
          )}
        </ThemeProvider>
      </WagmiConfig>
      <Web3Modal projectId={process.env.NEXT_PUBLIC_PROJECT_ID} ethereumClient={ethereumClient} />
    </Fragment>
  );
};

export default appWithTranslation(App);
