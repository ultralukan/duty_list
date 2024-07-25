import {baseApi} from "./baseApi.ts";


export const rolesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<AuthResponse, { user_id: string }>({
      query: () => ({
        url: `/roles`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetRolesQuery
} = rolesApi;
