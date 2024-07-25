import {baseApi} from "./baseApi.ts";
import {
  RequestAddDutiesToGroupGroup,
  RequestDeleteDutyFromGroup,
  RequestGetGroupSchedule,
  RequestGetGroupsContent, ResponseDeleteDutyFromGroup,
  ResponseGetAllGroup,
  ResponseGetCurrentDuties, ResponseGetGroupSchedule,
  ResponseGetGroupsContent
} from "../types/api/groups";
import {Group, GroupId, GroupName} from "../types/components/group";
export const groupsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGroupsContent: builder.query<ResponseGetGroupsContent, RequestGetGroupsContent>({
      query: ({ table_view, timedelta }) => ({
        url: `/groups/duties/${table_view}`,
        method: 'GET',
        params: {timedelta}
      }),
      providesTags: ['GROUP']
    }),
    getAllGroups: builder.query<ResponseGetAllGroup, void>({
      query: () => ({
        url: `/groups`,
        method: 'GET',
      }),
      providesTags: ['GROUP']
    }),
    getDownloadTable: builder.mutation<Blob, void>({
      query: () => ({
        url: `/groups/download_table`,
        method: 'GET',
        responseHandler: (response: any) => {
          if (!response.ok) {
            return { error: response.statusText, status: response.status };
          }
          return response.blob();
        }
      }),
    }),
    getGroupsInfo: builder.query<ResponseGetCurrentDuties, GroupId>({
      query: () => ({
        url: `/groups/groups_info`,
        method: 'GET',
      }),
      providesTags: ['GROUP', 'SCHEDULE']
    }),
    getCurrentDuties: builder.query<ResponseGetCurrentDuties, GroupId>({
      query: ({ group_id, timedelta, curr_time  }) => ({
        url: `/groups/${group_id}/current_duties`,
        method: 'GET',
        params: {
          curr_time,
          timedelta
        }
      }),
      providesTags: ['GROUP', 'SCHEDULE']
    }),
    getCurrentDutiesGroup: builder.mutation<ResponseGetCurrentDuties, GroupId>({
      query: ({ group_id, timedelta, curr_time  }) => ({
        url: `/groups/${group_id}/current_duties`,
        method: 'GET',
        params: {
          curr_time,
          timedelta
        }
      }),
    }),
    getDutiesNotBusyGroup: builder.mutation<ResponseGetCurrentDuties, GroupId>({
      query: ({ group_id, timedelta, curr_time  }) => ({
        url: `/groups/${group_id}/not_busy`,
        method: 'GET',
        params: {
          curr_time,
          timedelta
        }
      }),
    }),
    getDutiesNotBusy: builder.query<ResponseGetCurrentDuties, GroupId>({
      query: ({ group_id, timedelta, curr_time  }) => ({
        url: `/groups/${group_id}/not_busy`,
        method: 'GET',
        params: {
          curr_time,
          timedelta
        }
      }),
      providesTags: ['GROUP', 'SCHEDULE']
    }),
    getGroupSchedule: builder.query<ResponseGetGroupSchedule, RequestGetGroupSchedule>({
      query: ({ group_id, start_time, end_time, timedelta }) => ({
        url: `/groups/${group_id}/schedules`,
        method: 'GET',
        params: {
          start_time,
          end_time,
          timedelta
        }
      }),
      providesTags: ['GROUP', 'SCHEDULE']
    }),
    getGroupContentGrid: builder.query<ResponseGetGroupSchedule, RequestGetGroupSchedule>({
      query: ({ group_id, start_time, end_time, timedelta }) => ({
        url: `/groups/group_content_grid`,
        method: 'GET',
        params: {
          start_time,
          end_time,
          timedelta,
          group_id
        }
      }),
      providesTags: ['GROUP', 'SCHEDULE']
    }),
    getGroupPersonalScheduleGrid: builder.query<ResponseGetGroupSchedule, RequestGetGroupSchedule>({
      query: ({ duty_id, start_time, end_time, timedelta }) => ({
        url: `/groups/get_personal_schedule_grid`,
        method: 'GET',
        params: {
          start_time,
          end_time,
          timedelta,
          duty_id
        }
      }),
      providesTags: ['GROUP', 'SCHEDULE']
    }),
    getDutyFromGroupOnDate: builder.mutation<ResponseGetGroupSchedule, RequestGetGroupSchedule>({
      query: ({ group_id , date_to_search, timedelta }) => ({
        url: `/groups/${group_id}/duties_on_date`,
        method: 'GET',
        params: {
          date_to_search,
          timedelta,
        }
      }),
      invalidatesTags: ['GROUP', 'SCHEDULE']
    }),
    getGroupContentTable: builder.query<ResponseGetGroupSchedule, RequestGetGroupSchedule>({
      query: ({ group_id, start_time, end_time, timedelta }) => ({
        url: `/groups/group_content_table`,
        method: 'GET',
        params: {
          start_time,
          end_time,
          timedelta,
          group_id
        }
      }),
      providesTags: ['GROUP', 'SCHEDULE']
    }),
    deleteDutyFromGroup: builder.mutation<ResponseDeleteDutyFromGroup, RequestDeleteDutyFromGroup>({
      query: ({ group_id, duty_ids }) => ({
        url: `/groups/${group_id}/duties`,
        method: 'DELETE',
        body: {
          duty_ids
        }
      }),
      invalidatesTags: ['GROUP']
    }),
    createGroup: builder.mutation<GroupId, GroupName>({
      query: ({group_name}) => ({
        url: `/groups`,
        method: 'POST',
        params: {group_name}
      }),
      invalidatesTags: ['GROUP']
    }),
    updateGroup: builder.mutation<void, Group>({
      query: ({group_id, group_name}) => ({
        url: `/groups/${group_id}`,
        method: 'PUT',
        params: {group_name},
      }),
      invalidatesTags: ['GROUP']
    }),
    deleteGroup: builder.mutation<void, GroupId>({
      query: ({ group_id }) => ({
        url: `/groups/${group_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['GROUP']
    }),
    addDutiesToGroupGroup: builder.mutation<void, RequestAddDutiesToGroupGroup>({
      query: ({group_id, duty_id}) => ({
        url: `/groups/${group_id}/duties/${duty_id}`,
        method: 'POST',
      }),
      invalidatesTags: ['GROUP']
    }),
    getGroupDuties: builder.query<void, GroupId>({
      query: ({ group_id }) => ({
        url: `/groups/${group_id}/duties`,
        method: 'GET',
      }),
      providesTags: ['GROUP']
    }),
  }),
});

export const {
  useGetGroupsContentQuery,
  useGetDownloadTableMutation,
  useGetDutiesNotBusyQuery,
  useGetCurrentDutiesQuery,
  useDeleteDutyFromGroupMutation,
  useDeleteGroupMutation,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useAddDutiesToGroupGroupMutation,
  useGetGroupDutiesQuery,
  useGetAllGroupsQuery,
  useGetGroupScheduleQuery,
  useGetGroupContentTableQuery,
  useGetGroupContentGridQuery,
  useGetGroupsInfoQuery,
  useGetCurrentDutiesGroupMutation,
  useGetDutiesNotBusyGroupMutation,
  useGetGroupPersonalScheduleGridQuery,
  useGetDutyFromGroupOnDateMutation
} = groupsApi;
