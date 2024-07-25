import {MainLayout} from "../../../containers/MainLayout/Layout.tsx";
import {TabularGraphTable} from "../../../components/TreeDataGrid/TabularGraphTable";
import React, {useMemo, useState} from 'react';
import {Box, Tooltip,} from "@mui/material";
import TodayIcon from '@mui/icons-material/Today';
import {
  format,
  isBefore,
  addDays,
  parse, eachHourOfInterval, sub, add,
} from 'date-fns';
import ruLocale from 'date-fns/locale/ru';
import styles from './styles.module.scss';
import cn from "classnames";
import {
  getIndexOfMonth,
  getMinutesFromTime, holidays,
  monthNames, schedulesToGraphAdapter,
  shedulestoTableAdapter
} from "../../../services/tabularGraph.ts";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {DeleteDutyFromScheduleModal} from "../../../components/Modal/DeleteDutyFromScheduleModal";
import {EditScheduleModal} from "../../../components/Modal/EditScheduleModal";
import {AddScheduleGroupModal} from "../../../components/Modal/AddScheduleGroupModal";
import {DeleteScheduleGroupModal} from "../../../components/Modal/DeleteScheduleGroupModal";
import {MRT_RowSelectionState} from "material-react-table";
import {useSelector} from "react-redux";
import {RootState} from "@reduxjs/toolkit/dist/query/core/apiState";
import * as dayjs from "dayjs";
import {useGetHolidaysQuery} from "../../../api/holidays.ts";

export const TablePersonalSchedule = ({selectedItems, setSelectedItems, selectedGroupName, currentUserFormatedSchedules, selectedValue, setSelectedValue, options, selectedGroup,}) => {
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const [today, setToday] = useState(new Date());
  const formatedToday = useMemo(() => format(today, 'dd.MM.yyyy', { locale: ruLocale }), [today])
  const formatedYear = useMemo(() => format(today, 'yyyy', { locale: ruLocale }), [today])
  const startDate = useMemo(() => parse(`01.01.${Number(formatedYear)}`, 'dd.MM.yyyy', new Date(), { locale: ruLocale }), [formatedYear])
  const endDate = useMemo(() => parse(`01.01.${Number(formatedYear) + 2}`, 'dd.MM.yyyy', new Date(), { locale: ruLocale }), [formatedYear])
  const monthIndex = useMemo(() => getIndexOfMonth(today, startDate, endDate), [today, startDate, endDate])
  const {data: holidays = {}} = useGetHolidaysQuery()

  const holidaysData = useMemo(() => {
    return holidays.holiday_dates && holidays.holiday_dates.length && holidays.holiday_dates.map((el) => dayjs(el).format('DD.MM.YYYY')) || []
  }, [holidays])

  const dateArray = useMemo(() => {
    const dates = [];
    let currentDate = startDate;
    while (isBefore(currentDate, endDate)) {
      const formattedDate = format(currentDate, 'dd.MM.yyyy', { locale: ruLocale });
      dates.push(formattedDate);
      currentDate = addDays(currentDate, 1);
    }
    return dates
  }, [startDate, startDate, endDate])
  const dates = useMemo(() => dateArray.map((date) => ({date: date})), [dateArray])
  const data = useMemo(() => shedulestoTableAdapter(dates, selectedGroup, currentUserFormatedSchedules, selectedGroupName), [dates, selectedGroup, currentUserFormatedSchedules])
  const dateColumns = [
    {
      accessorKey: 'month',
      header: 'Месяц',
      GroupedCell: ({ cell }) => {
        const parsedDate = parse(cell.row.original.month, 'MM.yyyy', new Date(), { locale: ruLocale });
        const monthNumber = parsedDate.getMonth();
        const monthName = monthNames[monthNumber];
        const year = parsedDate.getFullYear();
        return <span className={cn(styles.isGroup, styles.cell)}>{`${monthName} ${year}`}</span>;
      },
      muiTableHeadCellProps: {
        align: 'center',
      },
      size: 50
    },
    {
      accessorKey: 'date',
      header: 'Дата',
      Cell: ({ cell, renderedCellValue }) => {
        const dateObject = parse(cell.row.original.date, 'dd.MM.yyyy', new Date(), { locale: ruLocale });
        const isHoliday = holidaysData.includes(cell.row.original.date) || (format(dateObject, 'EEEE', { locale: ruLocale }) === 'суббота' || format(dateObject, 'EEEE', { locale: ruLocale }) === 'воскресенье')
        return cell.row.original.month &&
          <div className={cn(styles.cell, { [styles.currentDate]: cell.row.original.date === formatedToday , [styles.holiday]: isHoliday })}>
            <span className={cn(styles.isGroup)}>{renderedCellValue} </span>
            {`(${format(dateObject, 'EEEE', { locale: ruLocale })})`}
            {cell.row.original.date === formatedToday && <TodayIcon/>}
          </div>
      },
      muiTableHeadCellProps: {
        align: 'center',
      },
      enableGrouping: false,
      size: 50
    },
    {
      accessorKey: 'group_name',
      header: 'Группа',
      Cell: ({ renderedCellValue }) => {
        return <span className={styles.cell}>{renderedCellValue}</span>;
      },
      muiTableHeadCellProps: {
        align: 'center',
      },
      enableGrouping: false,
    },
    {
      accessorKey: 'time_start',
      header: 'Время начала',
      Cell: ({ renderedCellValue }) => {
        return <span className={styles.cell}>{renderedCellValue}</span>;
      },
      muiTableHeadCellProps: {
        align: 'center',
      },
      enableGrouping: false,
      size: 50
    },
    {
      accessorKey: 'time_end',
      header: 'Время окончания',
      Cell: ({ renderedCellValue }) => {
        return <span className={styles.cell}>{renderedCellValue}</span>;
      },
      muiTableHeadCellProps: {
        align: 'center',
      },
      enableGrouping: false,
    },
  ]

  return (
    <>
      <TabularGraphTable
        columns={dateColumns}
        data={data}
        currentIndex={monthIndex}
        selectedValue={selectedValue}
        setSelectedValue={setSelectedValue}
        options={options}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        isSelection={true}
        needButtons={true}
        selectedIds={selectedItems}
        setSelectedIds={setSelectedItems}
        isPersonal={true}
      />
    </>
  );
}


