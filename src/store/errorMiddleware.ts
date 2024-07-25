import {setError} from "../slices/auth.ts";

export const errorMiddleware = (store) => (next) => (action) => {
  const { dispatch } = store
  if (action.error && action.payload && action.payload.status && action.payload.status  !== 403) {
    if(action.payload.data && action.payload.data.detail && action.payload.data.detail != "Фото отсутствует." ) {
      if(Array.isArray(action.payload.data.detail)) {
        dispatch(setError(action.payload.data.detail[0].msg))
      } else {
        dispatch(setError(action.payload.data.detail))
      }
    }
  }

  return next(action);
};