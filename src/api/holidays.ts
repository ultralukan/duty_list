import {baseApi} from "./baseApi.ts";
import {ResponseAddHolidays, ResponseGetHolidays, ResponseHolidays} from "../types/api/holidays";


export const holidaysApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHolidays: builder.query<ResponseGetHolidays, void>({
      query: () => ({
        url: `/holiday/holidays`,
        method: 'GET',
      }),
      providesTags: ['HOLIDAYS']
    }),
    addHolidays: builder.mutation<ResponseHolidays[], ResponseAddHolidays>({
      query: ({holiday_dates}) => ({
        url: `/holiday/holidays`,
        method: 'POST',
        body: {holiday_dates}
      }),
      invalidatesTags: ['HOLIDAYS']
    }),
    deleteHolidays: builder.mutation<ResponseHolidays[], ResponseAddHolidays>({
      query: ({holiday_dates}) => ({
        url: `/holiday/holidays`,
        method: 'DELETE',
        body: {holiday_dates}
      }),
      invalidatesTags: ['HOLIDAYS']
    }),
  }),
});

export const { useGetHolidaysQuery, useAddHolidaysMutation, useDeleteHolidaysMutation} = holidaysApi;
