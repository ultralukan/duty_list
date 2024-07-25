import React, {useEffect, useMemo, useState} from "react";
import {Box, Button, Grid, Menu, MenuItem, Switch} from "@mui/material";
import styles from './styles.module.scss';
import {GraphSchedule} from "./Graph";
import {TableSchedule} from "./Table";
import {MainLayout} from "../../containers/MainLayout/Layout.tsx";
import {ChooseGroup} from "../../components/ChooseGroup";
import {
  useGetAllGroupsQuery,
  useGetGroupDutiesQuery, useGetGroupPersonalScheduleGridQuery,
} from "../../api/groups.ts";
import {
  getDates
} from "../../services/tabularGraph.ts";

import {useSelector} from "react-redux";
import {RootState} from "@reduxjs/toolkit/dist/query/core/apiState";

import {ColorsTable} from "../../containers/ColorsTable";
import * as dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween';
import {useConfirmScheduleMutation} from "../../api/schedules.ts";
import {Option} from "../../types/components/options";
import {useGetHolidaysQuery} from "../../api/holidays.ts";

import {useGetDutyGroupsQuery} from "../../api/duties.ts";
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

dayjs.extend(isBetween)
const today = new Date();

const formatedToday = dayjs(today).format('YYYY-MM-DD');
const timeStart = new Date(today);
timeStart.setDate(today.getDate() - 3)

const timeEnd = new Date(today);
timeEnd.setDate(today.getDate() + 4)

