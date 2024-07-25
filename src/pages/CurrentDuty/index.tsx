import {MainLayout} from "../../containers/MainLayout/Layout.tsx";
import {
  useGetCurrentDutiesGroupMutation,
  useGetDutiesNotBusyGroupMutation, useGetDutyFromGroupOnDateMutation,
  useGetGroupsInfoQuery,
} from "../../api/groups.ts";
import React, {useEffect, useMemo, useRef, useState} from "react";
import styles from './styles.module.scss';
import cn from "classnames";
import {
  Box,
  Button,
  Grid,
  Menu,
  MenuItem,
  Paper,
  Switch,
  Table,
  TableBody,
  TableContainer,
  Tooltip
} from "@mui/material";
import { CloseCircleTwoTone } from '@ant-design/icons';
import {useSelector} from "react-redux";
import {RootState} from "@reduxjs/toolkit/dist/query/core/apiState";
import {MaterialReactTable, useMaterialReactTable} from "material-react-table";
import {MRT_Localization_RU} from "material-react-table/locales/ru";
import * as dayjs from "dayjs";

import {TableRowsLoader} from "../../components/TableRowsLoader";
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import {useReactToPrint} from "react-to-print";
import {DatePicker} from "antd";
import {ColorsTable} from "../../containers/ColorsTable";
import {download, generateCsv, mkConfig} from "export-to-csv";

const today = new Date();
const dayjsToday = dayjs(today)

function replaceKeys(obj: any, keysMap: { [key: string]: string }) {
  const newObj: { [key: string]: any } = {};
  for (const key in obj) {
    if (key in keysMap) {
      newObj[keysMap[key]] = obj[key];
    } else {
      newObj[key] = obj[key];
    }
  }
  return newObj;
}

const csvConfig = mkConfig({
  fieldSeparator: ';',
  decimalSeparator: '.',
  useKeysAsHeaders: true,
  filename: 'Текущие дежурные'
});

const dataTableNames = {
  group_name: 'Группа',
  name: 'ФИО',
  mail:  'Почта',
  mob_phone: 'Моб. телефон',
  work_phone: 'Раб. телефон',
  chief_info: 'Руководитель'
}

