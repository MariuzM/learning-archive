import { type GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { type ReactElement } from 'react';

import { Main } from '../layouts/main.layout';
import { Exchange as ExchangePage } from '../views/Exchange.view';
import { type NextPageWithLayout } from './_app';

const Exchange: NextPageWithLayout = () => {
  return <ExchangePage />;
};

Exchange.getLayout = (page: ReactElement) => <Main>{page}</Main>;

export default Exchange;

export const getStaticProps: GetStaticProps = async (ctx) => {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale || 'en', ['common'])),
    },
  };
};
