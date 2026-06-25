import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import { hideString } from '../../utils/common';

export const GetAddress = () => {
  const acc = useAccount();
  const [address, addressSet] = useState<string>('');

  useEffect(() => {
    addressSet(acc.address as string);
  }, [acc]);

  return <div>{hideString(address)}</div>;
};
