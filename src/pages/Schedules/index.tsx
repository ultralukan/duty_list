import React, {useEffect, useMemo, useState} from "react";
import {Box, Button, Grid, Menu, MenuItem, Switch} from "@mui/material";
import styles from './styles.module.scss';
import {GraphSchedule} from "./Graph";
import {TableSchedule} from "./Table";
import {MainLayout} from "../../containers/MainLayout/Layout.tsx";
import {ChooseGroup} from "../../components/ChooseGroup";
import {
  useGetAllGroupsQuery,
  useGetCurrentDutiesQuery,
  useGetDutiesNotBusyQuery,
  useGetGroupContentGridQuery,
  useGetGroupDutiesQuery,
} from "../../api/groups.ts";
import {
  findFreeIntervals, getDates
} from "../../services/tabularGraph.ts";

import {DutyActionsModal} from "../../components/Modal/DutyActions";
import {AddScheduleGroupModal} from "../../components/Modal/AddScheduleGroupModal";
import {DeleteSchedulesGroupModal} from "../../components/Modal/DeleteSchedulesGraphModal";
import {useSelector} from "react-redux";
import {RootState} from "@reduxjs/toolkit/dist/query/core/apiState";
import {ColorsTable} from "../../containers/ColorsTable";
import * as dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween';
import {useGetDeactivatedSchedulesQuery} from "../../api/schedules.ts";
import {Option} from "../../types/components/options";
import {useGetHolidaysQuery} from "../../api/holidays.ts";
import { useGetGroupManagersQuery } from "../../api/acl.ts";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

dayjs.extend(isBetween)
const today = new Date();
const dayjsToday = dayjs(today)
const formatedToday = dayjs(today).format('YYYY-MM-DD');
const timeStart = new Date(today);
timeStart.setDate(today.getDate() - 3)

const timeEnd = new Date(today);
timeEnd.setDate(today.getDate() + 4)

