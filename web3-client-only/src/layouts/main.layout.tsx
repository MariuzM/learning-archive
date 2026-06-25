import { Content } from '../components/**Content/Content';
import { Footer } from '../components/**Footer/Footer';
import { Header } from '../components/**Header/Header';
import { NavBar } from '../components/*NavBar/NavBar';
import { NavBarMobile } from '../components/*NavBar/NavBarMobile';

export const Main = ({
  header,
  children,
}: {
  header?: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <>
      <Header>
        <NavBar header={header} />
      </Header>
      <Content>{children}</Content>
      <Footer>
        <NavBarMobile />
      </Footer>
    </>
  );
};