export const CurrentDuty = ({duties, usersData}) => {

  const componentRef = useRef();
  const timedelta = useSelector((state: RootState) => state.auth.timeDelta);
  const scopes = useSelector((state: RootState) => state.auth.scopes);
  const groupsManager = useSelector((state: RootState) => state.auth.groups);
  const [current, setCurrent] = useState(false);
  const [getCurrentDuties] = useGetCurrentDutiesGroupMutation()
  const [getNotBusyDuties] = useGetDutiesNotBusyGroupMutation()
  const chiefs = useSelector((state: RootState) => state.auth.chiefs);
  const [currentDuties, setCurrentDuties] = useState([])
  const [notBusyDuties, setNotBusyDuties] = useState([])
  const [dutiesOnDate, setDutiesOnDate] = useState([])
  const [fullInfo, setFullInfo] = useState(false)
  const [date, setDate] = useState('')

  const {data: groups = [], isLoading: isLoadingTable = []} = useGetGroupsInfoQuery({})

  const [getDutiesOnDate] = useGetDutyFromGroupOnDateMutation()

  const groupsData = useMemo(() => {
    return groups.length ? groups.map((group) => ({id: group.id, isGroup: true, group_name: group.name, subRows: group.content && group.content.length && group.content.map((duty) => {
      const chief = chiefs && chiefs.length && chiefs.filter((el) => el.user_id === duty.user_id) && chiefs.filter((el) => el.user_id === duty.user_id).length && chiefs.filter((el) => el.user_id === duty.user_id)[0].chief
      const isCurrentGroup = currentDuties.length && currentDuties.find((el) => el.id === group.id).duties
      const isNotBusyGroup = notBusyDuties.length && notBusyDuties.find((el) => el.id === group.id).duties
      const isCurrent = isCurrentGroup.length ? isCurrentGroup.includes(duty.user_id) : false
      const isNotBusy = isNotBusyGroup.length ? isNotBusyGroup.includes(duty.user_id) : false
      return ({
        ...duty,
        name: `${duty.last_name || ''} ${duty.first_name || ''} ${duty.sec_name || ''}`,
        group_name: group.name,
        group_id: group.id,
        chief: chief ? <div>
          <div><b>ФИО:</b> {chief.last_name || ''} {chief.first_name || ''} {chief.sec_name || ''}</div>
          <div><b>Почта:</b>  {chief.mail}</div>
          <div><b>Моб. телефон:</b>  {chief.mob_phone}</div>
          <div><b>Раб. телефон:</b>  {chief.work_phone}</div>
        </div> : null,
        chief_info: chief ? `${chief.first_name || ''} ${chief.first_name || ''} ${chief.sec_name || ''}, ${chief.mail}, ${chief.mob_phone}, ${chief.work_phone}` : '',
        isCurrent: isCurrent,
        isNotBusy: isNotBusy,
        tooltip: (duty.is_manager || isCurrent || isNotBusy) ?
          <div className={styles.tooltip}>
            {duty.is_manager ? <div><b>Менеджер</b></div> : ''}
            {duty.duty_id ? <div><b>Дежурный</b></div> : ''}
            {isCurrent ? <div>Текущее дежурство</div> : ''}
            {isNotBusy ? <div>Будущие дежурства не назначены</div> : ''}
          </div> : '',
      })
      }).sort((x, y) => x.name.localeCompare(y.name))
        .sort((x, y) => Number(y.isCurrent) - Number(x.isCurrent))
        .sort((x, y) => Number(y.is_manager) - Number(x.is_manager))
        .filter((el) => !fullInfo ? true : el.isCurrent)
        .filter((el) => {
          if(!current || !date) {
            return true
          }
          const findGroup = dutiesOnDate.length && dutiesOnDate.find(group => group.id === el.group_id)
          const duties = findGroup ? findGroup.duties : []

          return current && date && duties.length ? duties.includes(el.user_id) : false
        })
    })).sort((a, b) => a.group_name.localeCompare(b.group_name)) : []
  }, [groups, chiefs, currentDuties, notBusyDuties, groupsManager, scopes, fullInfo, current, date, dutiesOnDate])

  const columns = [
    {
      accessorKey: 'group_name',
      header: 'Группа',
      Cell: ({cell, renderedCellValue}) => {
        return <b>{!cell.row.original.name ? renderedCellValue : null}</b>
      },
      muiTableHeadCellProps: {
        align: 'center',
      },
    },
    {
      accessorKey: 'name',
      header: 'ФИО',
      Cell: ({cell, renderedCellValue}) => {
        return <Tooltip title={cell.row.original.tooltip}>
          <div className={cn({
            [styles.currentDuty]: cell.row.original.isCurrent,
            [styles.manager]: cell.row.original.is_manager,
            [styles.emptyDuty]: cell.row.original.isNotBusy,
          })}>{renderedCellValue}</div>
        </Tooltip>
      },
      muiTableHeadCellProps: {
        align: 'center',
      },
    },
    {
      accessorKey: 'mail',
      header: 'Почта',
      Cell: ({ cell, renderedCellValue }) => {
        return <div>{renderedCellValue}</div>
      },
      muiTableHeadCellProps: {
        align: 'center',
      },
      enableSorting: false
    },
    {
      accessorKey: 'mob_phone',
      header: 'Моб. телефон',
      Cell: ({ cell, renderedCellValue }) => {
        return <div>{renderedCellValue}</div>
      },
      muiTableHeadCellProps: {
        align: 'center',
      },
      enableSorting: false
    },
    {
      accessorKey: 'work_phone',
      header: 'Раб. телефон',
      Cell: ({ cell, renderedCellValue }) => {
        return <div>{renderedCellValue}</div>
      },
      muiTableHeadCellProps: {
        align: 'center',
      },
      enableSorting: false
    },
    {
      accessorKey: 'chief',
      header: 'Руководитель',
      Cell: ({ cell, renderedCellValue }) => {
        return <div>{renderedCellValue}</div>
      },
      muiTableHeadCellProps: {
        align: 'center',
      },
      enableSorting: false
    },
  ]

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportData = () => {
    const allData = []
    groupsData.forEach((el) => {
      el.subRows && el.subRows.forEach((row) => {
        allData.push({
          group_name: row.group_name,
          name: row.name,
          mail: row.mail,
          mob_phone: row.mob_phone,
          work_phone: row.work_phone,
          chief_info: row.chief_info
        })
      })
      return allData
    })

    const newData = allData.map(obj => replaceKeys(obj, dataTableNames));
    const csv = generateCsv(csvConfig)(newData);
    download(csvConfig)(csv);
  };

  const subRows = useMemo(() => {
    const rows = []
    if(groupsData.length) {
      groupsData.forEach((el => el.subRows && el.subRows.length && rows.push(...el.subRows)))
    }
    return rows
  }, [groupsData])

  useEffect(() => {
    try {
      const groupsIds = groups.length && groups.map((group) => group.id)
      if(groupsIds && groupsIds.length) {
        async function fetchCurrentDutiesData() {
          const results = await Promise.all(
            groupsIds.map(async (id) => {
              const response = await getCurrentDuties({
                group_id: id,
                timedelta,
                curr_time: dayjsToday.format('YYYY-MM-DD HH:mm:ss')
              });
              return { id, duties: response.data && response.data.duties ? response.data.duties.map((el) => el.user_id) : [] };
            })
          );
          setCurrentDuties(results)
        }
        async function fetchNotBusyDutiesData() {
          const results = await Promise.all(
            groupsIds.map(async (id) => {
              const response = await getNotBusyDuties({
                group_id: id,
                timedelta,
                curr_time: dayjsToday.format('YYYY-MM-DD HH:mm:ss')
              });
              return { id, duties: response.data && response.data.duties ? response.data.duties.map((el) => el.user_id) : [] };
            })
          );
          setNotBusyDuties(results)
        }
        fetchCurrentDutiesData();
        fetchNotBusyDutiesData()
      }

    }catch(e) {
      console.log(e)
    }

  }, [groups]);

  useEffect(() => {
    try {
      const groupsIds = groups.length && groups.map((group) => group.id)
      if(groupsIds && groupsIds.length) {
        async function fetchDutiesOnDate() {
          const results = await Promise.all(
            groupsIds.map(async (id) => {
              const response = await getDutiesOnDate({
                group_id: id,
                timedelta,
                date_to_search: dayjs(date).format('YYYY-MM-DD')
              });
              return { id, duties: response.data && response.data.duties ? response.data.duties.map((el) => el.user_id) : [] };
            })
          );
          setDutiesOnDate(results)
        }
        current && date && fetchDutiesOnDate();
      }

    }catch(e) {
      console.log(e)
    }

  }, [groups, current, date]);

  useEffect(() => {
    setFullInfo(false)
  }, [current])

  const table = useMaterialReactTable({
    columns,
    data: groupsData,
    enablePagination: true,
    paginateExpandedRows: false,
    enableExpanding: true,
    localization: MRT_Localization_RU,
    positionToolbarAlertBanner: 'none',
    positionGlobalFilter: "left",
    muiSearchTextFieldProps: {
      placeholder: 'Поиск',
      variant: 'outlined',
      sx: {
        width: '350px'
      },
    },
    state: {  showGlobalFilter: true },
    getSubRows: (originalRow) => originalRow.subRows,
    getRowId: (originalRow) => originalRow.id,
    initialState: {
      density: 'compact',
      expanded: true,
    },
    muiTableBodyRowProps: { hover: false },
    muiTableProps: {
      sx: {
        border: '1px solid rgba(81, 81, 81, .5)',
        caption: {
          captionSide: 'top',
        },
      },
    },
    muiTableHeadCellProps: {
      sx: {
        border: '1px solid rgba(81, 81, 81, .5)',
        fontWeight: 'bold',
      },
    },
    muiTableBodyCellProps: {
      sx: {
        border: '1px solid rgba(81, 81, 81, .5)',
      },
    },
    muiTableBodyProps: {
      sx: {
        '& tr:nth-of-type(odd) > td':
          {
            backgroundColor: 'rgba(229,229,243,0.2)',
          },
      }
    },
    enableFullScreenToggle: false,
    enableColumnFilters: false,
    enableGlobalFilter: true,
    enableDensityToggle: false,
    enableColumnActions: false,
    enableHiding: false,
    enableGlobalFilterModes: false,
    enableGlobalFilterRankedResults: false,
    renderToolbarInternalActions: ({ table }) => (
      <>
        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', p: '4px' }}>
          <Box sx={{ display: 'flex'}}>
            <Button
              variant="contained"
              className={styles.btn}
              disabled={current}
              sx={{ marginRight: '10px'}}
              onClick={() => setFullInfo((prevState => !prevState))}
            >
              {fullInfo ? 'Полная информация' : 'Краткая информация'}
            </Button>
            <Button variant="contained" disabled={!subRows.length}  onClick={handleExportData}>
              Выгрузить
            </Button>
          </Box>
        </Box>
      </>
    ),
  });

  const handleKeyPress = (event) => {
    const { key } = event;
    const allowedCharacters = /[0-9:. ]|Backspace|Delete|ArrowLeft|ArrowRight/;

    if (!allowedCharacters.test(key)) {
      event.preventDefault();
    }
  };


  return (
    <>
      <MainLayout title={'Текущие дежурные'}/>
      <div className={styles.container}>
        <div className={styles.switch}>
          <Grid component="label" container alignItems="center" spacing={1}>
            <Grid item>Дежурят в данный момент</Grid>
            <Grid item>
              <Switch
                checked={current}
                onChange={() => setCurrent((prevState) => !prevState)}
                value="checked"
                className={styles.input}
              />
            </Grid>
            <Grid item>Дежурные на дату</Grid>
          </Grid>
        </div>
        {
          current && (
            <div className={styles.datePickerContainer}>
              <DatePicker
                format="DD.MM.YYYY"
                onKeyDown={handleKeyPress}
                size={'large'}
                allowClear={{clearIcon:<Tooltip title={'Очистить'}><CloseCircleTwoTone/></Tooltip>}}
                placeholder='Выберите дату'
                onChange={(dateStrings) => {
                  if (dateStrings) {
                    const selectedDate = dateStrings.toDate()
                    setDate(selectedDate)
                  }
                }}
              />
            </div>
          )
        }
        {
          <ColorsTable
            colors={['green']}/>
        }
      </div>
      {
        isLoadingTable ? (
          <TableContainer component={Paper}>
            <Table>
              <TableBody className={styles.sceleton}>
                <TableRowsLoader rowsNum={6}/>
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <div ref={componentRef}>
            <MaterialReactTable table={table}/>
          </div>
        )
      }
    </>
  );
}