export const Schedules = () => {

  const [defaultTime, setDefaultTime] = useState({
    defaultTimeStart: timeStart,
    defaultTimeEnd: timeEnd
  })

  const [time, setTime] = useState([])

  const firstDayOfWeek = dayjs().startOf('week');
  const lastDayOfWeek = dayjs().endOf('week');
  const firstDayOfMonth = dayjs().startOf('month');
  const lastDayOfMonth = dayjs().endOf('month');
  const [tableView, setTableView] = useState(false)

  const [timeTable, setTimeTable] = useState({
    start_date: dayjs(firstDayOfWeek.format('YYYY-MM-DD HH:mm:ss')),
    end_date: dayjs(lastDayOfWeek.format('YYYY-MM-DD HH:mm:ss'))
  })

  useEffect(() => {
    if(tableView) {
      setTimeTable({
        start_date: dayjs(firstDayOfMonth.format('YYYY-MM-DD HH:mm:ss')),
        end_date: dayjs(lastDayOfMonth.format('YYYY-MM-DD HH:mm:ss'))
      })
    } else {
      setTimeTable({
        start_date: dayjs(firstDayOfWeek.format('YYYY-MM-DD HH:mm:ss')),
        end_date: dayjs(lastDayOfWeek.format('YYYY-MM-DD HH:mm:ss'))
      })
    }
  }, [tableView])
  const {data: holidays = {}} = useGetHolidaysQuery()
  const holidaysData = useMemo(() => {
    return holidays.holiday_dates || []
  }, [holidays])

  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedItemsTable, setSelectedItemsTable] = useState({});

  const chiefs = useSelector((state: RootState) => state.auth.chiefs);
  const timedelta = useSelector((state: RootState) => state.auth.timeDelta);
  const scopes = useSelector((state: RootState) => state.auth.scopes);
  const groupsManager = useSelector((state: RootState) => state.auth.groups);

  const [showDeactivated, setShowDeactivated] = useState<boolean>(false)
  const [table, setTable] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<Option | null>(null);
  const [open, setOpen] = useState<boolean>(false)
  const [openAddGroupScheduleModal, setOpenAddGroupScheduleModal] = useState<boolean>(false)
  const [openDeleteGroupScheduleModal, setOpenDeleteGroupScheduleModal] = useState<boolean>(false)
  const [openEditScheduleModal, setEditScheduleModal] = useState<boolean>(false)
  const [scheduleId, setScheduleId] = useState(null)
  const [dutyId, setDutyId] = useState(null)

  const groupId = useMemo(() => selectedValue && selectedValue.value, [selectedValue])
  const groupName = useMemo(() => selectedValue && selectedValue.name, [selectedValue])

  const startEndDates = useMemo(() => [dayjs(formatedToday).startOf('month'), dayjs(formatedToday).add(1, 'month').endOf('month')], [formatedToday])

  const {data: groups = {}} = useGetAllGroupsQuery()
  const {data: groupGraph = {}, isLoading: isLoadingGraph} = useGetGroupContentGridQuery({
    group_id: groupId,
    start_time: table ? dayjs(timeTable.start_date).format('YYYY-MM-DD HH:mm:ss') : dayjs(defaultTime.defaultTimeStart).subtract(5, 'day').format('YYYY-MM-DD HH:mm:ss'),
    end_time: table ? dayjs(timeTable.end_date).format('YYYY-MM-DD HH:mm:ss') : dayjs(defaultTime.defaultTimeEnd).add(5, 'day').format('YYYY-MM-DD HH:mm:ss'),
    timedelta: timedelta
  }, {skip: !groupId})

  const {data: groupManagers = []} = useGetGroupManagersQuery({
    group_id: groupId,
  }, {skip: !groupId})

  const {data: current = {}} = useGetCurrentDutiesQuery({
    group_id: groupId,
    curr_time: dayjsToday.format('YYYY-MM-DD HH:mm:ss'),
    timedelta: timedelta
  }, {skip: !groupId})

  const {data: busy = {}} = useGetDutiesNotBusyQuery({
    group_id: groupId,
    curr_time: dayjsToday.format('YYYY-MM-DD HH:mm:ss'),
    timedelta: timedelta
  }, {skip: !groupId})

  const currentDuties = useMemo(() => {
    return current.duties && current.duties.map((el) => el.user_id) || []
  }, [current])

  const busyDuties = useMemo(() => {
    return busy.duties && busy.duties.map((el) => el.user_id) || []
  }, [busy])

  const managers = useMemo(() => {
    return groupManagers.length && groupManagers.map((el) => el.user_id) || []
  }, [groupManagers])

  const {data: duties = {}} = useGetGroupDutiesQuery({group_id: groupId}, {skip: !groupId})
  const {data: deactivated = []} = useGetDeactivatedSchedulesQuery({group_id: groupId}, {skip: !groupId})

  const emptyTableData = useMemo(() => {
    if(groupGraph.length) {
      const obj = {}
      const intervals = findFreeIntervals(groupGraph.length && groupGraph.flatMap(item => item.schedules).map((el) => ({...el, start_time: dayjs(el.start_time), end_time: dayjs(el.end_time)})), [dayjs(timeTable.start_date), dayjs(timeTable.end_date)])
      intervals.forEach((el) => {
        const date = el.start_time.format('DD.MM.YYYY')
        if(obj[date]) {
          obj[date] = [
            ...obj[date],
            {
              start_time: el.start_time.format('HH:mm'),
              end_time: el.end_time.format('HH:mm')
            }
          ]
        } else {
          obj[date] = [
            {
              start_time: el.start_time.format('HH:mm'),
              end_time: el.end_time.format('HH:mm')
            }
          ]
        }
      })
      return obj
    }
    return []
  }, [groupGraph, timeTable])


  const dutiesGroupOptions = useMemo(() => {
    const data = []
    if(duties.content && duties.content.length) {
      duties.content.forEach((duty) => {
        const chief = chiefs && chiefs.length && chiefs.filter((el) => el.user_id === duty.user_id) && chiefs.filter((el) => el.user_id === duty.user_id).length && chiefs.filter((el) => el.user_id === duty.user_id)[0].chief
        const isManager = managers.length && managers.includes(duty.user_id)
        const isCurrent = currentDuties.includes(duty.user_id)
        const isBusy = busyDuties.includes(duty.user_id)
        data.push({
          title: `${duty.last_name || ''} ${duty.first_name || ''} ${duty.sec_name || ''}`,
          id: duty.duty_id,
          value: duty.duty_id,
          name: `${duty.last_name || ''} ${duty.first_name || ''} ${duty.sec_name || ''} (${duty.mail || ''})`,
          tooltip: <div className={styles.tooltip}>
            {
              isManager ? <div><b>Менеджер</b></div> : null
            }
            {
              isCurrent ? <div><b>Текущее дежурство</b></div> : null
            }
            {
              isBusy ? <div><b>Будущие дежурства не назначены</b></div> : null
            }
            {
              duty.mail ? <div>Почта: {duty.mail}</div> : null
            }
            {
              duty.mob_phone ? <div>Моб. тел.: {duty.mob_phone}</div> : null
            }
            {
              duty.work_phone ? <div>Раб. тел.: {duty.work_phone}</div> : null
            }
            {
              chief && (
                <div className={styles.chiefContainer}>
                  <span className={styles.chief}>Руководитель: </span>
                  <div className={styles.chiefMore}>
                    <div>ФИО: {chief.last_name || ''} {chief.first_name || ''} {chief.sec_name || ''}</div>
                    <div>Почта:{chief.mail}</div>
                    <div>Моб. телефон: {chief.mob_phone}</div>
                    <div>Раб. телефон: {chief.work_phone}</div>
                  </div>
                </div>
              )
            }
          </div>,
          ...duty,
          isManager: isManager,
          isCurrent: isCurrent,
          isBusy: isBusy,
        })
        }
      )
    }
    return data
  }, [duties, showDeactivated, deactivated, currentDuties, busyDuties, chiefs, managers])

  const dutiesDeactivatedOptions = useMemo(() => {
    const data = []
    if(showDeactivated) {
      const deactivatedUsers = []
      deactivated.forEach((el) => {
        if (!deactivatedUsers.map((el) => el.id).includes(el.duty_id)) {
          deactivatedUsers.push({
            title: `${el.last_name || ''} ${el.first_name || ''} ${el.sec_name || ''}`,
            id: el.duty_id,
            value: el.duty_id,
            name: `${el.last_name || ''} ${el.first_name || ''} ${el.sec_name || ''} (${el.mail || ''})`,
          })
        }
      })
      data.push(...deactivatedUsers)
    }
    return data
  }, [showDeactivated, deactivated])

  const dutiesOptionsWithEmpty = useMemo(() => {
    return [{
      title: `Неназначенные интервалы`,
      id: 999999999,
      value: 999999999,
    }, ...dutiesGroupOptions]
  }, [dutiesGroupOptions])
  const dutiesOptions = useMemo(() => dutiesOptionsWithEmpty.length ? [...dutiesOptionsWithEmpty, ...dutiesDeactivatedOptions] : [], [dutiesGroupOptions, dutiesDeactivatedOptions])

  const dates = useMemo(() => getDates(new Date(timeTable.start_date), new Date(timeTable.end_date)), [timeTable]);
  const groupGraphData = useMemo(() => {
    const data = []
    if(groupGraph.length) {
      groupGraph.forEach((duty) => {
        duty.schedules.forEach((el) => {
          data.push({
            ...el,
            id: el.schedule_id,
            group: el.duty_id,
            start_time: dayjs(new Date(el.start_time)),
            end_time: dayjs(new Date(el.end_time)),
            isCurrent: dayjs(today).isBetween(dayjs(new Date(el.start_time)), dayjs(new Date(el.end_time))),
            isPast: dayjs(today) > dayjs(new Date(el.end_time))
          })
        })
      })
    }

    return data.sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
  }, [groupGraph])

  const emptyGraphData = useMemo(() => {
    return findFreeIntervals(groupGraphData, startEndDates)
  }, [groupGraphData, startEndDates])

  const groupTableData = useMemo(() => {

    let data = []
    if(dates && dates.length && groupGraph.length && dutiesOptions.length) {
      const schedules = groupGraph
        .flatMap(item => item.schedules)
        .map((el) => {
          const duty = dutiesOptions.find((duty) => duty.value === el.duty_id) || {}
          return ({...el, ...duty, name: duty.title})
        })
      data = dates.map((date) => {
        const convertedDate = convertDateFormat(date)
        const formatedDateOfWeek = dayjs(convertedDate).format('dddd')
        const formatedDate = dayjs(convertedDate).format('YYYY-MM-DD')
        return ({
          date: `${date} (${formatedDateOfWeek})`,
          id: date,
          isHoliday: holidaysData.includes(formatedDate) || (new Date(formatedDate)).getDay() === 0 || (new Date(formatedDate)).getDay() === 6,
          isToday: formatedDate === formatedToday,
          tooltip: emptyTableData[date] ?
            <div className={styles.tooltip}>
              <h6>Неназначенные интервалы:</h6>
              {
                emptyTableData[date].map((hour, index) => <div key={date + index}>{hour.start_time}  -  {hour.end_time}</div>)
              }
            </div> : null,
          isGroup: true,
          subRows: [...schedules.filter((schedule) => dayjs(new Date(schedule.start_time)).format('DD.MM.YYYY') === date).map(el => {
            const startDate = dayjs(new Date(el.start_time)).format('DD.MM.YYYY')
            const endDate = dayjs(new Date(el.end_time)).format('DD.MM.YYYY')
            const chief = chiefs && chiefs.length && chiefs.filter((ch) => ch.user_id === el.user_id) && chiefs.filter((ch) => ch.user_id === el.user_id).length && chiefs.filter((ch) => ch.user_id === el.user_id)[0].chief
            const isCurrent = dayjs(today).isBetween(dayjs(new Date(el.start_time)), dayjs(new Date(el.end_time)))
            const isManager = managers.length && managers.includes(el.user_id)
            return ({
              ...el,
              group_name: selectedValue && selectedValue.name,
              id: el.schedule_id,
              tooltip: <div className={styles.tooltip}>
                {
                  isManager ? <div><b>Менеджер</b></div> : null
                }
                {
                  isCurrent ? <div><b>Текущее дежурство</b></div> : null
                }
                {
                  el.mail ? <div>Почта: {el.mail}</div> : null
                }
                {
                  el.mob_phone ? <div>Моб. тел.: {el.mob_phone}</div> : null
                }
                {
                  el.work_phone ? <div>Раб. тел.: {el.work_phone}</div> : null
                }
                {
                  chief && (
                    <div className={styles.chiefContainer}>
                      <span className={styles.chief}>Руководитель: </span>
                      <div className={styles.chiefMore}>
                        <div>ФИО: {chief.last_name || ''} {chief.first_name || ''} {chief.sec_name || ''}</div>
                        <div>Почта:{chief.mail}</div>
                        <div>Моб. телефон: {chief.mob_phone}</div>
                        <div>Раб. телефон: {chief.work_phone}</div>
                      </div>
                    </div>
                  )
                }
              </div>,
              start_time: dayjs(new Date(el.start_time)).format('HH:mm'),
              isCurrent: isCurrent,
              end_time: startDate === endDate ? dayjs(new Date(el.end_time)).format('HH:mm') : `${dayjs(new Date(el.end_time)).format('HH:mm')} (${endDate})`,
            })
          })].sort((a, b) => a.start_time.localeCompare(b.start_time)),
        })
      })
    }

    return data
  }, [groupGraph, dutiesOptions, holidaysData, emptyTableData, chiefs, managers, selectedValue])

  const deactivatedGraphData = useMemo(() => {
    const data = []
    if(showDeactivated) {
      if(Object.keys(deactivated).length) {
        deactivated.forEach((el) => data.push({
          ...el,
          id: el.schedule_id,
          group: el.duty_id,
          start_time: dayjs(new Date(el.start_time)),
          end_time: dayjs(new Date(el.end_time)),
          isDeactivated: true
        }))
      }
    }
    return data
  }, [deactivated, showDeactivated])


  const graphData = (groupGraphData.length || deactivatedGraphData.length) ? [...groupGraphData, ...deactivatedGraphData, ...emptyGraphData] : [...emptyGraphData]

  const groupsOptions = useMemo(() => {
    if(Object.keys(groups).length && groups.groups) {
      return groups.groups.map((group) => ({value: group.group_id, name: group.group_name}))
    }
    return []
  }, [groups])

  useEffect(() => {
    if(!selectedValue) {
      setShowDeactivated(false)
    }
    setSelectedItems([])
    setSelectedItemsTable([])
  }, [selectedValue])

  useEffect(() => {
    setSelectedItems([])
    setSelectedItemsTable([])
  }, [table])

  useEffect(() => {
    setSelectedItems([])
    setSelectedItemsTable([])
  }, [tableView])

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <>
      <MainLayout title={'График дежурств'}/>
      <div className={styles.switch}>
        <Grid component="label" container alignItems="center" spacing={1}>
          <Grid item>Схематическая версия</Grid>
          <Grid item>
            <Switch
              checked={table}
              onChange={() => setTable((prevState) => !prevState)}
              value="checked"
              className={styles.input}
            />
          </Grid>
          <Grid item>Табличная версия</Grid>
        </Grid>
        {
          deactivated.length && selectedValue ? (
            <Grid component="label" container alignItems="center" spacing={1}>
              <Grid item>Показывать неактивных пользователей</Grid>
              <Grid item>
                <Switch
                  checked={showDeactivated}
                  onChange={() => setShowDeactivated((prevState) => !prevState)}
                  value="checked"
                  className={styles.input}
                />
              </Grid>
            </Grid>
          ) : null
        }
      </div>
      <div className={styles.toolbar}>
        <Box>
          <ChooseGroup
            options={groupsOptions}
            selectedValue={selectedValue}
            setSelectedValue={setSelectedValue}
          />
          {
            selectedValue && (scopes.includes('admin') || (scopes.includes('manager') && groupsManager.includes(groupId))) && dutiesGroupOptions.length ? (
              <div className={styles.buttons}>
                <div className={styles.button}>
                  <Button
                    id={`button-actions`}
                    aria-controls={openMenu ? `button-actions` : undefined}
                    aria-haspopup="true"
                    aria-expanded={openMenu ? 'true' : undefined}
                    onClick={handleClickMenu}
                    variant="contained"
                    className={styles.btn}
                    disabled={!dutiesGroupOptions.length}
                  >
                    Действия над дежурствами
                  </Button>
                  <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={openMenu}
                    onClose={handleCloseMenu}
                    MenuListProps={{
                      'aria-labelledby': 'basic-button',
                    }}
                  >
                    <MenuItem className={styles.menuItem} onClick={() => {
                      setOpenAddGroupScheduleModal(true)
                      handleCloseMenu()
                    }}>
                      <AddIcon/> Добавить
                    </MenuItem>
                    <MenuItem className={styles.menuItem} onClick={() => {
                      setOpenDeleteGroupScheduleModal(true)
                      handleCloseMenu()
                    }}>
                      <DeleteIcon/> Удалить
                    </MenuItem>
                    <MenuItem
                      className={styles.menuItem}
                      onClick={() => {
                        setEditScheduleModal(true)
                        handleCloseMenu()
                        const id = table ? Object.keys(selectedItemsTable)[0] : selectedItems[0]
                        const data = []
                        if (table && groupGraph.length) {
                          groupGraph.forEach((el) => data.push(...el.schedules.map((schedule) => ({
                            ...schedule,
                            start_time: dayjs(schedule.start_time),
                            end_time: dayjs(schedule.end_time)
                          }))))
                        }
                        const selectedSchedule = table ? data.length && data.find((el) => el.schedule_id == id) : groupGraphData.length && groupGraphData.find((el) => el.schedule_id == id)
                        if (selectedSchedule) {
                          setTime([selectedSchedule.start_time, selectedSchedule.end_time])
                          setScheduleId(id)
                          setDutyId(selectedSchedule.duty_id)
                        }
                      }}
                      disabled={!dutiesGroupOptions.length || (table ? (Object.keys(selectedItemsTable).length === 0 || Object.keys(selectedItemsTable).length > 1) : (selectedItems.length === 0 || selectedItems.length > 1))}
                    >
                      <EditIcon/>Редактировать
                    </MenuItem>
                  </Menu>
                </div>
              </div>
            ) : null
          }
        </Box>
      </div>
      {
        selectedValue && dutiesOptions.length && !table ? <ColorsTable
          colors={showDeactivated ? ['gray', 'green', 'blue', 'white', 'red', 'yellow'] : ['gray', 'green', 'blue', 'white', 'red']}/> : null
      }
      {
        selectedValue ? (
          dutiesGroupOptions.length ?
            table ?
              <TableSchedule
                dutiesOptions={dutiesOptions}
                groups={groups}
                selectedGroup={groupId}
                setSelectedValue={setSelectedValue}
                selectedGroupName={groupName}
                data={groupTableData}
                timeTable={timeTable}
                setTimeTable={setTimeTable}
                isLoadingTable={isLoadingGraph}
                selectedItems={selectedItemsTable}
                setSelectedItems={setSelectedItemsTable}
                tableView={tableView}
                setTableView={setTableView}
              />
              :
              <GraphSchedule
                selectedValue={groupId}
                setDutyId={setDutyId}
                dutiesOptions={dutiesOptions}
                items={graphData}
                setOpen={setOpen}
                setScheduleId={setScheduleId}
              defaultTime={defaultTime}
              setDefaultTime={setDefaultTime}
              today={today}
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
              holidays={holidaysData}
            />
            : !isLoadingGraph ? <div className={styles.message}>В этой группе нет дежурств, для отображения графика необходимо добавить дежурных в группу</div> : null
        ) : null
      }
      <DutyActionsModal setSelected={table ? setSelectedItemsTable : setSelectedItems} dutyId={dutyId} open={openEditScheduleModal} scheduleId={scheduleId} time={time} setOpen={setEditScheduleModal} options={dutiesGroupOptions} groupId={groupId}/>
      <AddScheduleGroupModal open={openAddGroupScheduleModal} setOpen={setOpenAddGroupScheduleModal} options={dutiesGroupOptions} groupId={groupId}/>
      <DeleteSchedulesGroupModal open={openDeleteGroupScheduleModal} selectedItemsTable={selectedItemsTable} setSelectedItemsTable={setSelectedItemsTable} setSelectedItems={setSelectedItems} selectedItems={selectedItems} setOpen={setOpenDeleteGroupScheduleModal} options={dutiesGroupOptions} groupId={selectedValue && selectedValue.value} dataGraph={groupGraphData}/>
    </>
  );
}

function convertDateFormat(dateStr) {
  const [day, month, year] = dateStr.split('.');
  return `${year}-${month}-${day}`;
}

