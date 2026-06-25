import styled from '@emotion/styled';
import { useBalance } from 'wagmi';

export const GetBalance = ({ address }: { address: `0x${string}` | undefined }) => {
  const balance = useBalance({ address });
  return <SDiv className="">{balance.data?.formatted}</SDiv>;
};

const SDiv = styled.div``;
