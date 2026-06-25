import { EthereumClient, modalConnectors, walletConnectProvider } from '@web3modal/ethereum';
import { configureChains, createClient, mainnet } from 'wagmi';

const { chains, provider } = configureChains(
  [mainnet],
  [walletConnectProvider({ projectId: process.env.NEXT_PUBLIC_PROJECT_ID })]
);
export const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({ appName: 'web3Modal', chains }),
  logger: { warn: (msg) => console.log(msg) },
  provider,
});
export const ethereumClient = new EthereumClient(wagmiClient, chains);
// (async () => {
//   const account = ethereumClient.getAccount();
//   if (account.address) {
//     const balance = await ethereumClient.fetchBalance({ address: account.address });
//     useStoreWeb3.setState({
//       web3: {
//         account: {
//           address: account.address,
//           isConnected: account.isConnected,
//         },
//         balance: {
//           symbol: balance.symbol,
//         },
//       },
//     });
//     return;
//   }
// })();
