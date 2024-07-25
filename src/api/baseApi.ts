import {createApi} from "@reduxjs/toolkit/query/react";
import {baseQueryWithReauth} from "../axiosConfig.ts";

export const baseApi = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ['GROUP', 'DUTY', 'SCHEDULE', 'USERS', 'RECEIVERS', 'HOLIDAYS', 'AUTH'],
  endpoints: () => ({}),
});