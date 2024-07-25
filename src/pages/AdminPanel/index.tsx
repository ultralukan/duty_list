import {MainLayout} from "../../containers/MainLayout/Layout.tsx";
import React, {useEffect, useMemo, useState} from "react";

import styles from "./styles.module.scss";

import {
  Autocomplete,
  Box,
  Button, Chip,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TextField,
  Tooltip
} from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import {ChooseGroup} from "../../components/ChooseGroup";
import {useGetAllGroupsQuery, useGetGroupsContentQuery} from "../../api/groups.ts";
import EditIcon from "@mui/icons-material/Edit";
import UploadIcon from '@mui/icons-material/Upload';
import {AddRolesModal} from "../../components/Modal/AddRolesModal";
import {AddUser} from "../../components/Modal/AddUser";
import {LogsModal} from "../../components/Modal/LogsModal";
import InputFileUpload from "../../components/Modal/UploadDuties";
import {useSelector} from "react-redux";
import {RootState} from "@reduxjs/toolkit/dist/query/core/apiState";
import {SetReceiversModal} from "../../components/Modal/SetReceivers";
import {useGetReceiversQuery} from "../../api/notification.ts";
import {CalendarModal} from "../../components/Modal/CalendarModal";
import {useGetUsersInfoQuery} from "../../api/duties.ts";
import {TableRowsLoader} from "../../components/TableRowsLoader";
import {MaterialReactTable, useMaterialReactTable} from "material-react-table";
import {MRT_Localization_RU} from "material-react-table/locales/ru";

import {useGetRolesQuery} from "../../api/roles.ts";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import ManagerIcon from "../../components/Icons/ManagerIcon.tsx";

const rolesNames = {
  'admin': 'Администратор',
  'duty': 'Дежурный',
  'manager': 'Менеджер',
  'dispatcher': 'Диспетчер'
}

