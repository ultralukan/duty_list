import {Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, Input, TextField} from "@mui/material";
import styles from './styles.module.scss';
import {Field, Form, Formik} from "formik";
import {validationSchema} from "./validation.ts";
import {Option} from "../../../types/components/options";

import {useAddDutyRoleMutation} from "../../../api/duties.ts";
import {useDispatch} from "react-redux";
import {setError, setInfo} from "../../../slices/auth.ts";

interface AddUserProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  options: Option[];
  dutiesOptions: Option[];
  groupId: number;
  groupName: string;
  setGroupId: (str: string) => void;
}

export const AddUser: React.FC<AddUserProps> = ({open, setOpen}) => {
  const [addDuty] = useAddDutyRoleMutation()
  const dispatch = useDispatch();
  const handleSubmit = async(values, resetForm: () => void) => {
    try {
      const response = await addDuty({
        user_ids: [{user_id: values.input}],
      })

      if(response && response.data) {
        if(response.data[0].result) {
          const str = response.data[0].detail && response.data[0].detail.split(' ').slice(0, 3).join(' ')
          dispatch(setInfo(str))
          setOpen(false)
          resetForm()
        }
        else {
          dispatch(setError(response.data[0].detail))
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <Formik
      initialValues={{ input: '' }}
      onSubmit={(values, {resetForm}) => handleSubmit(values, resetForm)}
      validationSchema={validationSchema}
      validateOnChange
      enableReinitialize={true}
    >
      {({ values, handleChange, handleBlur, resetForm, errors, touched, isValid }) => {
        return (
          <Form id="addUserForm">
            <Dialog open={open} onClose={() => setOpen(false)} className={styles.modal}>
              <div className={styles.container}>
                <DialogTitle className={styles.title}>
                  Добавить пользователя
                </DialogTitle>
                <DialogContent className={styles.content}>
                  <TextField
                    id="input"
                    name="input"
                    label="Имя учетной записи"
                    variant="outlined"
                    fullWidth
                    value={values.input}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.input && Boolean(errors.input)}
                    helperText={touched.input && errors.input}
                  />
                </DialogContent>
                <DialogActions className={styles.dialogActions}>
                  <Button onClick={() => {
                    setOpen(false)
                    resetForm()
                  }} variant="outlined" color="error">
                    Отменить
                  </Button>
                  <Button form="addUserForm" type="submit" variant="outlined" color="primary" disabled={!isValid}>
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
