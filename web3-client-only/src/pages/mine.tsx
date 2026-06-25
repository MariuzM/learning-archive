import { type GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { type ReactElement } from 'react';

import { Main } from '../layouts/main.layout';
import { Mine as MinePage } from '../views/Mine.view';
import { type NextPageWithLayout } from './_app';

const Mine: NextPageWithLayout = () => {
  return <MinePage />;
};

Mine.getLayout = (page: ReactElement) => <Main>{page}</Main>;

export default Mine;

export const getStaticProps: GetStaticProps = async (ctx) => {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale || 'en', ['common'])),
    },
  };
};
