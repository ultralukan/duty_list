import { Outlet } from 'react-router-dom';
import {Header} from "../../components/Header";
import styles from './styles.module.scss';
export const Layout = () => {

  return (
    <>
      <nav>
        <Header />
      </nav>
      <main className={styles.main}>
        <Outlet />
      </main>
    </>
  );
};
