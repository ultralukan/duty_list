import {baseApi} from "./baseApi.ts";


export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFIO: builder.query<AuthResponse, void>({
      query: () => ({
        url: `/users/fio`,
        method: 'GET',
      }),
      providesTags: ['AUTH']
    }),
    getUsers: builder.query<AuthResponse, void>({
      query: () => ({
        url: `/acl`,
        method: 'GET',
      }),
      providesTags: ['GROUP']
    }),
    getGroupsAcl: builder.query<AuthResponse, void>({
      query: () => ({
        url: `/acl/current_user/groups`,
        method: 'GET',
      }),
      providesTags: ['GROUP']
    }),
    addRole: builder.mutation<AuthResponse, void>({
      query: ({user_id, group_id, role_name}) => ({
        url: `/acl`,
        method: 'POST',
        params: {user_id, group_id},
        body: {"role_name": role_name}
      }),
      invalidatesTags: ['GROUP']
    }),
    deleteRole: builder.mutation<AuthResponse, void>({
      query: ({user_id, group_id, role_name}) => ({
        url: `/acl`,
        method: 'DELETE',
        params: {user_id, group_id},
        body: {"role_name": role_name}
      }),
      invalidatesTags: ['GROUP']
    }),
    getLogs: builder.mutation<Blob, { start_time: string; end_time: string }>({
      query: ({ start_time, end_time }) => ({
        url: `/logs`,
        method: 'GET',
        params: { start_time, end_time },
        responseHandler: "text"
      }),
    }),
  }),
});

export const { useGetFIOQuery, useGetUsersQuery, useAddRoleMutation, useDeleteRoleMutation, useGetLogsMutation, useGetGroupsAclQuery} = usersApi;
