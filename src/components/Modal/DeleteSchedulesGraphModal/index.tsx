import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, FormControlLabel,
  FormLabel, Radio, RadioGroup,
  TextField, Tooltip
} from "@mui/material";
import styles from './styles.module.scss';
import {Form, Formik, isEmptyArray} from "formik";
import {periodValidationSchema, selectValidationSchema} from "./validation.ts";
import React, {useEffect, useMemo, useRef, useState} from "react";
import {Option} from "../../../types/components/options";
import {DeleteAgreeModal} from "../DeleteAgree";
import {DataGraph} from "../../../types/components/table";
import {setError} from "../../../slices/auth.ts";
import {useDispatch} from "react-redux";
import {parse} from "date-fns";
import * as dayjs from "dayjs";
import {DatePicker} from "antd";
import {useAsyncDeleteScheduleMutation} from "../../../api/schedules.ts";
import {CloseCircleTwoTone} from "@ant-design/icons";


interface DeleteSchedulesGroupModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  options: Option[];
  dataGraph: DataGraph[];
}


const { RangePicker } = DatePicker;

export const DeleteSchedulesGroupModal: React.FC<DeleteSchedulesGroupModalProps> = ({selectedItemsTable, setSelectedItemsTable, setSelectedItems, selectedItems, open, setOpen, options, dataGraph}) => {
  const [agreeModal, setAgreeModal] = useState(false)
  const [selectedAction, setSelectedAction] = useState(null);
  const [date, setDate] = useState([
    {
      start: '',
      end:  '',
    },
  ])
  const [name, setName] = useState(null)
  const currentDutySchedules = useMemo(() => dataGraph && dataGraph.length && dataGraph.filter((item) => item.duty_id === (name && name.value)) || [], [dataGraph, name])
  const [deleteClick, setDeleteClick] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [asyncDeleteDuty] = useAsyncDeleteScheduleMutation();
  const items = selectedItems.length ? selectedItems : Object.keys(selectedItemsTable)
  const dispatch = useDispatch();
  const handleSubmit = async() => {
    if(selectedAction === 'select') {
      try {

        await Promise.all(
          items.map(async (schedule) => {
            await asyncDeleteDuty({scheduleId: schedule})
          })
        );
      } catch (error) {
        console.error(error);
      }
      setOpen(false)
      setDate({
        start: '',
        end:  '',
      })
      setSelectedItems([])
      setSelectedItemsTable([])
      setName(null)
      setSelectedAction(null)
    } else {
      try {
        const filterDates = currentDutySchedules.map((dates) => ({...dates, start: dates.start_time.toDate(), end: dates.end_time.toDate()})).filter((dates) => dates.start >= dayjs(date[0].start) && dates.start <= dayjs(date[0].end) )
        if(!filterDates.length){
          dispatch(setError('В указанный период нет дежурств'))
        } else {
          await Promise.all(
            filterDates.map(async (schedule) => {
              await asyncDeleteDuty({scheduleId: schedule.schedule_id})
            })
          );
          setOpen(false)
          setDate({
            start: '',
            end:  '',
          })
          setName(null)
          setSelectedAction(null)
          setSelectedItems([])
          setSelectedItemsTable([])
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  const handleSubitForm = () => {
      setDeleteClick('many')
      setAgreeModal(true)
  }

  const handleSubmitRow = async(id) => {
    try {
      await asyncDeleteDuty({scheduleId: id})
    } catch (e) {

    }
  }

  const validationSchemas = {
    select: selectValidationSchema,
    period: periodValidationSchema,
  };

  const handleKeyPress = (event) => {
    const { key } = event;
    const allowedCharacters = /[0-9:. ]|Backspace|Delete|ArrowLeft|ArrowRight/;

    if (!allowedCharacters.test(key)) {
      event.preventDefault();
    }
  };

  return (
    <>
      <Formik
        initialValues={{autocomplete: name, period: date}}
        onSubmit={(values, {resetForm}) => handleSubitForm(values, resetForm)}
        validationSchema={validationSchemas[selectedAction]}
        validateOnChange={false}
        validateOnBlur={false}
        enableReinitialize
      >
        {({ handleBlur, resetForm, errors, values, touched, isValid }) => {
          return (
            <Form id="deleteSchedulesGroup">
              <Dialog open={open} onClose={() => setOpen(false)} className={styles.modal}>
                <div className={styles.container}>
                  <DialogTitle className={styles.title}>
                    Удалить дежурства
                  </DialogTitle>
                  <DialogContent className={styles.content}>
                    <FormLabel className={styles.radioTitle}>Выберите действие:</FormLabel>
                    <RadioGroup
                      name="radio-buttons-group"
                      row
                      value={selectedAction}
                      onChange={(event, value) => setSelectedAction(value)}
                      className={styles.radio}
                    >
                      <FormControlLabel value="select" control={<Radio />} label="Удаление выбранных дежурств" />
                      <FormControlLabel value="period" control={<Radio />} label="Удаление за период" />
                    </RadioGroup>
                    {
                      selectedAction && (
                        <>
                          {
                            selectedAction === 'select' ? (
                              <>
                                {
                                  items.length ? (
                                    <div>
                                      Выбрано дежурств: {items.length}
                                    </div>
                                  ) : <b>Выберите дежурства</b>
                                }
                              </>
                            ) : selectedAction === 'period' ? (
                                <>
                                  <Autocomplete
                                    id="autocomplete"
                                    name="autocomplete"
                                    options={options}
                                    getOptionLabel={(option) => option.name}
                                    value={name}
                                    onChange={(_, newValue) => {
                                      setName(newValue)
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
                                  <div className={styles.period}>
                                    <RangePicker
                                      name={'period'}
                                      allowClear={{clearIcon:<Tooltip title={'Очистить'}><CloseCircleTwoTone/></Tooltip>}}
                                      size={'large'}
                                      format="DD.MM.YYYY"
                                      className={styles.period}
                                      status={errors && errors.period && errors.period ? 'error' : null}
                                      onKeyDown={handleKeyPress}
                                      onChange={(dates, dateStrings) => {
                                        const newArr = {}
                                        if(!dateStrings[0] || !dateStrings[1]) {
                                          setDate([{
                                            start: '',
                                            end: '',
                                          }])
                                        } else {
                                          const dateObj = parse(dateStrings[0], 'dd.MM.yyyy', new Date());
                                          const dateObj1 = parse(dateStrings[1], 'dd.MM.yyyy', new Date());
                                          dateObj.setHours(0, 0, 0, 0);
                                          dateObj1.setHours(23, 59, 59, 999);
                                          setDate([{
                                            start: dateObj,
                                            end: dateObj1,
                                          }])
                                        }
                                      }}
                                    />
                                    <div className={styles.error}>
                                      {errors && errors.period ? errors.period : null}
                                    </div>
                                  </div>
                                </>
                            ) : null
                          }
                        </>
                      )
                    }
                  </DialogContent>
                  <DialogActions className={styles.dialogActions}>
                    <Button onClick={() => {
                      setOpen(false)
                      setName(null)
                      setDate([
                        {
                          start: '',
                          end:  '',
                        },
                      ])
                      resetForm()
                    }} variant="outlined" color="error">
                      Отменить
                    </Button>
                    <Button form="deleteSchedulesGroup"
                      disabled={!selectedAction || (selectedAction === 'select' && !items.length)}
                      type='submit'
                      variant="outlined" color="primary">
                      ОК
                    </Button>
                  </DialogActions>
                </div>
              </Dialog>
            </Form>
          )}}
      </Formik>
      <DeleteAgreeModal title={deleteClick !== 'one' ? 'дежурства' : 'дежурство'} setAgree={deleteClick === 'one' ? () => handleSubmitRow(selectedId) : handleSubmit} setAgreeModal={setAgreeModal} agreeModal={agreeModal}/>
    </>
  );
};
