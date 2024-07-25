import {baseApi} from "./baseApi.ts";

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
    loginAuth: builder.mutation<ResponseAuth, RequestAuth>({
      query: (data) => ({
        url: '/token',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AUTH']
    }),
  }),
});

export const {
  useLoginAuthMutation
} = authApi;
