import React, {useMemo, useState} from 'react';
import {Box, Button, Paper, Tooltip, Table, TableBody, TableContainer} from "@mui/material";
import styles from './styles.module.scss';
import cn from "classnames";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import * as dayjs from "dayjs";
import {MaterialReactTable, MRT_RowSelectionState, useMaterialReactTable} from "material-react-table";
import {MRT_Localization_RU} from "material-react-table/locales/ru";
import {TableRowsLoader} from "../../../components/TableRowsLoader";
import {download, generateCsv, mkConfig} from "export-to-csv";

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
  filename: 'График дежурств'
});

const dataTableNames = {
  group_name: 'Группа',
  date: 'Дата',
  name: 'ФИО',
  start_time:  'Время начала',
  end_time: 'Время окончания',
}

export const TableSchedule = ({
  data,
  timeTable,
  setTimeTable,
  isLoadingTable,
  selectedItems,
  setSelectedItems,
  tableView,
  setTableView,
}) => {

  const columns = [
    {
      accessorKey: 'date',
      header: 'Дата',
      Cell: ({ cell, renderedCellValue }) => {
        return <Tooltip title={cell.row.original.tooltip}>
          <b>{cell.row.original.isGroup ? <span className={cn({
            [styles.currentDate]: cell.row.original.isToday,
            [styles.holiday]: cell.row.original.isHoliday
          })}>
            {renderedCellValue}</span> : null}</b>
        </Tooltip>
      },
      muiTableHeadCellProps: {
        align: 'center',
      },
      enableGrouping: false,
    },
    {
      accessorKey: 'name',
      header: 'ФИО',
      Cell: ({ cell, renderedCellValue }) => {
        return <Tooltip title={cell.row.original.tooltip}>
          <span className={cn({ [styles.currentDate]: cell.row.original.isCurrent})}>{!cell.row.original.isGroup ? renderedCellValue : null}</span>
        </Tooltip>

      },
      enableGrouping: false,
      muiTableHeadCellProps: {
        align: 'center',
      },
    },
    {
      accessorKey: 'start_time',
      header: 'Время начала',
      Cell: ({ renderedCellValue, cell }) => {
        return <span>
          {!cell.row.original.isGroup ? renderedCellValue : null}
        </span>
      },
      muiTableHeadCellProps: {
        align: 'center',
      },
      enableGrouping: false,
    },
    {
      accessorKey: 'end_time',
      header: 'Время окончания',
      Cell: ({ renderedCellValue, cell }) => {
        return <span>
          {!cell.row.original.isGroup ? renderedCellValue : null}
        </span>
      },
      muiTableHeadCellProps: {
        align: 'center',
      },
      enableGrouping: false,
    },
  ]

  const handleExportData = () => {
    const allData = []

    data.forEach((el) => {
      el.subRows.forEach((row) => {
        allData.push({
          date: el.date,
          name: row.name,
          start_time: row.start_time,
          end_time: row.end_time,
          group_name: row.group_name
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
    if(data.length) {
      data.forEach((el => rows.push(...el.subRows)))
    }
    return rows
  }, [data])


  const table = useMaterialReactTable({
    columns,
    data: data,
    enableRowSelection: (row) => !row.original.isGroup,
    enableSubRowSelection: false,
    enablePagination: false,
    enableSelectAll: false,
    enableExpanding: true,
    localization: MRT_Localization_RU,
    state: { rowSelection: selectedItems },
    getSubRows: (originalRow) => originalRow.subRows,
    getRowId: (originalRow) => originalRow.id,
    onRowSelectionChange: setSelectedItems,
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
    enableGlobalFilter: false,
    enableDensityToggle: false,
    enableColumnActions: false,
    enableHiding: false,
    positionToolbarAlertBanner: 'none',
    renderTopToolbarCustomActions: ({ table }) => (
      <>
        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', p: '4px' }}>
          <Box>
            <Button
              color="primary"
              onClick={handleExportData}
              variant="contained"
              disabled={!subRows.length}
            >
              Выгрузить
            </Button>
          </Box>
          <Box sx={{ display: 'flex'}}>
            <Button
              color="primary"
              onClick={() => {
                setTableView((prevState) => !prevState)
              }}
              sx={{ marginRight: '10px'}}
              variant="contained"
            >
              {!tableView ? 'Месяц' : 'Неделя'}
            </Button>
            <Button
              color="primary"
              disabled={timeTable.start_date.isBefore("2024-01-01 00:00:01")}
              sx={{ marginRight: '10px'}}
              onClick={() => {
                setTimeTable((prevState) => {
                  if(tableView) {
                    return({
                      start_date: dayjs(prevState.start_date).subtract(1, 'month'),
                      end_date: dayjs(prevState.end_date).subtract(1, 'month')
                    })
                  } else return({
                    start_date: dayjs(prevState.start_date).subtract(1, 'week'),
                    end_date: dayjs(prevState.end_date).subtract(1, 'week')
                  })
                })
              }}
              variant="contained"
            >
              <ArrowBackIcon/>
            </Button>
            <Button
              color="primary"
              disabled={timeTable.end_date.isAfter("2027-01-01 00:00:01")}
              onClick={() => {
                setTimeTable((prevState) => {
                  if(tableView) {
                    return({
                      start_date: dayjs(prevState.start_date).add(1, 'month'),
                      end_date: dayjs(prevState.end_date).add(1, 'month')
                    })
                  } else return({
                    start_date: dayjs(prevState.start_date).add(1, 'week'),
                    end_date: dayjs(prevState.end_date).add(1, 'week')
                  })
                })
              }}
              variant="contained"
            >
              <ArrowBackIcon style={{ transform: 'rotate(180deg)' }}/>
            </Button>
          </Box>
        </Box>
      </>
    ),
  });

  return (
    <>
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
          <MaterialReactTable table={table} />
        )
      }
    </>
  );
}


