import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Tooltip} from "@mui/material";
import styles from './styles.module.scss';
import {Form, Formik} from "formik";
import React, {useEffect, useMemo, useState} from "react";
import {validationSchema} from "./validation.ts";
import {format, parse} from "date-fns";
import {DatePicker, Space} from "antd";
import * as dayjs from "dayjs";
import {useSelector} from "react-redux";
import {RootState} from "@reduxjs/toolkit/dist/query/core/apiState";
import {useUpdateScheduleMutation} from "../../../api/schedules.ts";
import {CloseCircleTwoTone} from "@ant-design/icons";

interface EditScheduleModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  scheduleId: number;
  time: Date[]
}

const { RangePicker } = DatePicker;
export const EditScheduleModal: React.FC<EditScheduleModalProps> = ({open, setOpen, scheduleId, time}) => {
  const timedelta = useSelector((state: RootState) => state.auth.timeDelta);
  const [updateGroup] = useUpdateScheduleMutation();
  const [datePickers, setDatePickers] = useState([
    {
      start: time[0],
      end: time[1]
    }
  ]);
  const handleSubmit = async (values, resetForm: () => void) => {
    const startDate = format(values.datePickers[0].start.toDate(), 'yyyy-MM-dd HH:mm')
    const endDate = format(values.datePickers[0].end.toDate(), 'yyyy-MM-dd HH:mm')
    await updateGroup({ scheduleId: scheduleId, start_time: startDate, end_time: endDate, timedelta })
    setOpen(false)
    resetForm()
  };

  useEffect(() => {
    setDatePickers([
      {
        start: time[0],
        end: time[1]
      }
    ])
  }, [time])

  const initValues = useMemo(() => ({datePickers: datePickers}), [datePickers]);
  const handleKeyPress = (event) => {
    const { key } = event;
    const allowedCharacters = /[0-9:. ]|Backspace|Delete|ArrowLeft|ArrowRight/;

    if (!allowedCharacters.test(key)) {
      event.preventDefault();
    }
  };
  return (
    <Formik
      initialValues={initValues}
      enableReinitialize
      validateOnChange={false}
      validateOnBlur={false}
      validationSchema={validationSchema}
      onSubmit={(values, { resetForm }) => handleSubmit(values, resetForm)}
    >
      {({ resetForm, isValid, errors, values }) => {
        return (
          <Form id="editScheduleForm">
            <Dialog open={open} onClose={() => setOpen(false)} className={styles.modal}>
              <div className={styles.container}>
                <DialogTitle className={styles.title}>
                  Редактировать расписание
                </DialogTitle>
                <DialogContent className={styles.content}>
                  <div className={styles.picker}>
                    <RangePicker
                      onKeyDown={handleKeyPress}
                      name={'range'}
                      allowClear={{clearIcon:<Tooltip title={'Очистить'}><CloseCircleTwoTone/></Tooltip>}}
                      size={'large'}
                      className={styles.period}
                      showTime={{ format: 'HH:mm' }}
                      format="DD.MM.YYYY HH:mm"
                      value={[values.datePickers[0].start, values.datePickers[0].end]}
                      status={errors && errors.datePickers && errors.datePickers ? 'error' : null}
                      onChange={(dates, dateStrings) => {
                        if(!dateStrings[0] || !dateStrings[1]) {
                          setDatePickers([{ start: '', end: '' }])
                        } else {
                          const dateObj = parse(dateStrings[0], 'dd.MM.yyyy HH:mm', new Date());
                          const dateObj1 = parse(dateStrings[1], 'dd.MM.yyyy HH:mm', new Date());
                          setDatePickers([{start: dayjs(dateObj), end: dayjs(dateObj1)}])
                        }
                      }}
                    />
                    <div className={styles.error}>
                      {errors && errors.datePickers ? errors.datePickers : null}
                    </div>
                  </div>
                </DialogContent>
                <DialogActions className={styles.dialogActions}>
                  <Button onClick={() => {
                    setOpen(false)
                    resetForm()
                  }} variant="outlined" color="error">
                    Отменить
                  </Button>
                  <Button form="editScheduleForm" type="submit" variant="outlined" color="primary" disabled={!isValid}>
                    ОК
                  </Button>
                </DialogActions>
              </div>
            </Dialog>
          </Form>
        );
      }}
    </Formik>
  );
};
