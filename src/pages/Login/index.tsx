import {Box, Paper} from "@mui/material";
import styles from './styles.module.scss';
import {useEffect, useState} from "react";
import {useLoginAuthMutation} from "../../api/auth.ts";
import {useDispatch} from "react-redux";
import {login} from "../../slices/auth.ts";
import {useNavigate} from "react-router-dom";
import Cookies from "js-cookie";

export const LoginPage = () => {
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [authenticate] = useLoginAuthMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      const response = await authenticate(formData);
      dispatch(login(response.data));
      navigate('/groups')
    } catch (e: any) {
      setError(e)
    }
  };

  useEffect(() => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
  }, [])

  return (
    <div className={styles.loginPage}>
      <Box className={styles.loginPageContainer} maxWidth="sm">
        <Paper className={styles.loginForm} elevation={10}>
          <Box textAlign="center" mb={2}>
            <div className={styles.logo}>
              <img
                src=""
                alt="Logo"
              />
            </div>
          </Box>
          <h3 className={styles.title}>График дежурств</h3>
          <form onSubmit={handleSubmit} className={styles.form}>
            <label className={styles.label}>
              <p className={styles.labelText}>Имя учетной записи:</p>
              <input
                type="text"
                id="username"
                name="username"
                onChange={(e) => setUsername(e.target.value)}
                className={styles.input}
                autoComplete="username"
                required
              />
            </label>
            <label className={styles.label}>
              <p className={styles.labelText}>Пароль:</p>
              <input
                type="password"
                id="current-password"
                name="password"
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
                autoComplete="current-password"
              />
            </label>
            <div className={styles.button}>
              <button type="submit">Войти</button>
            </div>
          </form>
        </Paper>
        <div className={styles.info}>
          Сервис графиков дежурств - инструмент для информирования пользователей о дежурных в системах мониторинга с помощью таблиц по дням месяца с указанием времени дежурств
        </div>
      </Box>
    </div>
  );
}