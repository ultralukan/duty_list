import {MainLayout} from "../../containers/MainLayout/Layout.tsx";
import {
  useGetCurrentDutiesGroupMutation,
  useGetDownloadTableMutation, useGetDutiesNotBusyGroupMutation,
  useGetGroupsInfoQuery,
} from "../../api/groups.ts";
import React, {useEffect, useMemo, useRef, useState} from "react";
import styles from './styles.module.scss';
import cn from "classnames";
import {Box, Button, Menu, MenuItem, Paper, Table, TableBody, TableContainer, Tooltip} from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import {DeleteGroupModal} from "../../components/Modal/DeleteGroupModal";
import {EditGroupModal} from "../../components/Modal/EditGroupModal";
import {AddDutyToGroupModal} from "../../components/Modal/AddDutyToGroupModal";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {useSelector} from "react-redux";
import {RootState} from "@reduxjs/toolkit/dist/query/core/apiState";
import {SetGroupManagerModal} from "../../components/Modal/SetGroupManager";
import ManagerIcon from "../../components/Icons/ManagerIcon.tsx";
import {MaterialReactTable, MRT_GlobalFilterTextField, useMaterialReactTable} from "material-react-table";
import {MRT_Localization_RU} from "material-react-table/locales/ru";
import * as dayjs from "dayjs";

import {TableRowsLoader} from "../../components/TableRowsLoader";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import {useReactToPrint} from "react-to-print";
import {Simulate} from "react-dom/test-utils";

import {CreateGroupModal} from "../../components/Modal/CreateGroupModal";

const today = new Date();
const dayjsToday = dayjs(today)

