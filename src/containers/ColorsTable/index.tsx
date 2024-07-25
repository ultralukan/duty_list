import styles from './styles.module.scss';

export const ColorsTable = ({colors, isPersonal=false}) => {
  return(
    <div className={styles.table}>
      {
        colors.includes('white') && (
          <div className={styles.container}>
            <div className={styles.white}></div>
            <div>Будущее дежурство</div>
          </div>
        )
      }
      {
        colors.includes('blue') && (
          <div className={styles.container}>
            <div className={styles.blue}></div>
            <div>{isPersonal ? 'Неподтвержденное дежурство' : 'Неназначенный интервал'}</div>
          </div>
        )
      }
      {
        colors.includes('green') && (
          <div className={styles.container}>
            <div className={styles.green}></div>
            <div>Текущее дежурство</div>
          </div>
        )
      }
      {
        colors.includes('gray') && (
          <div className={styles.container}>
            <div className={styles.gray}></div>
            <div>Прошедшее дежурство</div>
          </div>
        )
      }
      {
        colors.includes('red') && (
          <div className={styles.container}>
            <div className={styles.red}></div>
            <div>Неподтвержденное дежурство</div>
          </div>
        )
      }
      {
        colors.includes('yellow') && (
          <div className={styles.container}>
            <div className={styles.yellow}></div>
            <div>Дежурство неактивного пользователя</div>
          </div>
        )
      }
    </div>
  )
}