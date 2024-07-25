import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import styles from './styles.module.scss';
import './CalendarModal.scss';
import {Form, Formik} from "formik";
import {Option} from "../../../types/components/options";
import React, {useMemo, useState} from "react";
import {Calendar} from "antd";
// import 'antd/dist/reset.css';
import {useAddHolidaysMutation, useDeleteHolidaysMutation, useGetHolidaysQuery} from "../../../api/holidays.ts";

interface AddDutyToGroupModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  options: Option[];
  dutiesOptions: Option[];
  groupId: number;
  groupName: string;
  setGroupId: (str: string) => void;
}
interface ValueType {
  value: number;
  name: string;
}
interface ValuesType {
  autocomplete1: ValueType;
  autocomplete2: ValueType[];
}

export const CalendarModal: React.FC<AddDutyToGroupModalProps> = ({open, setOpen}) => {
  const {data: holidays = {}} = useGetHolidaysQuery()
  const [selectedDates, setSelectedDates] = useState([]);
  const holidaysData = useMemo(() => {
    return holidays.holiday_dates || []
  }, [holidays])

  const handleSelect = (date, info) => {
    if(info.source === 'date') {
      const formattedDate = date.format('YYYY-MM-DD');
      setSelectedDates((prevDates) => {
        const updatedDates = prevDates.includes(formattedDate)
          ? prevDates.filter((d) => d !== formattedDate)
          : [...prevDates, formattedDate];
        return updatedDates;
      });
    }
  };

  const [addHolidays] = useAddHolidaysMutation()
  const [deleteHolidays] = useDeleteHolidaysMutation()
  const handleSubmit = async(values: ValuesType, resetForm: () => void) => {
    try {
      const datesForAdd = selectedDates.filter((date) => !holidaysData.includes(date))
      const datesForDelete = selectedDates.filter((date) => holidaysData.includes(date))
      if(datesForAdd.length) {
        await addHolidays({holiday_dates: datesForAdd})
      }
      if(datesForDelete.length) {
        await deleteHolidays({holiday_dates: datesForDelete})
      }
      // setOpen(false)
      setSelectedDates([])
    }
    catch (e) {
      
    }
  }

  const cellRender = (currentDate, info) => {
    if(info.type !== 'date') {
      return info.originNode;
    }
    const formattedDate = currentDate.format('YYYY-MM-DD');
    const dayOfWeek = currentDate.day();

    const isHighlighted = holidaysData.includes(formattedDate);
    const isSelected = selectedDates.includes(formattedDate);

    const isWeekend = dayOfWeek === 6 || dayOfWeek === 0;

    let style = {};

    if (isSelected) {
      style = { backgroundColor: '#1677FF', color: '#000' }; // Цвет и форма для выбранных дат
    } else if (isHighlighted || isWeekend) {
      style = { backgroundColor: '#e58a8a' }; // Цвет для выделенных дат
    } else {
      style = { backgroundColor: '#FFF', borderRadius: '0px' }; // Цвет для выделенных дат
    }

    // Проверка, является ли текущая дата выходным (суббота или воскресенье)
    return (
      <div className="ant-picker-cell-inner" style={style}>
        {currentDate.date()}
      </div>
    );
  }

  return (
    <Formik
      initialValues={{}}
      onSubmit={(values, {resetForm}) => handleSubmit(values, resetForm)}
      enableReinitialize={true}
    >
      {({ values, handleChange, handleBlur, resetForm, errors, touched, isValid }) => {
        return (
          <Form id="addCalendar">
            <Dialog open={open} onClose={() => setOpen(false)} className={styles.modal}>
              <div className={styles.container}>
                <DialogTitle className={styles.title}>
                  Редактировать выходные, праздничные дни
                </DialogTitle>
                <DialogContent className={styles.content}>
                  <Calendar
                    fullscreen={false}
                    cellRender={cellRender}
                    onSelect={handleSelect}
                  />
                </DialogContent>
                <DialogActions className={styles.dialogActions}>
                  <Button onClick={() => {
                    setOpen(false)
                    setSelectedDates([])
                    resetForm()
                  }} variant="outlined" color="error">
                    Отменить
                  </Button>
                  <Button form="addCalendar" type="submit" variant="outlined" color="primary" disabled={!selectedDates.length}>
                    ОК
                  </Button>
                </DialogActions>
              </div>
            </Dialog>
          </Form>
        )}}
    </Formik>
  );
};
