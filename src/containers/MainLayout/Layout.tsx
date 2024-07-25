import React from 'react';
import styles from './styles.module.scss';

interface MainLayoutProps {
  title: string
}

export const MainLayout: React.FC<MainLayoutProps> = ({ title }) => {

  return (
    <>
      <h3 className={styles.title}>{title}</h3>
    </>
  );
};
