import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Box, Button, ThemeProvider} from "@mui/material";
import {MaterialReactTable, MRT_ColumnDef, MRT_RowSelectionState, MRT_TableInstance} from "material-react-table";
import {MRT_Localization_RU} from "material-react-table/locales/ru";
import styles from './styles.module.scss';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import './TabularGraphTable.scss';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import {ColumnsData, RowSelectionInterface} from "../../../types/components/table";
import {Option} from "../../../types/components/options";
interface TabularGraphTableProps {
  data: ColumnsData[];
  columns: MRT_ColumnDef<ColumnsData>[];
  currentIndex: number;
  selectedValue: Option;
  setOpenAddGroupScheduleModal: () => void;
  setDeleteScheduleGroupModal: () => void;
  setRowSelection: any;
  rowSelection: RowSelectionInterface;
  needButtons?: boolean;
}

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
  useKeysAsHeaders: true
});

const dataTableNames = {
  date: 'Дата',
  name: 'ФИО',
  time_start:  'Время начала',
  time_end: 'Время окончания',
}

export const TabularGraphTable: React.FC<TabularGraphTableProps> = ({isPersonal=false, needButtons = true, selectedIds, setSelectedIds, columns, data, currentIndex, rowSelection, setRowSelection, isSelection=true}) => {

  const tableData = useMemo(() => {
    return(data && data.length && data.map((row, index) => {
        return({
          ...row,
          subRows: row && row.subRows && row.subRows.length && row.subRows.map((subRow) => ({
            ...subRow,
            schedule_id: `${subRow.schedule_id}_${index}`,
          }))
        })
      }
    ))
  }, [data])

  useEffect(() => {
    if(needButtons) {
      const updatedRowSelection = { ...rowSelection }
      const selectedUniqIds = [...new Set(Object.keys(selectedIds).map((id) => id.split('_')[0]))];
      const updatedRowUniqIds = [...new Set(Object.keys(updatedRowSelection).map((id) => id.split('_')[0]))];
      const key = selectedUniqIds.filter(key => !updatedRowUniqIds.includes(key))[0] || updatedRowUniqIds.filter(key => !selectedUniqIds.includes(key))[0]
      const indexEs = []
      tableData.forEach((date) => {
        date && date.subRows && date.subRows.length && date.subRows.forEach((duty) => {
          const scheduleId = duty.schedule_id.split('_')
          if(scheduleId[0] === key) {
            indexEs.push(duty.schedule_id)
          }
        })
      })
      if(updatedRowUniqIds.includes(key) || !key) {
        indexEs.forEach((id) => {
          delete updatedRowSelection[id];
        })
      } else {
        indexEs.forEach((index) => {
          updatedRowSelection[index] = true
        })
      }
      setRowSelection(updatedRowSelection);
    }
  }, [selectedIds])


  const handleExportData = () => {
    const allData = []
    data.forEach((el) => {
      el.subRows.forEach((row) => {
        allData.push({
          date: el.date,
          name: row.name,
          time_start: row.time_start,
          time_end: row.time_end
        })
      })
      return allData
    })
    const newData = allData.map(obj => replaceKeys(obj, dataTableNames));
    const csv = generateCsv(csvConfig)(newData);
    download(csvConfig)(csv);
  };

  return (
    <div className={styles.table}>
      <ThemeProvider theme={{}}>
        <MaterialReactTable
          columns={columns}
          data={tableData}
          enableGrouping
          enableExpanding
          positionPagination={'top'}
          getRowId={(originalRow) => originalRow.schedule_id}
          onRowSelectionChange={setSelectedIds}
          state={{ rowSelection: rowSelection }}
          initialState={{ pagination: { pageSize: 1, pageIndex: currentIndex }, density: 'compact', showGlobalFilter: true, expanded: true, grouping: ['month']}}
          enableColumnFilters={false}
          enableRowSelection={needButtons && isSelection ? (row) => isPersonal ? row.original.is_confirmed === false : row.original.name && !row.original.isGroup && !row.original.isPast : false}
          enableSubRowSelection={isSelection}
          enableSelectAll={false}
          enableFullScreenToggle={false}
          positionToolbarAlertBanner={'none'}
          muiTableBodyRowProps={{ hover: false }}
          muiTableProps={{
            sx: {
              border: '1px solid rgba(81, 81, 81, 1)',
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
          muiTablePaginationProps={{
            rowsPerPageOptions: [0],
            showFirstButton: false,
            showLastButton: false,
            labelDisplayedRows: ({ from, count }) => `Страница ${from} из ${count}`
          }}
          enableGlobalFilter={false}
          enableDensityToggle={false}
          enableColumnActions={false}
          paginateExpandedRows={false}
          enableHiding={false}
          localization={MRT_Localization_RU}
          renderTopToolbarCustomActions={() => (
            <Box
              sx={{
                position: 'absolute',
                top: '20px',
                zIndex: '5',
              }}
            >
              <Button
                variant="contained"
                onClick={handleExportData}
                startIcon={<FileDownloadIcon />}
              >
                Выгрузить
              </Button>
            </Box>
          )}
        />
      </ThemeProvider>
    </div>
  );
};