import {Route, Routes, useLocation, useNavigate} from "react-router-dom";
import {LoginPage} from "./pages/Login";
import {GroupsPage} from "./pages/Groups";
import {PrivateRoute} from "./containers/PrivateRoute/PrivateRoute.tsx";
import {Layout} from "./containers/Layout/Layout.tsx";
import {useEffect, useMemo} from "react";

import {AdminPanel} from "./pages/AdminPanel";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@reduxjs/toolkit/dist/query/core/apiState";
import {useGetFIOQuery, useGetGroupsAclQuery, useGetUsersQuery} from "./api/users.ts";
import {setChiefs, setError, setFIO, setGroups, setInfo, setScopes, setUserId} from "./slices/auth.ts";
import {Alert, Snackbar} from "@mui/material";
import {Schedules} from "./pages/Schedules";
import {useGetAllDutiesQuery, useGetChiefQuery} from "./api/duties.ts";
import {DocumentPage} from "./pages/Document";
import jwt_decode from "jwt-decode";
import { PersonalSchedule } from "./pages/PersonalShedule/index.tsx";
import {CurrentDuty} from "./pages/CurrentDuty";

export const App = () => {
  const location = useLocation()
  const isLoginPage = location && location.pathname && location.pathname.includes('login')

  const dispatch = useDispatch();
  const navigate = useNavigate()
  const username = useSelector((state: RootState) => state.auth.username);
  const error = useSelector((state: RootState) => state.auth.error);
  const info = useSelector((state: RootState) => state.auth.info);
  const token = useSelector((state: RootState) => state.auth.access_token);
  const scopes = useMemo(() => (token && jwt_decode(token).scopes) || [], [token])

  const {data: dutiesData = [], isLoading: isLoadingDuties} = useGetAllDutiesQuery({}, {skip: !token || isLoginPage})
  const {data: usersData = [], isLoading: isLoadingUsers} = useGetUsersQuery({}, {skip: !token || !scopes.includes('admin')  || isLoginPage})
  const {data: groupsData = []} = useGetGroupsAclQuery({}, {skip: !token || !scopes.includes('manager')  || isLoginPage})
  const {data: FIO = ''} = useGetFIOQuery({}, {skip: !token  || isLoginPage})

  const {data: allDuties} = useGetAllDutiesQuery({}, {skip: !token  || isLoginPage})

  const dutyCurrent = useMemo(() => allDuties && allDuties.duties && allDuties.duties.length && allDuties.duties.filter((duty) => duty.user_id === username)[0], [username, allDuties])

  const chiefStr = useMemo(() => {
    if(!isLoadingDuties && !isLoadingUsers) {
      const ids = []
      dutiesData.duties && dutiesData.duties.length && dutiesData.duties.forEach((el) => {
        if(!ids.includes(el.user_id)) ids.push(el.user_id)
      })
      usersData.acls && usersData.acls.length && usersData.acls.forEach((el) => {
        if(!ids.includes(el.user_id)) ids.push(el.user_id)
      })
      return ids.length && ids.map(el => `user_ids=${el}`).join('&') || ''
    }
    return ''
  }, [isLoadingDuties, isLoadingUsers, dutiesData, usersData])

  const {data: chiefs = []} = useGetChiefQuery({user_ids: chiefStr}, {skip: !chiefStr})

  useEffect(() => {
    if(chiefs.length) {
      dispatch(setChiefs(chiefs))
    }
  }, [chiefs])

  useEffect(() => {
    if(scopes.length) {
      dispatch(setScopes(scopes))
    }
  }, [scopes])

  useEffect(() => {
    if(location.pathname === '/') {
      navigate('/groups')
    }
  }, [])

  useEffect(() => {
    if (FIO) {
      dispatch(setFIO(`${FIO.last_name || ''} ${FIO.first_name || ''} ${FIO.sec_name || ''} `))
    }
    if(dutyCurrent) {
      dispatch(setUserId(dutyCurrent.duty_id))
    }
  }, [FIO, dutyCurrent])

  useEffect(() => {
    if(groupsData && groupsData.groups && groupsData.groups.length) {
      dispatch(setGroups(groupsData.groups.map((group) => group.group_id)))
    }
  }, [groupsData])


  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/" element={<PrivateRoute  />}>
          <Route path="/" element={<Layout/>}>
            <Route path="/groups" element={<GroupsPage duties={dutiesData} usersData={usersData}/>}/>
            <Route path="/schedules" element={<Schedules/>}/>
            <Route path="/current-duty" element={<CurrentDuty duties={dutiesData} usersData={usersData}/>}/>
            <Route path="/personal-schedule" element={
              scopes.length && scopes.includes('duty') && (
                <PersonalSchedule />
              )
            }/>
            <Route path="/admin-panel" element={
              scopes.length && scopes.includes('admin') && (
                <AdminPanel duties={dutiesData}/>
              )
            }/>
          </Route>
          <Route path="/reference" element={<DocumentPage/>}/>
        </Route>
      </Routes>
      <Snackbar
        open={!!error || !!info}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClose={() => {
          dispatch(setError(''))
          dispatch(setInfo(''))
        }}
      >
        <div>
          {
            info && (
              <Alert severity={"success"} sx={{ width: '100%', marginBottom: '16px'}}>
                {info}
              </Alert>
            )
          }
          {
            error && (
              <Alert severity={"error"} sx={{ width: '100%'}}>
                {error}
              </Alert>
            )
          }
        </div>
      </Snackbar>
    </>
  )
}
