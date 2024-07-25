import React from 'react'
import ReactDOM from 'react-dom/client'
import {App} from './App.tsx'
import './index.css'
import store from "./store/store.ts";
import {Provider} from "react-redux";
import {BrowserRouter} from "react-router-dom";
import {createTheme, ThemeProvider} from "@mui/material";
import { ruRU as muiRU } from '@mui/material/locale';
import {ConfigProvider} from "antd";
import ruRU from "antd/lib/locale/ru_RU";
import "dayjs/locale/ru";
import dayjs from "dayjs";


const theme = createTheme(
  muiRU,
);

dayjs.locale('ru');

const prefix = import.meta.env.BASE_URL

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.Fragment>
    <ConfigProvider locale={ruRU}>
      <Provider store={store}>
        <BrowserRouter basename={prefix}>
          <ThemeProvider theme={theme}>
            <App />
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    </ConfigProvider>
  </React.Fragment>,
)
