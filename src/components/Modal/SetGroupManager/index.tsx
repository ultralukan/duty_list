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
import {validationSchema} from "./validation.ts";
import {Option} from "../../../types/components/options";
import {useAddRoleMutation, useDeleteRoleMutation} from "../../../api/users.ts";
import React, {useState} from "react";

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

export const SetGroupManagerModal: React.FC<AddDutyToGroupModalProps> = ({open, setGroupId, setOpen, options, dutiesOptions, groupId, groupName, selectedManagersOptions}) => {
  const [addRole] = useAddRoleMutation()
  const [deleteRole] = useDeleteRoleMutation()

  const [selectedAction, setSelectedAction] = useState(null);

  const handleSubmit = async(values: ValuesType, resetForm: () => void) => {
    try {
      if(selectedAction === 'add') {
        await Promise.all(
          values.autocomplete2.map(async (id) => {
            await addRole({
              user_id: id.value,
              role_name: 'manager',
              group_id: groupId
            })
          })
        );
      } else {
        await Promise.all(
          values.autocomplete2.map(async (id) => {
            await deleteRole({
              user_id: id.value,
              role_name: 'manager',
              group_id: groupId
            })
          })
        );
      }
      setOpen(false)
      resetForm()
      setGroupId([])
    }
    catch (e) {
      
    }
    setSelectedAction(null)
  }

  return (
    <Formik
      initialValues={{ autocomplete1: {value: groupId, name: groupName}, autocomplete2: [] }}
      onSubmit={(values, {resetForm}) => handleSubmit(values, resetForm)}
      validationSchema={validationSchema}
      validateOnChange
      enableReinitialize={true}
    >
      {({ values, handleChange, handleBlur, resetForm, errors, touched, isValid }) => {
        return (
          <Form id="setManagerForm">
            <Dialog open={open} onClose={() => setOpen(false)} className={styles.modal}>
              <div className={styles.container}>
                <DialogTitle className={styles.title}>
                  Редактировать менеджеров группы
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
                      <FormControlLabel value="add" control={<Radio />} label="Добавить менеджеров" />
                      <FormControlLabel value="delete" control={<Radio />} label="Удалить менеджеров" />
                    </RadioGroup>
                  </div>
                  <div>
                    <Autocomplete
                      id="autocomplete1"
                      isOptionEqualToValue={(option, value) => option.value === value.value}
                      disabled
                      name="autocomplete1"
                      options={options}
                      getOptionLabel={(option) => option.name}
                      value={values.autocomplete1}
                      onChange={(_, newValue) => {
                        handleChange({
                          target: { name: 'autocomplete1', value: newValue },
                        });
                      }}
                      onBlur={handleBlur}
                      className={styles.input}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Выберите группу"
                          variant="outlined"
                          fullWidth
                          error={touched.autocomplete1 && Boolean(errors.autocomplete1)}
                          helperText={touched.autocomplete1 && errors.autocomplete1}
                        />
                      )}
                    />
                  </div>
                  {
                    ((selectedAction === 'add' && dutiesOptions.length) || (selectedAction === 'delete' && selectedManagersOptions.length)) ? (
                      <div>
                        <Autocomplete
                          id="autocomplete2"
                          name="autocomplete2"
                          multiple
                          isOptionEqualToValue={(option, value) => option.value === value.value}
                          options={selectedAction === 'add' ? dutiesOptions : selectedManagersOptions}
                          className={styles.input}
                          getOptionLabel={(option) => option.name}
                          value={values.autocomplete2}
                          onChange={(_, newValue) => {
                            handleChange({
                              target: { name: 'autocomplete2', value: newValue },
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
                              error={touched.autocomplete2 && Boolean(errors.autocomplete2)}
                              helperText={touched.autocomplete2 && errors.autocomplete2}
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
                      </div>
                    ) : selectedAction === 'add' && !dutiesOptions.length ? <div>Нет пользователей для добавления роли менеджера</div> : selectedAction === 'delete' && !selectedManagersOptions.length ? <div>В группе нет менеджеров</div> : null
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
                      <Button form="setManagerForm" type="submit" variant="outlined" color="primary" disabled={!isValid}>
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