export const AdminPanel = ({duties}) => {
  const {data: users = [], isLoading} = useGetUsersInfoQuery()
  const [openCalendar, setOpenCalendar] = useState(false);
  const {data: roles = {}} = useGetRolesQuery()
  const {data: groups = {}} = useGetAllGroupsQuery()
  const {data: receivers = []} = useGetReceiversQuery()
  const [selected, setSelected] = useState({})
  const [selectedRoleValue, setSelectedRoleValue] = useState([]);
  const [selectedGroupValue, setSelectedGroupValue] = useState([]);
  const [openCreateDutyModal, setOpenCreateDutyModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [openReceiv, setOpenReceiv] = useState(false)
  const [openLogsModal, setOpenLogsModal] = useState(false);

  const dutiesOptions = useMemo(() => {
    return (duties.duties && duties.duties.length) ? duties.duties.map((duty) => ({value: duty.user_id, duty_id: duty.duty_id, name: `${duty.last_name || ''} ${duty.first_name || ''} ${duty.sec_name || ''} (${duty.mail || ''})`})) : []
  }, [duties])

  const rolesOptions = useMemo(() => {
    if(roles.roles && roles.roles.length) {
      return roles.roles.map((role) => ({
        name: rolesNames[role.role_name],
        value: role.role_id,
      })).sort((a, b) => a.name.localeCompare(b.name))
    }
    return []
  }, [roles])

  const groupsOptions = useMemo(() => {
    if(groups.groups && groups.groups.length) {
      return groups.groups.map((group) =>({
        name: group.group_name,
        value: group.group_id
      }))
    }
    return []
  }, [groups])

  const receiversOptions = useMemo(() => receivers.length && receivers.map((el) => ({value: el.mail_id, name: el.mail})) || [], [receivers])


  const usersData = useMemo(() => {
    if (users.length) {
      return users.map((user) => {
        const accessesCopy = [...user.accesses];
        if (accessesCopy.length) {
          accessesCopy.sort((a, b) => a.role_name.localeCompare(b.role_name));
        }
        const dutyRole = accessesCopy.filter((el) => el.role_name === 'duty') && accessesCopy.filter((el) => el.role_name === 'duty')[0]
        const dutyGroups = dutyRole && dutyRole.groups ? dutyRole.groups : []
        const managerRole = accessesCopy.filter((el) => el.role_name === 'manager') && accessesCopy.filter((el) => el.role_name === 'manager')[0]
        const managerGroups = managerRole && managerRole.groups ? managerRole.groups : []
        const duty = dutiesOptions.length && dutiesOptions.find((el) => el.value === user.user_id) || null
        return {
          ...user,
          value: user.user_id,
          name: `${user.last_name || ''} ${user.first_name || ''} ${user.sec_name || ''}`,
          roles_names: accessesCopy.map((el) => rolesNames[el.role_name]),
          dutyGroups,
          managerGroups,
          rolesArr: accessesCopy.length && accessesCopy.map((el) => el.role_name),
          duty_id: duty && duty.duty_id,
          roles: accessesCopy.map((el) => el.role_name) ? (
            <div>
              {accessesCopy.map((el, index) => (
                <div key={index}>
                  {el.groups && el.groups.length ? (
                    <div>
                      <b>{rolesNames[el.role_name]}:</b>
                      {el.groups.map((group, groupIndex) => (
                        <span key={groupIndex}>
                          <div>&#8195;{groupsOptions.length && groupsOptions.find((el) => el.value == group).name}</div>
                      </span>
                      ))}
                    </div>
                  ) : (
                    <div><b>{rolesNames[el.role_name]}</b></div>
                  )}
                </div>
              ))}
            </div>
          ) : null,
        };
      }).filter((user) => selectedRoleValue.length ? user.roles_names.some(value => selectedRoleValue.map((el) => el.name).includes(value)) : true)
        .filter((user) => selectedGroupValue.length ? [...user.dutyGroups, ...user.managerGroups].some(value => selectedGroupValue.map((el) => el.value).includes(value)) : true)
    }
    return users;
  }, [users, groupsOptions, selectedRoleValue, selectedGroupValue, dutiesOptions]);

  const columns = [
    {
      accessorKey: 'name',
      header: 'ФИО',
      Cell: ({ cell, renderedCellValue }) => {
        return <span>{renderedCellValue}</span>
      },
      enableGrouping: false,
      muiTableHeadCellProps: {
        align: 'center',
      },
    },
    {
      accessorKey: 'roles',
      header: 'Роль',
      Cell: ({ cell, renderedCellValue }) => {
        return <div>{renderedCellValue}</div>
      },
      muiTableHeadCellProps: {
        align: 'center',
      },
      enableSorting: false
    },
    {
      accessorKey: 'mail',
      header: 'Почта',
      Cell: ({ cell, renderedCellValue }) => {
        return <span>{renderedCellValue}</span>

      },
      enableGrouping: false,
      muiTableHeadCellProps: {
        align: 'center',
      },
      enableSorting: false
    },
    {
      accessorKey: 'mob_phone',
      header: 'Моб. телефон',
      Cell: ({ cell, renderedCellValue }) => {
        return <span>{renderedCellValue}</span>
      },
      enableGrouping: false,
      muiTableHeadCellProps: {
        align: 'center',
      },
      enableSorting: false
    },
    {
      accessorKey: 'work_phone',
      header: 'Раб. телефон',
      Cell: ({ cell, renderedCellValue }) => {
        return <span>{renderedCellValue}</span>

      },
      enableGrouping: false,
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


  const table = useMaterialReactTable({
    columns,
    data: usersData,
    enablePagination: true,
    paginateExpandedRows: false,
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
    state: {  showGlobalFilter: true, rowSelection: selected },
    onRowSelectionChange: (old) => {
      setSelected((prevState) => {
        if(Object.keys(prevState).includes(old())) {
          return []
        }
        else return old()
      })
    },
    getRowId: (originalRow) => originalRow.user_id,
    initialState: {
      density: 'compact',
      showColumnFilters: true
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
    enableRowSelection: true,
    enableSelectAll: false,
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
                  setOpenLogsModal(true)
                  handleCloseMenuActions()
                }}
              >
                <DownloadIcon/>
                Выгрузить логи
              </MenuItem>
              <MenuItem
                className={styles.menuItem}
                onClick={() => {
                  setOpenCalendar(true)
                  handleCloseMenuActions()
                }}
              >
                <CalendarMonthIcon/>
                Редактировать календарь
              </MenuItem>
              <MenuItem
                className={styles.menuItem}
                onClick={() => {
                  setOpenReceiv(true)
                  handleCloseMenuActions()
                }}
              >
                <EditIcon/>
                Редактировать получателей уведомлений
              </MenuItem>
            </Menu>
            <InputFileUpload/>
            <Button
              id={`button-actions`}
              aria-controls={openMenu ? `button-actions` : undefined}
              aria-haspopup="true"
              aria-expanded={openMenu ? 'true' : undefined}
              onClick={handleClickMenu}
              sx={{ marginLeft: '10px'}}
              variant="contained"
              className={styles.btn}
            >
              Пользователи
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
                setOpenCreateDutyModal(true)
                handleCloseMenu()
              }}>
                <AddIcon/>Добавить пользователя
              </MenuItem>
              <MenuItem className={styles.menuItem}
                disabled={!selectedUser}
                onClick={() => {
                  setOpen(true)
                  handleCloseMenu()
                }}>
                <EditIcon/>Редактировать пользователя
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </>
    ),
  });

  const selectedUser = useMemo(() => {
    if(Object.keys(selected).length) {
      const id = Object.keys(selected)[0]
      return usersData.find((el) => el.user_id === id)
    }
    return null
  }, [selected, usersData])

  return (
    <>
      <MainLayout title={'Панель администратора'}/>
      <div className={styles.toolbar}>
        <Box sx={{p: '4px', display: 'flex', justifyContent: 'center'}} className={styles.input}>
          <Autocomplete
            options={rolesOptions}
            sx={{ marginRight: '10px'}}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            value={selectedRoleValue}
            onChange={(e, newValue) => setSelectedRoleValue(newValue)}
            multiple
            className={styles.input}
            renderInput={(params) => (
              <TextField
                {...params}
                label={'Выберите роль'}
                variant="outlined"
                style={{ width: '400px' }}
              />
            )}
          />
          <Autocomplete
            options={groupsOptions}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            value={selectedGroupValue}
            onChange={(e, newValue) => setSelectedGroupValue(newValue)}
            multiple
            className={styles.input}
            renderInput={(params) => (
              <TextField
                {...params}
                label={'Выберите группу'}
                variant="outlined"
                style={{ width: '400px' }}
              />
            )}
            renderTags={(value, getTagProps) => {
              const numTags = value.length;
              const limitTags = 3;

              return (
                <>
                  {value.slice(0, limitTags).map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={index}
                      label={option.name}
                    />
                  ))}

                  {numTags > limitTags && ` +${numTags - limitTags}`}
                </>
              );
            }}
          />
        </Box>
      </div>
      {
        isLoading ? (
          <TableContainer component={Paper}>
            <Table>
              <TableBody className={styles.sceleton}>
                <TableRowsLoader rowsNum={6}/>
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <MaterialReactTable table={table}/>
        )
      }
      <AddRolesModal setSelected={setSelected} open={open} setOpen={setOpen} options={usersData} user={selectedUser} groupsOptions={groupsOptions}/>
      <AddUser open={openCreateDutyModal} setOpen={setOpenCreateDutyModal}/>
      <LogsModal open={openLogsModal} setOpen={setOpenLogsModal}/>
      <SetReceiversModal open={openReceiv} setOpen={setOpenReceiv} options={receiversOptions}/>
      <CalendarModal open={openCalendar} setOpen={setOpenCalendar}/>
    </>
  );
}