export const GroupsPage = ({duties, usersData}) => {

  const [openDeleteGroupModal, setOpenDeleteGroupModal] = useState<boolean>(false)
  const [createGroupModal, setCreateGroupModal] = useState<boolean>(false)
  const [openEditGroupModal, setOpenEditGroupModal] = useState<boolean>(false)
  const [openAddDutyModal, setOpenAddDutyModal] = useState<boolean>(false)
  const [openGroupManagerModal, setGroupManagerModal] = useState<boolean>(false)

  const componentRef = useRef();
  const timedelta = useSelector((state: RootState) => state.auth.timeDelta);
  const scopes = useSelector((state: RootState) => state.auth.scopes);
  const groupsManager = useSelector((state: RootState) => state.auth.groups);

  const [getCurrentDuties] = useGetCurrentDutiesGroupMutation()
  const [getNotBusyDuties] = useGetDutiesNotBusyGroupMutation()
  const chiefs = useSelector((state: RootState) => state.auth.chiefs);
  const [currentDuties, setCurrentDuties] = useState([])
  const [notBusyDuties, setNotBusyDuties] = useState([])
  const [selected, setSelected] = useState({})
  const selectedItems = useMemo(() => {
    const keys = Object.keys(selected)
    if(keys && keys.length) {
      return keys
    }
    else return []
  }, [selected])

  const {data: groups = [], isLoading: isLoadingTable = []} = useGetGroupsInfoQuery({})
  const canDoActions = scopes.includes('admin') || scopes.includes('manager')


  const dutiesOptions = useMemo(() => {
    return (duties.duties && duties.duties.length) ? duties.duties.map((duty) => ({value: duty.user_id, duty_id: duty.duty_id, name: `${duty.last_name || ''} ${duty.first_name || ''} ${duty.sec_name || ''} (${duty.mail || ''})`})) : []
  }, [duties])

  const [downloadTable] = useGetDownloadTableMutation()
  const groupsData = useMemo(() => {
    return groups.length ? groups.map((group) => ({id: group.id, isGroup: true, canSelect: groupsManager.includes(group.id) || scopes.includes('admin'), group_name: group.name, subRows: group.content && group.content.length && group.content.map((duty) => {
      const chief = chiefs && chiefs.length && chiefs.filter((el) => el.user_id === duty.user_id) && chiefs.filter((el) => el.user_id === duty.user_id).length && chiefs.filter((el) => el.user_id === duty.user_id)[0].chief
      const isCurrentGroup = currentDuties.length && currentDuties.find((el) => el.id === group.id).duties
      const isNotBusyGroup = notBusyDuties.length && notBusyDuties.find((el) => el.id === group.id).duties
      const isCurrent = isCurrentGroup.length ? isCurrentGroup.includes(duty.user_id) : false
      const isNotBusy = isNotBusyGroup.length ? isNotBusyGroup.includes(duty.user_id) : false
      return ({
        ...duty,
        name: `${duty.last_name || ''} ${duty.first_name || ''} ${duty.sec_name || ''}`,
        group_name: group.name,
        chief: chief ? <div>
          <div><b>ФИО:</b> {chief.last_name || ''} {chief.first_name || ''} {chief.sec_name || ''}</div>
          <div><b>Почта:</b>  {chief.mail}</div>
          <div><b>Моб. телефон:</b>  {chief.mob_phone}</div>
          <div><b>Раб. телефон:</b>  {chief.work_phone}</div>
        </div> : null,
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
      }).sort((x, y) => x.name.localeCompare(y.name)).sort((x, y) => Number(y.is_manager) - Number(x.is_manager))
    })).sort((a, b) => a.group_name.localeCompare(b.group_name)) : []
  }, [groups, chiefs, currentDuties, notBusyDuties, groupsManager, scopes])

  const groupsOptions = useMemo(() => {
    return groups.length ? groups.map((group) => ({value: group.id, name: group.name})) : []
  }, [groups])

  const selectedGroup = useMemo(() => {

    const filteredGroup = groups.find((group) => group.id == selectedItems[0])
    return groups.length && selectedItems.length && filteredGroup && [filteredGroup].map((group) => {
      const managers = group.content.length ? group.content.filter((user) => user.is_manager)
        .map((user) => ({value: user.user_id, name: `${user.last_name || ''} ${user.first_name || ''} ${user.sec_name || ''} (${user.sec_name || ''})`})) : []
      const duties = group.content.length ? group.content.filter((user) => user.duty_id)
        .map((user) => ({value: user.user_id, duty_id: user.duty_id, name: `${user.last_name || ''} ${user.first_name || ''} ${user.sec_name || ''} (${user.sec_name || ''})`})) : []
      return({
        id: group.id,
        name: group.name,
        managers: managers,
        duties: duties
      })
    })[0]
  }, [groups, selectedItems])

  const dutiesOptionsNotInGroup = useMemo(() => {
    const groupDuties = (selectedGroup && selectedGroup.duties.length) ? selectedGroup.duties.map((el) => el.value) : []
    return (selectedGroup && groupDuties.length) ? dutiesOptions.filter((duty) => !groupDuties.includes(duty.value)) : dutiesOptions
  }, [selectedGroup, dutiesOptions])


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

  const [anchorElActions, setAnchorElActions] = React.useState<null | HTMLElement>(null);
  const openMenuActions = Boolean(anchorElActions);
  const handleCloseMenuActions = () => {
    setAnchorElActions(null);
  };

  const handleClickMenuActions = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElActions(event.currentTarget);
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current.querySelector('.MuiTableContainer-root'),
    pageStyle: "@page { size: 20in }"
  });

  const handleClick = async() => {
    try {
      const response = await downloadTable()
      const blob = new Blob([response.data], { type: 'text/csv' });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.href = url;
      a.download = 'groups.xlsx';
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (e) {

    }
  }

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

  const notInGroupManagers = useMemo(() => {
    if(dutiesOptions.length && selectedGroup && selectedGroup.managers) {
      return dutiesOptions.filter((duty) => !selectedGroup.managers.map((manager) => manager.value).includes(duty.value))
    }
    else return dutiesOptions
  }, [selectedGroup, dutiesOptions])

  const table = useMaterialReactTable({
    columns,
    data: groupsData,
    enableRowSelection: (row) => row.original.canSelect,
    enableSubRowSelection: false,
    enablePagination: true,
    paginateExpandedRows: false,
    enableSelectAll: false,
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
    state: { rowSelection: selected, showGlobalFilter: true },
    getSubRows: (originalRow) => originalRow.subRows,
    getRowId: (originalRow) => originalRow.id,
    onRowSelectionChange: (old) => {
      setSelected((prevState) => {
        if(Object.keys(prevState).includes(old())) {
          return []
        }
        else return old()
      })
    },
    initialState: {
      density: 'compact',
      expanded: false,
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
              id={`button-actions`}
              sx={{ marginRight: '10px'}}
              aria-controls={openMenuActions ? `button-actions` : undefined}
              aria-haspopup="true"
              aria-expanded={openMenuActions ? 'true' : undefined}
              onClick={handleClickMenuActions}
              variant="contained"
              className={styles.btn}
              disabled={!canDoActions}
            >
              Действия
            </Button>
            <Menu
              id="basic-menu"
              anchorEl={anchorElActions}
              open={openMenuActions}
              onClose={handleCloseMenuActions}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
            >
              <MenuItem
                className={styles.menuItem}
                onClick={() => {
                  setCreateGroupModal(true)
                  handleCloseMenuActions()
                }}
                disabled={!scopes.includes('admin')}
              >
                <AddIcon/>
                Создать группу
              </MenuItem>
              <MenuItem
                className={styles.menuItem}
                onClick={() => {
                  setOpenDeleteGroupModal(true)
                  handleCloseMenuActions()
                }}
                disabled={!selectedItems.length || !scopes.includes('admin')}
              >
                <DeleteIcon/>
                Удалить группу
              </MenuItem>
              <MenuItem
                className={styles.menuItem}
                disabled={!selectedItems.length || !scopes.includes('admin')}
                onClick={() => {
                  setOpenEditGroupModal(true)
                  handleCloseMenuActions()
                }}
              >
                <EditIcon/>
                Редактировать группу
              </MenuItem>
              <MenuItem
                className={styles.menuItem}
                disabled={!selectedItems.length}
                onClick={() => {
                  setOpenAddDutyModal(true)
                  handleCloseMenuActions()
                }}
              >
                <PersonIcon/>
                Редактировать дежурных
              </MenuItem>
              <MenuItem
                className={styles.menuItem}
                disabled={!selectedItems.length || !scopes.includes('admin')}
                onClick={() => {
                  setGroupManagerModal(true)
                  handleCloseMenuActions()
                }}
              >
                <ManagerIcon/>
                Редактировать менеджеров
              </MenuItem>
            </Menu>
            <Button
              id={`button-actions`}
              aria-controls={openMenu ? `button-actions` : undefined}
              aria-haspopup="true"
              aria-expanded={openMenu ? 'true' : undefined}
              onClick={handleClickMenu}
              variant="contained"
              className={styles.btn}
            >
              Таблица
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
              {/*<MenuItem className={styles.menuItem} onClick={() => handlePrint(table)}>*/}
              {/*  <PrintIcon/>*/}
              {/*  Печать*/}
              {/*</MenuItem>*/}
              <MenuItem className={styles.menuItem} onClick={handleClick}>
                <DownloadIcon/>
                Скачать
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </>
    ),
  });


  return (
    <>
      <MainLayout title={'Группы дежурных'}/>
      {
        isLoadingTable ? (
          <TableContainer component={Paper}>
            <Table>
              <TableBody className={styles.sceleton}>
                <TableRowsLoader rowsNum={6} />
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <div ref={componentRef}>
            <MaterialReactTable table={table} />
          </div>
        )
      }
      <CreateGroupModal open={createGroupModal} setOpen={setCreateGroupModal} />
      {
        selectedGroup ? (
          <>
            <DeleteGroupModal groupName={selectedGroup && selectedGroup.name} open={openDeleteGroupModal} setOpen={setOpenDeleteGroupModal} setGroupId={setSelected} groupId={selectedGroup && selectedGroup.id} duties={selectedGroup && selectedGroup.duties.length}/>
            <EditGroupModal open={openEditGroupModal} setOpen={setOpenEditGroupModal} setGroupId={setSelected} groupId={selectedGroup && selectedGroup.id} groupName={selectedGroup && selectedGroup.name}/>
            <SetGroupManagerModal setGroupId={setSelected} open={openGroupManagerModal} setOpen={setGroupManagerModal} groupName={selectedGroup && selectedGroup.name} groupId={selectedGroup && selectedGroup.id} options={groupsOptions} dutiesOptions={notInGroupManagers} selectedManagersOptions={selectedGroup && selectedGroup.managers}/>
            <AddDutyToGroupModal setGroupId={setSelected} open={openAddDutyModal} setOpen={setOpenAddDutyModal} groupName={selectedGroup && selectedGroup.name} groupId={selectedGroup && selectedGroup.id} options={groupsOptions} dutiesOptions={dutiesOptionsNotInGroup} dutiesForDeleteOptions={selectedGroup && selectedGroup.duties}/>
          </>
        ) : null
      }
    </>
  );
}