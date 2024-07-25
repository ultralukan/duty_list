import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Tooltip
} from "@mui/material";
import styles from './styles.module.scss';
import {Form, Formik} from "formik";
import {validationSchema} from "./validation.ts";
import React, {useState} from "react";
import {format, parse} from "date-fns";
import {Option} from "../../../types/components/options";
import {setError} from "../../../slices/auth.ts";
import {useDispatch, useSelector} from "react-redux";
import {DatePicker, Space} from "antd";
import * as dayjs from "dayjs";
import {RootState} from "@reduxjs/toolkit/dist/query/core/apiState";
import {useAddScheduleMutation} from "../../../api/schedules.ts";
import {CloseCircleTwoTone} from "@ant-design/icons";
interface AddScheduleGroupModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  groupId: number;
  options: Option[];
}

const { RangePicker } = DatePicker;
export const AddScheduleGroupModal: React.FC<AddScheduleGroupModalProps> = ({open, setOpen, options, groupId}) => {
  const [addSchedule] = useAddScheduleMutation()
  const timedelta = useSelector((state: RootState) => state.auth.timeDelta);
  const dispatch = useDispatch();
  const [datePickers, setDatePickers] = useState([
    {
      startDate: '',
      endDate: '',
    },
  ]);
  const [name, setName] = useState(null)

  const addDatePicker = () => {
    setDatePickers([...datePickers, { startDate: '', endDate: '' }]);
  };

  const removeDatePicker = (index: number) => {
    const updatedDatePickers = [...datePickers];
    updatedDatePickers.splice(index, 1);
    setDatePickers(updatedDatePickers);
  };

  const handleSubmit = async(values, resetForm: () => void) => {
    const dutyId = values.autocomplete.value
    try {
      await Promise.all(
        values.datePickers.map(async (data) => {
          try {
            const startDate = format(data.startDate, 'yyyy-MM-dd HH:mm')
            const endDate = format(data.endDate, 'yyyy-MM-dd HH:mm')
            const response = await addSchedule({
              dutyId: dutyId,
              groupId: groupId,
              start_time: startDate,
              end_time: endDate,
              timedelta: timedelta
            });
            if(response && response.data && response.data.length && response.data[0] && !response.data[0].result){
              dispatch(setError(response.data[0].detail))
            } else{
              setOpen(false)
              setDatePickers([
                {
                  startDate: '',
                  endDate: '',
                }
              ])
              setName(null)
              resetForm()
            }
          } catch (e) {
            console.log(e)
          }
        })
      );
    } catch (error) {
      console.log(error)
    }
  }

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
        initialValues={{autocomplete: name, datePickers: datePickers}}
        onSubmit={(values, {resetForm}) => handleSubmit(values, resetForm)}
        validationSchema={validationSchema}
        enableReinitialize
        validateOnChange={false}
        validateOnBlur={false}
      >
        {({ handleBlur, values, resetForm, errors, touched, isValid }) => {
          return (
            <Form id="addGroupSchedule">
              <Dialog open={open} onClose={() => {
                setOpen(false)
              }} className={styles.modal}>
                <div className={styles.container}>
                  <DialogTitle className={styles.title}>
                    Добавить дежурства
                  </DialogTitle>
                  <DialogContent className={styles.content}>
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
                    {datePickers && datePickers.map((datePicker, index) => {
                      const defRange = [datePicker.startDate ? dayjs(datePicker.startDate) : '', datePicker.endDate ? dayjs(datePicker.endDate) : '']
                      return(
                        <div key={index} >
                          <div className={styles.dataContainer}>
                            <Space direction="vertical" size={12}>
                              <RangePicker
                                onKeyDown={handleKeyPress}
                                allowClear={{clearIcon:<Tooltip title={'Очистить'}><CloseCircleTwoTone/></Tooltip>}}
                                size={'large'}
                                name={'range'}
                                showTime={{ format: 'HH:mm' }}
                                format="DD.MM.YYYY HH:mm"
                                value={defRange}
                                status={errors && errors.datePickers && errors.datePickers[index] ? 'error' : null}
                                onChange={(dates, dateStrings) => {
                                  setDatePickers((prevState) => {
                                    const newArr = [...prevState]
                                    if(!dateStrings[0] || !dateStrings[1]) {
                                      newArr[index] = {
                                        startDate: '',
                                        endDate: '',
                                      }
                                      return newArr
                                    } else {
                                      const dateObj = parse(dateStrings[0], 'dd.MM.yyyy HH:mm', new Date());
                                      const dateObj1 = parse(dateStrings[1], 'dd.MM.yyyy HH:mm', new Date());
                                      newArr[index] = {
                                        startDate: dateObj,
                                        endDate: dateObj1,
                                      }
                                      return newArr
                                    }
                                  })
                                }}
                              />
                            </Space>
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => removeDatePicker(index)}
                              disabled={datePickers.length < 2}
                            >
                              Удалить
                            </Button>
                          </div>
                          <div className={styles.error}>
                            {errors && errors.datePickers ? errors.datePickers[index] : null}
                          </div>
                        </div>
                      )
                    })}
                    <Button
                      onClick={addDatePicker}
                      variant="outlined"
                      color="primary"
                      className={styles.btn}
                    >
                      Добавить дату
                    </Button>
                  </DialogContent>
                  <DialogActions className={styles.dialogActions}>
                    <Button onClick={() => {
                      setOpen(false)
                      setDatePickers([
                        {
                          startDate: new Date(),
                          endDate: new Date(),
                        }
                      ])
                      setName(null)
                      setDatePickers([
                        {
                          startDate: '',
                          endDate: '',
                        }
                      ])
                      resetForm()
                    }} variant="outlined" color="error">
                      Отменить
                    </Button>
                    <Button form="addGroupSchedule" type="submit" variant="outlined" color="primary" disabled={!isValid && !errors}>
                      ОК
                    </Button>
                  </DialogActions>
                </div>
              </Dialog>
            </Form>
          )}}
      </Formik>
    </>
  );
};
