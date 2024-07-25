import React, {useEffect, useRef, useState} from 'react';
import {MaterialReactTable, MRT_ColumnDef, MRT_ToggleDensePaddingButton} from 'material-react-table';
import {Box, Button, Menu, MenuItem, ThemeProvider} from "@mui/material";
import styles from './styles.module.scss';
import {MRT_Localization_RU} from "material-react-table/locales/ru";
import {CreateGroupModal} from "../../Modal/CreateGroupModal";
import {ColumnsData} from "../../../types/components/table";
import { IconButton } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import {useReactToPrint} from "react-to-print";
import {useGetDownloadTableMutation} from "../../../api/groups.ts";
import axios from "axios";
import DownloadIcon from '@mui/icons-material/Download';

interface DutyGroupsTableProps {
  data: ColumnsData[];
  columns: MRT_ColumnDef<ColumnsData>[];
  toolbar?: boolean;
  isExpanded: boolean;
}

export const DutyGroupsTable: React.FC<DutyGroupsTableProps> = ({data, groupsColumnsWithoutActions, columns, toolbar = true, isExpanded = false}) => {
  const [openCreateGroupModal, setOpenCreateGroupModal] = useState(false)
  const [expanded, setExpanded] = useState(isExpanded);

  const [downloadTable] = useGetDownloadTableMutation({})
  const componentRef = useRef();
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
      <div className={styles.table}>
        <ThemeProvider theme={{}}>
          <MaterialReactTable
            columns={columns}
            data={data}
            enableExpanding
            enablePagination={false}
            onExpandedChange={setExpanded}
            enableBottomToolbar={false}
            getRowId={(originalRow) => originalRow.user_id ? `${originalRow.user_id}-${originalRow.group_id}` : originalRow.group_id}
            enableFullScreenToggle={false}
            globalFilterFn={'contains'}
            positionToolbarAlertBanner={'none'}
            muiTableProps={{
              sx: {
                border: '1px solid rgba(81, 81, 81, 1)',
              },
            }}
            muiTableHeadCellProps={{
              sx: {
                border: '1px solid rgba(81, 81, 81, 1)',
                fontWeight: 'bold',
                fontSize: '16px',
              },
            }}
            muiTableBodyCellProps={{
              sx: {
                border: '1px solid rgba(81, 81, 81, 1)',
                fontSize: '14px',
              },
            }}
            muiTableBodyProps={{
              sx: {
                '& tr:nth-of-type(odd)': {
                  backgroundColor: 'rgba(232,232,253,0.2)',
                },
                '& tr:nth-of-type': {
                  filter: 'none',
                },
              },
            }}
            muiTableBodyRowProps={{ hover: false }}
            positionGlobalFilter="left"
            muiSearchTextFieldProps={{
              placeholder: 'Поиск группы',
              variant: 'outlined',
              sx: {
                width: '350px'
              },
            }}
            enableDensityToggle={false}
            enableColumnActions={false}
            enableHiding={false}
            localization={MRT_Localization_RU}
            state={
              {
                expanded
              }
            }
            initialState={{ density: 'compact', showGlobalFilter: true, expanded: expanded}}
            renderToolbarInternalActions={(table) => (
              toolbar ? (
                <Box className={styles.toolbar} sx={{ p: '4px' }}>
                  <Button variant="contained" color="primary" onClick={() => setOpenCreateGroupModal(true)}>
                    Создать группу
                  </Button>
                  <Button
                    id={`button-actions`}
                    aria-controls={openMenu ? `button-actions` : undefined}
                    aria-haspopup="true"
                    aria-expanded={openMenu ? 'true' : undefined}
                    onClick={handleClickMenu}
                    variant="contained"
                    className={styles.btn}
                  >
                    Действия
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
                    <MenuItem className={styles.menuItem} onClick={() => handlePrint(table)}>
                      <PrintIcon/>
                      Печать
                    </MenuItem>
                    <MenuItem className={styles.menuItem} onClick={handleClick}>
                      <DownloadIcon/>
                      Скачать
                    </MenuItem>
                  </Menu>
                </Box>
              ) : (
                <Box className={styles.toolbar} sx={{ p: '4px' }}>
                  <Button className={styles.print} variant="outlined" color="primary" onClick={() => {
                    setExpanded(true)
                    handlePrint(table)
                  }}>
                    <PrintIcon className={styles.printIcon} />
                    Печать / Скачать
                  </Button>
                </Box>
              )
            )}
          />
        </ThemeProvider>
        <CreateGroupModal open={openCreateGroupModal} setOpen={setOpenCreateGroupModal}/>
      </div>
      <div ref={componentRef} className={styles.tableHidden}>
        <ThemeProvider theme={{}}>
          <MaterialReactTable
            columns={groupsColumnsWithoutActions || columns}
            data={data}
            enableExpanding
            enablePagination={false}
            enableBottomToolbar={false}
            enableFullScreenToggle={false}
            globalFilterFn={'contains'}
            positionToolbarAlertBanner={'none'}
            muiTableProps={{
              sx: {
                border: '1px solid rgba(81, 81, 81, 1)',
              },
            }}
            muiTableHeadCellProps={{
              sx: {
                border: '1px solid rgba(81, 81, 81, 1)',
                fontWeight: 'bold',
                fontSize: '16px',
              },
            }}
            muiTableBodyCellProps={{
              sx: {
                border: '1px solid rgba(81, 81, 81, 1)',
                fontSize: '14px',
              },
            }}
            muiTableBodyProps={{
              sx: {
                '& tr:nth-of-type(odd)': {
                  backgroundColor: 'rgba(232,232,253,0.2)',
                },
                '& tr:nth-of-type': {
                  filter: 'none',
                },
              },
            }}
            muiTableBodyRowProps={{ hover: false }}
            positionGlobalFilter="left"
            muiSearchTextFieldProps={{
              placeholder: 'Поиск группы',
              variant: 'outlined',
              sx: {
                width: '350px'
              },
            }}
            enableDensityToggle={false}
            enableColumnActions={false}
            enableHiding={false}
            localization={MRT_Localization_RU}
            initialState={{ density: 'compact', showGlobalFilter: true, expanded: true}}
            renderToolbarInternalActions={(table) => (
              toolbar ? (
                <Box className={styles.toolbar} sx={{ p: '4px' }}>
                  <Button variant="contained" color="primary" onClick={() => setOpenCreateGroupModal(true)}>
                    Создать группу
                  </Button>
                  <Button className={styles.print} variant="outlined" color="primary" onClick={() => {
                    setExpanded(true)
                    handlePrint(table)
                  }}>
                    <PrintIcon />
                    Печать
                  </Button>
                </Box>
              ) : (
                <Box className={styles.toolbar} sx={{ p: '4px' }}>
                  <Button className={styles.print} variant="outlined" color="primary" onClick={() => {
                    setExpanded(true)
                    handlePrint(table)
                  }}>
                    <PrintIcon className={styles.printIcon} />
                    Печать
                  </Button>
                </Box>
              )
            )}
          />
        </ThemeProvider>
      </div>
    </>
  );
};