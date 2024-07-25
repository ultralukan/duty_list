import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {groupsApi} from "../api/groups.ts";
import {authApi} from "../api/auth.ts";
import authReducer from '../slices/auth.ts';
import {dutiesApi} from "../api/duties.ts";
import {usersApi} from "../api/users.ts";
import {errorMiddleware} from "./errorMiddleware.ts";
import {baseApi} from "../api/baseApi.ts";

export const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: authReducer
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({serializableCheck: false,}).concat(baseApi.middleware, errorMiddleware),
});

export default store;