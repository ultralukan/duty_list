import React, {useState} from 'react';
import {MaterialReactTable, MRT_ColumnDef} from 'material-react-table';
import {Box, Button, ThemeProvider} from "@mui/material";
import styles from './styles.module.scss';
import {MRT_Localization_RU} from "material-react-table/locales/ru";
import {CreateGroupModal} from "../../Modal/CreateGroupModal";
import {ColumnsData} from "../../../types/components/table";

interface AllUsersTableProps {
  data: ColumnsData[];
  columns: MRT_ColumnDef<ColumnsData>[];
  toolbar?: boolean;
}

export const AllUsersTable: React.FC<AllUsersTableProps> = ({data, columns, toolbar = true}) => {
  const [openCreateGroupModal, setOpenCreateGroupModal] = useState(false)
  return (
    <div className={styles.table}>
      <ThemeProvider theme={{}}>
        <MaterialReactTable
          columns={columns || []}
          data={data || []}
          enablePagination={false}
          enableBottomToolbar={false}
          getRowId={(originalRow) => originalRow.user_id}
          enableColumnFilters={false}
          enableFullScreenToggle={false}
          enableGlobalFilterModes={false}
          enableGlobalFilterRankedResults={false}
          positionToolbarAlertBanner={'none'}
          globalFilterFn={'contains'}
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
            placeholder: 'Поиск пользователя',
            variant: 'outlined',
            sx: {
              width: '350px'
            },
          }}
          enableDensityToggle={false}
          enableColumnActions={false}
          enableHiding={false}
          localization={MRT_Localization_RU}
          initialState={{ density: 'compact', showGlobalFilter: true,}}
        />
      </ThemeProvider>
      <CreateGroupModal open={openCreateGroupModal} setOpen={setOpenCreateGroupModal}/>
    </div>
  );
};