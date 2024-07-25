import { createSlice } from '@reduxjs/toolkit';
import jwt_decode from 'jwt-decode';
import Cookies from 'js-cookie';

interface AuthState {
  access_token: string;
  refresh_token: string;
  username: string;
  scopes: string[];
  groups: string[];
  error: string;
  info: string;
  userInfo: any;
  timeDelta: number;
}

const initialState: AuthState = {
  access_token: Cookies.get('access_token') || '',
  refresh_token: Cookies.get('refresh_token') || '',
  username: Cookies.get('access_token') && jwt_decode(Cookies.get('access_token')).sub,
  scopes: [],
  groups: [],
  userInfo: {},
  error: '',
  info: '',
  chiefs: [],
  timeDelta: new Date().getTimezoneOffset() * 60 || 0,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.access_token = action.payload.access_token;
      state.refresh_token = action.payload.refresh_token;
      state.username = jwt_decode(action.payload.access_token).sub;
      Cookies.set('access_token', action.payload.access_token,  { expires: 7 });
      Cookies.set('refresh_token', action.payload.refresh_token,  { expires: 7 });
    },
    logout: (state) => {
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      state.access_token = '';
      state.refresh_token = '';
    },
    setUserId: (state, action) => {
      state.userInfo.ID = action.payload
    },
    setFIO: (state, action) => {
      state.userInfo.FIO = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    setInfo: (state, action) => {
      state.info = action.payload
    },
    setScopes: (state, action) => {
      state.scopes = action.payload
    },
    setGroups: (state, action) => {
      state.groups = action.payload
    },
    setChiefs: (state, action) => {
      state.chiefs = action.payload
    },
  },
});

export const { login, logout, setFIO, setError, setUserId, setChiefs, setScopes, setGroups, setInfo, } = authSlice.actions;
export default authSlice.reducer;
