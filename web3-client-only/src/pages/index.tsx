import { type GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { type ReactElement } from 'react';

import { HomeHeader } from '../components/**Header/HomeHeader';
import { useIsMounted } from '../hooks/useIsMounted.hook';
import { Main } from '../layouts/main.layout';
import { Home } from '../views/Home.view';
import { type NextPageWithLayout } from './_app';

const Page: NextPageWithLayout = () => {
  const isMounted = useIsMounted();
  if (!isMounted) return null;
  return (
    <>
      <Test />
      <Home />
    </>
  );
};

Page.getLayout = (page: ReactElement) => <Main header={<HomeHeader />}>{page}</Main>;

export default Page;

export const getStaticProps: GetStaticProps = async (ctx) => {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale || 'en', ['common'])),
    },
  };
};

export const Test = () => {
  // console.log('🚀 ~ acc', acc);
  // const token = useToken({ address: '0x9a40145E4397cD05ACa8F96A3744C3Af814C7c46' });
  // console.log('🚀 ~ token', token.data);

  // const balance = useBalance({ address: acc.address });
  // const network = useNetwork();
  // const blockNr = useBlockNumber();

  return (
    <>
      {/* <Text>Name: {name}</Text> */}
      {/* <Profile address={acc.address} />
      <Text>Status: {acc.status}</Text>
      <Text>{acc.address}</Text>
      <Text>Symbol: {balance.data?.symbol}</Text>
      <Text>Value: {balance.data?.formatted}</Text>
      <Text>Network: {network.chain?.network}</Text>
      <Text>Block Number: {blockNr.data?.toString()}</Text> */}
    </>
  );
};
