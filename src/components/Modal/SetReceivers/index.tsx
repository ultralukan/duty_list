import {
  Autocomplete,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, FormControlLabel, FormLabel, Radio,
  RadioGroup,
  TextField
} from "@mui/material";
import styles from './styles.module.scss';
import {Form, Formik} from "formik";
import {Option} from "../../../types/components/options";
import React, {useMemo, useState} from "react";
import {useAddReceiversMutation, useDeleteReceiversMutation} from "../../../api/notification.ts";
import {validationSchemaAdd, validationSchemaDelete} from "./validation.ts";
import {useDispatch} from "react-redux";
import {setInfo} from "../../../slices/auth.ts";

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

export const SetReceiversModal: React.FC<AddDutyToGroupModalProps> = ({open, setOpen, options}) => {
  const [addReceiver] = useAddReceiversMutation()
  const [deleteReceiver] = useDeleteReceiversMutation()
  const dispatch = useDispatch();
  const [selectedAction, setSelectedAction] = useState(null);

  const handleSubmit = async(values: ValuesType, resetForm: () => void) => {
    try {
      if(selectedAction === 'add') {
        const response = await addReceiver({
          mail: values.input
        })
        if(!response.error) {
          dispatch(setInfo(`Пользователь ${values.input} успешно добавлен в список получателей`))
          setOpen(false)
          resetForm()
          setSelectedAction(null)
        }
      } else {
        await Promise.all(
          values.autocomplete1.map(async (id) => {
            const response = await deleteReceiver({
              mail_id: id.value,
            })
            if(!response.error) {
              const mails = values.autocomplete1.map((id) => id.name).join(', ')
              if(values.autocomplete1.length > 1) {
                dispatch(setInfo(`Пользователи ${mails} успешно удалены из списка получателей`))
              } else {
                dispatch(setInfo(`Пользователь ${values.autocomplete1[0].name} успешно удален из списка получателей`))
              }
              setOpen(false)
              resetForm()
              setSelectedAction(null)
            }
          })
        );
      }
    }
    catch (e) {
      console.log(e)
    }
  }
  const validationSchema = useMemo(() => selectedAction === 'add' ? validationSchemaAdd : validationSchemaDelete, [selectedAction])

  return (
    <Formik
      initialValues={{ input: '', autocomplete1: [] }}
      onSubmit={(values, {resetForm}) => handleSubmit(values, resetForm)}
      validationSchema={validationSchema}
      validateOnChange
      enableReinitialize={true}
    >
      {({ values, handleChange, handleBlur, resetForm, errors, touched, isValid }) => {
        return (
          <Form id="setReceiverForm">
            <Dialog open={open} onClose={() => setOpen(false)} className={styles.modal}>
              <div className={styles.container}>
                <DialogTitle className={styles.title}>
                  Редактировать получателей уведомлений
                </DialogTitle>
                <DialogContent className={styles.content}>
                  <div>
                    <FormLabel className={styles.radioTitle}>Выберите действие:</FormLabel>
                    <RadioGroup
                      name="radio-buttons-group"
                      row
                      value={selectedAction}
                      onChange={(event, value) => setSelectedAction(value)}
                      className={styles.radio}
                    >
                      <FormControlLabel value="add" control={<Radio />} label="Добавить получателя" />
                      <FormControlLabel value="delete" control={<Radio />} label="Удалить получателя" />
                    </RadioGroup>
                  </div>
                  {
                    selectedAction === 'add' ? (
                      <TextField
                        id="input"
                        name="input"
                        label="Почта получателя"
                        variant="outlined"
                        fullWidth
                        value={values.input}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.input && Boolean(errors.input)}
                        helperText={touched.input && errors.input}
                      />
                    ) : selectedAction === 'delete' && options.length ? (
                      <Autocomplete
                        id="autocomplete1"
                        name="autocomplete1"
                        multiple
                        options={options}
                        className={styles.input}
                        getOptionLabel={(option) => option.name}
                        value={values.autocomplete1}
                        onChange={(_, newValue) => {
                          handleChange({
                            target: { name: 'autocomplete1', value: newValue },
                          });
                        }}
                        onBlur={handleBlur}
                        renderOption={(props, option) => {
                          return (
                            <li {...props} key={option.value}>
                              {option.name}
                            </li>
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Выберите пользователей"
                            variant="outlined"
                            fullWidth
                            error={touched.autocomplete1 && Boolean(errors.autocomplete1)}
                            helperText={touched.autocomplete1 && errors.autocomplete1}
                          />
                        )}
                        renderTags={(value, getTagProps) => {
                          const numTags = value.length;
                          const limitTags = 3;

                          return (
                            <>
                              {value.slice(0, limitTags).map((option, index) => (
                                <Chip
                                  {...getTagProps({ index })}
                                  key={index}
                                  label={option.name}
                                />
                              ))}

                              {numTags > limitTags && ` +${numTags - limitTags}`}
                            </>
                          );
                        }}
                      />
                    ) : !options.length ? (<div>Нет пользователей для удаления</div>) : null
                  }
                </DialogContent>
                <DialogActions className={styles.dialogActions}>
                  <Button onClick={() => {
                    setOpen(false)
                    resetForm()
                    setSelectedAction(null)
                  }} variant="outlined" color="error">
                    Отменить
                  </Button>
                  {
                    selectedAction && (
                      <Button form="setReceiverForm" type="submit" variant="outlined" color="primary" disabled={!isValid}>
                        ОК
                      </Button>
                    )
                  }
                </DialogActions>
              </div>
            </Dialog>
          </Form>
        )}}
    </Formik>
  );
};
