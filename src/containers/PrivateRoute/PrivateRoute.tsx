import { Navigate, Outlet } from "react-router-dom";
import {useSelector} from "react-redux";
import {RootState} from "@reduxjs/toolkit/dist/query/core/apiState";

export const PrivateRoute = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.access_token);

  return (
    isAuthenticated ? (
      <Outlet/>
    ) : (
      <Navigate to="/login" />
    )
  );
};
