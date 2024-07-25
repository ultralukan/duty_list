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
export const aclApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGroupManagers: builder.query<ResponseGetCurrentDuties, GroupId>({
      query: ({ group_id}) => ({
        url: `/acl/groups/managers`,
        method: 'GET',
        params: {group_id}
      }),
      providesTags: ['GROUP']
    }),
  }),
});

export const {
  useGetGroupManagersQuery,
} = aclApi;
