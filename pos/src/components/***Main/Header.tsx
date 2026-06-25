import styled from '@emotion/styled';

import { Button } from '../Buttons/Button';
import { Clock } from '../Clock/Clock';
import { IconMenu } from '../Icons/IconMenu';
import { IconSearch } from '../Icons/IconSearch';
import { Input } from '../Inputs/Input';
import { Status } from '../Status/Status';

export const Header = () => {
  return (
    <SDiv className="header block-padding flex-row items-center w-full gap-4">
      <div className="header__title">
        <Clock />
      </div>

      <Status />

      <Input label="Search" icon={<IconSearch size={15} />} />
      <Button icon={<IconMenu size={15} />} isIconCenter color="violet" variant="light" />
    </SDiv>
  );
};

const SDiv = styled.div``;
