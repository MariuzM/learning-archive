import styled from '@emotion/styled';

import { Modal } from '../components/***Main/components/Modal';
import { Content } from '../components/***Main/Content';
import { Footer } from '../components/***Main/Footer';
import { Header } from '../components/***Main/Header';
import { Sidebar } from '../components/***Main/Sidebar';

export const Pos = () => {
  return (
    <SDiv className="flex-row">
      <Modal />

      <div className="panel__left flex-col">
        <Header />
        <Content />
        <Footer />
      </div>

      <div className="panel__right">
        <Sidebar />
      </div>
    </SDiv>
  );
};

const SDiv = styled.div`
  justify-content: space-between;
  width: 100%;

  .panel__left,
  .panel__right {
    height: 100vh;
  }

  .panel__left {
    justify-content: space-between;
    width: 100%;
  }

  .panel__right {
    display: block;
    position: relative;
    width: 600px;
  }
`;
