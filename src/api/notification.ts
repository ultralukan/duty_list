import {baseApi} from "./baseApi.ts";
import {Receiver} from "../types/components/receiver";


export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReceivers: builder.query<Receiver[], void>({
      query: () => ({
        url: `/notofication/receivers`,
        method: 'GET',
      }),
      providesTags: ['RECEIVERS']
    }),
    addReceivers: builder.mutation<string, RequestAddReceivers>({
      query: ({mail}) => ({
        url: `/notofication/receivers`,
        method: 'POST',
        body: {mail}
      }),
      invalidatesTags: ['RECEIVERS']
    }),
    deleteReceivers: builder.mutation<string, RequestDeleteReceivers>({
      query: ({mail_id}) => ({
        url: `/notofication/receivers`,
        method: 'DELETE',
        params: {mail_id}
      }),
      invalidatesTags: ['RECEIVERS']
    }),
  }),
});

export const { useGetReceiversQuery, useAddReceiversMutation, useDeleteReceiversMutation } = notificationApi;
