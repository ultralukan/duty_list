import {baseApi} from "./baseApi.ts";
export const schedulesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    asyncDeleteSchedule: builder.mutation<void, { scheduleId: string }>({
      query: ({scheduleId}) => ({
        url: `/schedules`,
        method: 'DELETE',
        body: [
          {
            "schedule_id": scheduleId
          }
        ]
      }),
      invalidatesTags: ['SCHEDULE']
    }),
    deleteSchedule: builder.mutation<void, { scheduleId: string }>({
      query: ({scheduleId}) => ({
        url: `/schedules`,
        method: 'DELETE',
        body: [
          {
            "schedule_id": scheduleId
          }
        ]
      }),
      invalidatesTags: ['SCHEDULE']
    }),
    confirmSchedule: builder.mutation<void, { scheduleId: string, is_confirmed: boolean }>({
      query: ({is_confirmed, scheduleId}) => ({
        url: `/schedules/confirm`,
        method: 'PUT',
        params: {is_confirmed, schedule_id: scheduleId}
      }),
      invalidatesTags: ['SCHEDULE']
    }),
    updateSchedule: builder.mutation<void, { scheduleId: string, start_time?: Date, end_time?: Date, timedelta?: number }>({
      query: ({scheduleId, start_time, end_time, timedelta = 0}) => ({
        url: `/schedules/${scheduleId}`,
        method: 'PUT',
        params: {timedelta},
        body: {
          start_time,
          end_time,
        }
      }),
      invalidatesTags: ['SCHEDULE']
    }),
    addSchedule: builder.mutation<void, {dutyId: number, groupId: number, start_time: Date, end_time: Date, timedelta: number}>({
      query: ({dutyId, groupId, start_time, end_time, timedelta = 0}) => ({
        url: `/schedules`,
        method: 'POST',
        params: {timedelta},
        body: [
          {
            group_id: groupId,
            duty_id: dutyId,
            start_time,
            end_time
          }
        ]
      }),
      invalidatesTags: ['SCHEDULE']
    }),
    addScheduleAsync: builder.mutation<void, {dutyId: number, groupId: number, start_time: Date, end_time: Date, timedelta: number}>({
      query: ({dutyId, groupId, start_time, end_time, timedelta = 0}) => ({
        url: `/schedules`,
        method: 'POST',
        params: {timedelta},
        body: [
          {
            group_id: groupId,
            duty_id: dutyId,
            start_time,
            end_time
          }
        ]
      }),
      invalidatesTags: ['SCHEDULE']
    }),
    getDeactivatedSchedules: builder.query<AllDuties, {}>({
      query: ({group_id}) => ({
        url: `/schedules/deactivated_duties_schedules`,
        method: 'GET',
        params: {group_id}
      }),
      providesTags: ['SCHEDULE'],
    }),
  }),
});

export const {
  useConfirmScheduleMutation,
  useGetDeactivatedSchedulesQuery,
  useDeleteScheduleMutation,
  useUpdateScheduleMutation,
  useAsyncDeleteScheduleMutation,
  useAddScheduleAsyncMutation,
  useAddScheduleMutation
} = schedulesApi;


