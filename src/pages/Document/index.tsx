import styles from './styles.module.scss';
export const DocumentPage = () => {
  return(
    <>
      <object className={styles.doc} type={'application/pdf'} data={'src/assets/Справка.pdf'}/>
    </>
  )
}