import {baseApi} from "./baseApi.ts";
import {
  RequestAddDuty, RequestDeleteDuty,
  RequestGetAllDuties,
  RequestGetChief, RequestGetDutiesSelectedDuty,
  RequestGetPhoto, RequestUploadDuty,
  ResponseAddDuty, ResponseDeleteDuty,
  ResponseGetChief, ResponseGetDutiesSelectedDuty, ResponseUploadDuty
} from "../types/api/duties";
export const dutiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllDuties: builder.query<void, RequestGetAllDuties>({
      query: () => ({
        url: `/duties`,
        method: 'GET',
      }),
      providesTags: ['DUTY'],
    }),
    getPhoto: builder.query<RequestGetPhoto, RequestGetPhoto>({
      query: ({user_id}) => ({
        url: `/duties/photo`,
        method: 'GET',
        params: {user_id}
      }),
      providesTags: ['DUTY'],
    }),
    getChief: builder.query<ResponseGetChief, RequestGetChief>({
      query: ({user_ids}) => ({
        url: `/duties/chief?${user_ids}`,
        method: 'GET',
      }),
      providesTags: ['DUTY'],
    }),
    addDutyRole: builder.mutation<ResponseAddDuty[], RequestAddDuty>({
      query: ({user_ids}) => ({
        url: `/duties/`,
        method: 'POST',
        body: {
          user_ids
        }
      }),
      invalidatesTags: ['DUTY']
    }),
    deleteDutyRole: builder.mutation<ResponseDeleteDuty[], RequestDeleteDuty>({
      query: ({duty_ids}) => ({
        url: `/duties/`,
        method: 'DELETE',
        body: {
          duty_ids
        }
      }),
      invalidatesTags: ['DUTY']
    }),
    uploadDuties: builder.mutation<ResponseUploadDuty[], RequestUploadDuty>({
      query: (formData) => {
        return {
          url: `/duties/upload_table`,
          method: 'POST',
          body: formData,
        }
      },
      invalidatesTags: ['DUTY']
    }),
    getDutiesSelectedDuty: builder.query<ResponseGetDutiesSelectedDuty, RequestGetDutiesSelectedDuty>({
      query: ({ duty_id, timedelta = 0 }) => ({
        url: `/duties/${duty_id}/schedules`,
        method: 'GET',
        params: {timedelta}
      }),
      providesTags: ['DUTY']
    }),
    getDutyGroups: builder.query<ResponseGetDutiesSelectedDuty, RequestGetDutiesSelectedDuty>({
      query: ({ duty_id }) => ({
        url: `/duties/groups`,
        method: 'GET',
        params: {duty_id}
      }),
      providesTags: ['DUTY']
    }),
    getUsersInfo: builder.query<ResponseGetDutiesSelectedDuty, RequestGetDutiesSelectedDuty>({
      query: () => ({
        url: `/duties/users_info`,
        method: 'GET',
      }),
      providesTags: ['DUTY', 'GROUP']
    }),
  }),
});

export const {
  useGetAllDutiesQuery,
  useGetPhotoQuery,
  useGetChiefQuery,
  useAddDutyRoleMutation,
  useDeleteDutyRoleMutation,
  useGetDutiesSelectedDutyQuery,
  useUploadDutiesMutation,
  useGetDutyGroupsQuery,
  useGetUsersInfoQuery
} = dutiesApi;