export const PersonalSchedule = () => {
  const myDutyId = useSelector((state: RootState) => state.auth.userInfo.ID);
  const [agreeDuty] = useConfirmScheduleMutation()
  const [defaultTime, setDefaultTime] = useState({
    defaultTimeStart: timeStart,
    defaultTimeEnd: timeEnd
  })

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

  const timedelta = useSelector((state: RootState) => state.auth.timeDelta);

  const [table, setTable] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<Option | null>(null);

  const groupId = useMemo(() => selectedValue && selectedValue.value, [selectedValue])
  const groupName = useMemo(() => selectedValue && selectedValue.name, [selectedValue])

  const {data: allGroups = {}, isLoading: isLoadingAllGroups} = useGetAllGroupsQuery()
  const {data: groups = {}, isLoading: isLoadingGroups} = useGetDutyGroupsQuery({duty_id: myDutyId}, {skip: !myDutyId})

  const allGroupsOptions = useMemo(() => {
    if(allGroups.groups && allGroups.groups.length && groups.group_ids  && groups.group_ids.length) {
      return allGroups.groups.filter((el) => groups.group_ids.includes(el.group_id)).map((el) => ({
        name: el.group_name,
        value: el.group_id,
        title: el.group_name,
        id: el.group_id,
      }))
    }
    return []
  }, [allGroups, groups, groupId])

  const groupsOptions = useMemo(() => {
    if(allGroupsOptions.length) {
      if(groupId) {
        return allGroupsOptions.filter((el) => el.id === groupId)
      } else {
        return allGroupsOptions
      }
    } else return []
  }, [allGroupsOptions, groupId])

  const {data: groupGraph = {}, isLoading: isLoadingGraph} = useGetGroupPersonalScheduleGridQuery({
    duty_id: myDutyId,
    start_time: dayjs(defaultTime.defaultTimeStart).subtract(5, 'day').format('YYYY-MM-DD HH:mm:ss'),
    end_time: dayjs(defaultTime.defaultTimeEnd).add(5, 'day').format('YYYY-MM-DD HH:mm:ss'),
    timedelta: timedelta
  }, {skip: !myDutyId || table})

  const {data: groupTable = {}, isFetching: isLoadingTable} = useGetGroupPersonalScheduleGridQuery({
    duty_id: myDutyId,
    start_time: dayjs(timeTable.start_date).format('YYYY-MM-DD HH:mm:ss'),
    end_time: dayjs(timeTable.end_date).format('YYYY-MM-DD HH:mm:ss'),
    timedelta: timedelta
  }, {skip: !myDutyId || !table})

  const dates = useMemo(() => getDates(new Date(timeTable.start_date), new Date(timeTable.end_date)), [timeTable]);
  const groupGraphData = useMemo(() => {
    const data = []
    if(groupGraph.length) {
      groupGraph.forEach((duty) => {
        duty.schedules.forEach((el) => {
          data.push({
            ...el,
            id: el.schedule_id,
            group: el.group_id,
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

  const groupTableData = useMemo(() => {

    let data = []
    if(dates && dates.length && groupTable.length) {
      let schedules = groupTable
        .flatMap(item => item.schedules)
      if(groupId) {
        schedules = schedules.filter((el) => el.group_id === groupId)
      }
      data = dates.map((date) => {
        const convertedDate = convertDateFormat(date)
        const formatedDateOfWeek = dayjs(convertedDate).format('dddd')
        const formatedDate = dayjs(convertedDate).format('YYYY-MM-DD')
        return ({
          date: `${date} (${formatedDateOfWeek})`,
          id: date,
          isHoliday: holidaysData.includes(formatedDate) || (new Date(formatedDate)).getDay() === 0 || (new Date(formatedDate)).getDay() === 6,
          isToday: formatedDate === formatedToday,
          isGroup: true,
          subRows: [...schedules.filter((schedule) => dayjs(new Date(schedule.start_time)).format('DD.MM.YYYY') === date).map(el => {
            const startDate = dayjs(new Date(el.start_time)).format('DD.MM.YYYY')
            const endDate = dayjs(new Date(el.end_time)).format('DD.MM.YYYY')
            const isCurrent = dayjs(today).isBetween(dayjs(new Date(el.start_time)), dayjs(new Date(el.end_time)))
            const groupName = groupsOptions.length && groupsOptions.find((group) => group.id === el.group_id) && groupsOptions.find((group) => group.id === el.group_id).name
            return ({
              ...el,
              group_name: groupName,
              id: el.schedule_id,
              tooltip: isCurrent ? <div className={styles.tooltip}><b>Текущее дежурство</b></div> : '',
              start_time: dayjs(new Date(el.start_time)).format('HH:mm'),
              isCurrent: isCurrent,
              end_time: startDate === endDate ? dayjs(new Date(el.end_time)).format('HH:mm') : `${dayjs(new Date(el.end_time)).format('HH:mm')} (${endDate})`,
            })
          })].sort((a, b) => a.start_time.localeCompare(b.start_time)),
        })
      })
    }

    return data
  }, [groupTable, holidaysData, groupsOptions, groupId])

  useEffect(() => {
    setSelectedItems([])
    setSelectedItemsTable({})
  }, [table])

  useEffect(() => {
    setSelectedItems([])
    setSelectedItemsTable({})
  }, [tableView])

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const selected = useMemo(() => {
    if(selectedItems.length) return selectedItems;
    else if(Object.keys(selectedItemsTable) && Object.keys(selectedItemsTable).length) return Object.keys(selectedItemsTable)
    else return []
  }, [selectedItems, selectedItemsTable])

  const handleAgreeDuty = async(event) => {
    const items = selected.slice()
    try {
      if(event === 'agree') {
        await Promise.all(
          items.forEach(async(item) => {
            await agreeDuty({
              is_confirmed: true,
              scheduleId: item,
            })
          })
        );
      } else {
        await Promise.all(
          items.forEach(async(item) => {
            await agreeDuty({
              is_confirmed: false,
              scheduleId: item,
            })
          })
        );
      }

    }catch(e){}
    setSelectedItems([])
    setSelectedItemsTable([])
    setAnchorEl(null)
  }

  return (
    <>
      <MainLayout title={'Личный график'}/>
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
      </div>
      <div className={styles.toolbar}>
        <Box>
          <ChooseGroup
            options={allGroupsOptions}
            selectedValue={selectedValue}
            setSelectedValue={setSelectedValue}
          />
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
                disabled={!selected.length}
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
                <MenuItem className={styles.menuItem} onClick={() => handleAgreeDuty('agree')}>
                  <CheckIcon/>Подтвердить дежурства
                </MenuItem>
                <MenuItem className={styles.menuItem} onClick={() => handleAgreeDuty('disagree')}>
                  <ClearIcon/>Отказаться от дежурств
                </MenuItem>
              </Menu>
            </div>
          </div>
        </Box>
      </div>
      {
        groupsOptions.length && !table ? <ColorsTable
          colors={['gray', 'green', 'blue', 'white', 'red']}/> : null
      }
      {
        groupsOptions.length ?
          table ?
            <TableSchedule
              groups={groups}
              selectedGroup={groupId}
              setSelectedValue={setSelectedValue}
              selectedGroupName={groupName}
              data={groupTableData}
              timeTable={timeTable}
              setTimeTable={setTimeTable}
              isLoadingTable={isLoadingTable}
              selectedItems={selectedItemsTable}
              setSelectedItems={setSelectedItemsTable}
              tableView={tableView}
              setTableView={setTableView}
            />
            :
            <GraphSchedule
              selectedValue={groupId}
              groups={groupsOptions}
              items={groupGraphData}
              defaultTime={defaultTime}
              setDefaultTime={setDefaultTime}
              today={today}
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
              holidays={holidaysData}
            />
          : (!isLoadingGraph && !isLoadingTable && !isLoadingAllGroups && !isLoadingGroups) ?
            <div className={styles.message}>Вы не состоите в группах</div> : null
      }
    </>
  );
}

function convertDateFormat(dateStr) {
  const [day, month, year] = dateStr.split('.');
  return `${year}-${month}-${day}`;
}

