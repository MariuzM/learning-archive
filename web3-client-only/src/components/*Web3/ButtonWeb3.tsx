import { useWeb3Modal } from '@web3modal/react';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import { ethereumClient } from '../../apis/initWeb3.api';
import { type TypeStatuses } from '../../types/web3.type';
import { Button } from '../Button/Button';
import { Text } from '../Text/Text';

export const ButtonWeb3 = () => {
  const web3 = useWeb3Modal();
  const acc = useAccount();
  const [isConnected, isConnectedSet] = useState<boolean>(false);

  useEffect(() => {
    isConnectedSet(acc.isConnected);
  }, [acc.isConnected]);

  return (
    <Button
      variant="contained"
      onClick={() => (isConnected ? ethereumClient.disconnect() : web3.open())}
      sx={(t) => ({
        textTransform: 'none',

        // width: { sx: '10px', sm: '10px', md: 'auto' },
        // width: '100px',
        width: { xs: '100px', sm: 'auto' },
        // height: { xs: '20px', sm: 'auto' },
        // wordBreak: 'keep-all',
        padding: { xs: '0.2rem', sm: '1rem' },
      })}
    >
      <TextToShow />
    </Button>
  );
};

const TextToShow = () => {
  const acc = useAccount();
  const [status, statusSet] = useState<TypeStatuses>();

  useEffect(() => {
    statusSet(acc.status);
  }, [acc.status]);

  return <Text>{status === 'connected' ? 'Disconnect' : 'Connect wallet'}</Text>;
};
