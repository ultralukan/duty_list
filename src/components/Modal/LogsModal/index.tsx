import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Input,
  TextField,
  Tooltip
} from "@mui/material";
import styles from './styles.module.scss';
import {Field, Form, Formik} from "formik";
import {validationSchema} from "./validation.ts";
import {Option} from "../../../types/components/options";
import React, {useRef, useState} from "react";
import {format, parse} from "date-fns";
import {useGetLogsMutation} from "../../../api/users.ts";
import {DatePicker} from "antd";
import {CloseCircleTwoTone} from "@ant-design/icons";
interface AddUserProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  options: Option[];
  dutiesOptions: Option[];
  groupId: number;
  groupName: string;
  setGroupId: (str: string) => void;
}
const { RangePicker } = DatePicker;
export const LogsModal: React.FC<AddUserProps> = ({open, setGroupId, setOpen, options, dutiesOptions, groupId, groupName}) => {
  const [date, setDate] = useState([
    {
      start: '',
      end:  '',
    },
  ])
  const [getLogs] = useGetLogsMutation()
  const handleSubmit = async(values, resetForm: () => void) => {
    try {
      const startDate = format(date[0].start, 'yyyy-MM-dd HH:mm')
      const endDate = format(date[0].end, 'yyyy-MM-dd HH:mm')

      const response = await getLogs({
        start_time: startDate,
        end_time: endDate,
      });
      if (response && response.data) {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.href = url;
        a.download = `logs:${format(date[0].start, 'yyyy-MM-dd')}-${format(date[0].end, 'yyyy-MM-dd')}.csv`;
        a.click();

        window.URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.log(e)
    }
    setOpen(false)
    setDate([
      {
        start: '',
        end:  '',
      },
    ])
    resetForm()
  }
  const handleKeyPress = (event) => {
    const { key } = event;
    const allowedCharacters = /[0-9:. ]|Backspace|Delete|ArrowLeft|ArrowRight/;

    if (!allowedCharacters.test(key)) {
      event.preventDefault();
    }
  };
  return (
    <Formik
      initialValues={{period: date}}
      onSubmit={(values, {resetForm}) => handleSubmit(values, resetForm)}
      validationSchema={validationSchema}
      enableReinitialize
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ values, handleChange, handleBlur, resetForm, errors, touched, isValid }) => {
        return (
          <Form id="logsForm">
            <Dialog open={open} onClose={() => setOpen(false)} className={styles.modal}>
              <div className={styles.container}>
                <DialogTitle className={styles.title}>
                  Выгрузить логи за период
                </DialogTitle>
                <DialogContent className={styles.content}>
                  <div className={styles.date}>
                    <RangePicker
                      allowClear={{clearIcon:<Tooltip title={'Очистить'}><CloseCircleTwoTone/></Tooltip>}}
                      name={'period'}
                      format="DD.MM.YYYY"
                      onKeyDown={handleKeyPress}
                      size={'large'}
                      className={styles.period}
                      status={errors && errors.period && errors.period ? 'error' : ''}
                      onChange={(dates, dateStrings) => {
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
                </DialogContent>
                <DialogActions className={styles.dialogActions}>
                  <Button onClick={() => {
                    setOpen(false)
                    resetForm()
                    setDate([
                      {
                        start: '',
                        end:  '',
                      },
                    ])
                  }} variant="outlined" color="error">
                    Отменить
                  </Button>
                  <Button form="logsForm" type="submit" variant="outlined" color="primary">
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
