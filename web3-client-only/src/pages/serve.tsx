import { type GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { type ReactElement } from 'react';

import { Main } from '../layouts/main.layout';
import { Serve as ServePage } from '../views/Serve.view';
import { type NextPageWithLayout } from './_app';

const Serve: NextPageWithLayout = () => {
  return <ServePage />;
};

Serve.getLayout = (page: ReactElement) => <Main>{page}</Main>;

export default Serve;

export const getStaticProps: GetStaticProps = async (ctx) => {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale || 'en', ['common'])),
    },
  };
};
