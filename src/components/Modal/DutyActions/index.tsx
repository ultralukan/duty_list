import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl, FormControlLabel,
  FormLabel, Radio,
  RadioGroup, TextField, Tooltip
} from "@mui/material";
import styles from './styles.module.scss';
import {Form, Formik} from "formik";
import React, {useEffect, useMemo, useState} from "react";
import {editValidationSchema, transferValidationSchema} from "./validation.ts";
import {format, parse} from "date-fns";
import {Option} from "../../../types/components/options";
import {setError} from "../../../slices/auth.ts";
import {useDispatch, useSelector} from "react-redux";
import * as dayjs from "dayjs";
import {DatePicker} from "antd";
import {RootState} from "@reduxjs/toolkit/dist/query/core/apiState";
import {
  useAddScheduleAsyncMutation,
  useAsyncDeleteScheduleMutation,
  useDeleteScheduleMutation,
  useUpdateScheduleMutation
} from "../../../api/schedules.ts";
import {CloseCircleTwoTone} from "@ant-design/icons";

interface DutyActionsModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  scheduleId: string;
  time: Date[],
  options: Option[],
  groupId: string,
}

const { RangePicker } = DatePicker;
export const DutyActionsModal: React.FC<DutyActionsModalProps> = ({setSelected, open,dutyId, setOpen, scheduleId, time, options, groupId}) => {
  const timedelta = useSelector((state: RootState) => state.auth.timeDelta);
  const [updateGroup] = useUpdateScheduleMutation();
  const [deleteDuty] = useDeleteScheduleMutation();
  const [asyncDeleteDuty] = useAsyncDeleteScheduleMutation();
  const [addSchedule] = useAddScheduleAsyncMutation();
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null)
  const dispatch = useDispatch();
  const [datePickers, setDatePickers] = useState([
    {
      start: time ? time[0] : '',
      end:  time ? time[1] : '',
    },
  ]);

  useEffect(() => {
    setDatePickers([
      {
        start: time ? time[0] : '',
        end: time ? time[1] : '',
      },
    ])
  }, [open, time, selectedAction])

  const handleSubmit = async (values, resetForm: () => void) => {
    if(selectedAction === 'delete') {
      try {
        await asyncDeleteDuty({scheduleId: scheduleId})
      } catch (e) {

      }
      setOpen(false)
      setSelectedUser(null)
      setSelectedAction(null)
      resetForm()
    } else {
      const startDate = format(values.datePickers[0].start.toDate(), 'yyyy-MM-dd HH:mm')
      const endDate = format(values.datePickers[0].end.toDate(), 'yyyy-MM-dd HH:mm')

      if(selectedAction === 'edit') {
        try {
          await updateGroup({ scheduleId: scheduleId, start_time: startDate, end_time: endDate, timedelta })
        } catch (e) {

        }
        setOpen(false)
        setSelectedUser(null)
        setSelectedAction(null)
        setSelected([])
        resetForm()
      } else if(selectedAction === 'transfer') {
        const dutyId = values && values.autocomplete && values.autocomplete.value
        try {
          const response = await addSchedule({
            dutyId: dutyId,
            groupId: groupId,
            start_time: startDate,
            end_time: endDate,
            timedelta: timedelta
          });
          if(response.data[0].result) {
            await deleteDuty({scheduleId: scheduleId})
            setOpen(false)
            setSelectedUser(null)
            setSelectedAction(null)
            setSelected([])
            resetForm()
          }else{
            dispatch(setError(response.data[0].detail))
          }
        } catch (e) {
          console.log(e)
        }
      }
    }
  };

  const initialValuesEdit = useMemo(() => ({
    datePickers: datePickers
  }), [datePickers])

  const initialValuesTransfer = useMemo(() => ({
    autocomplete: selectedUser,
    datePickers: datePickers
  }), [datePickers, selectedUser])

  const initialValues = {
    edit: initialValuesEdit,
    transfer: initialValuesTransfer,
  };
  const validationSchemas = {
    edit: editValidationSchema,
    transfer: transferValidationSchema,
    delete: null,
  };

  const handleKeyPress = (event) => {
    const { key } = event;
    const allowedCharacters = /[0-9:. ]|Backspace|Delete|ArrowLeft|ArrowRight/;

    if (!allowedCharacters.test(key)) {
      event.preventDefault();
    }
  };


  return (
    <Dialog open={open} onClose={() => setOpen(false)} className={styles.modal}>
      <Formik
        initialValues={initialValues[selectedAction] || {}}
        enableReinitialize
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={validationSchemas[selectedAction] || null}
        onSubmit={(values, { resetForm }) => handleSubmit(values, resetForm)}
      >
        {({ values, resetForm, handleChange, isValid, errors, handleBlur, touched }) => {
          return (
            <Form id="dutyActionsForm">
                <div className={styles.container}>
                  <DialogTitle className={styles.title}>
                    Действия над дежурством
                  </DialogTitle>
                  <DialogContent className={styles.content}>
                    <FormControl>
                      <FormLabel>Выберите действие:</FormLabel>
                      <RadioGroup
                        name="radio-buttons-group"
                        row
                        value={selectedAction}
                        onChange={(event, value) => setSelectedAction(value)}
                        className={styles.radio}
                      >
                        <FormControlLabel value="edit" control={<Radio />} label="Редактировать" />
                        <FormControlLabel value="transfer" control={<Radio />} label="Переназначить" />
                        {/*<FormControlLabel value="delete" control={<Radio />} label="Удалить" />*/}
                      </RadioGroup>
                      {
                        selectedAction === 'edit' ? (
                          <div className={styles.main}>
                            <RangePicker
                              name={'range'}
                              allowClear={{clearIcon:<Tooltip title={'Очистить'}><CloseCircleTwoTone/></Tooltip>}}
                              size={'large'}
                              className={styles.period}
                              onKeyDown={handleKeyPress}
                              showTime={{ format: 'HH:mm' }}
                              status={errors && errors.datePickers && errors.datePickers ? 'error' : null}
                              format="DD.MM.YYYY HH:mm"
                              value={values && values.datePickers && values.datePickers.length ? [values.datePickers[0].start, values.datePickers[0].end] : ['', '']}
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
                        ) : selectedAction === 'transfer' ? (
                          <div className={styles.main}>
                            <Autocomplete
                              className={styles.autocomplete}
                              id="autocomplete"
                              name="autocomplete"
                              options={options.filter((duty) => duty.value !== dutyId)}
                              isOptionEqualToValue={(option, value) => option.value === value.value}
                              getOptionLabel={(option) => option.name}
                              value={values.autocomplete || selectedUser}
                              onChange={(_, newValue) => {
                                handleChange({
                                  target: { name: 'autocomplete', value: newValue },
                                });
                                setSelectedUser(newValue)
                              }}
                              onBlur={handleBlur}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Выберите дежурного"
                                  variant="outlined"
                                  fullWidth
                                  error={touched.autocomplete && Boolean(errors.autocomplete)}
                                  helperText={touched.autocomplete && errors.autocomplete}
                                />
                              )}
                            />
                            <RangePicker
                              name={'range'}
                              allowClear={{clearIcon:<Tooltip title={'Очистить'}><CloseCircleTwoTone/></Tooltip>}}
                              size={'large'}
                              onKeyDown={handleKeyPress}
                              showTime={{ format: 'HH:mm' }}
                              format="DD.MM.YYYY HH:mm"
                              className={styles.period}
                              status={errors && errors.datePickers && errors.datePickers ? 'error' : null}
                              value={values && values.datePickers && values.datePickers.length ? [values.datePickers[0].start, values.datePickers[0].end] : ['', '']}
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
                        ) : selectedAction === 'delete' ? (
                          <div className={styles.main}>
                            <span className={styles.deleteText}>Вы уверены, что хотите удалить дежурство из расписания?</span>
                          </div>
                        ) : null
                      }
                    </FormControl>
                  </DialogContent>
                  <DialogActions className={styles.dialogActions}>
                    <Button onClick={() => {
                      setOpen(false)
                      setSelectedAction(null)
                      setSelectedUser(null)
                      resetForm()
                    }} variant="outlined" color="error">
                      Отменить
                    </Button>
                    {
                      selectedAction === 'edit' ? (
                        <Button form="dutyActionsForm" type="submit" variant="outlined" color="primary">
                          ОК
                        </Button>
                      ) : selectedAction === 'transfer' ? (
                        <Button form="dutyActionsForm" type="submit" variant="outlined" color="primary">
                          ОК
                        </Button>
                      ) : selectedAction === 'delete' ? (
                        <Button form="dutyActionsForm" type="submit" variant="outlined" color="primary">
                          ОК
                        </Button>
                      ) : null
                    }
                  </DialogActions>
                </div>

            </Form>
          );
        }}
      </Formik>
    </Dialog>
  );
};
