import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material";
import styles from './styles.module.scss';
import {useCreateGroupMutation} from "../../../api/groups.ts";
import {Form, Formik} from "formik";
import {validationSchema} from "./validation.ts";
import {setError, setInfo} from "../../../slices/auth.ts";
import {useDispatch} from "react-redux";

interface CreateGroupModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({open, setOpen}) => {
  const dispatch = useDispatch();
  const [createGroup] = useCreateGroupMutation()
  const handleSubmit = async(values: {input: string}, resetForm: () => void) => {
    try {
      const response = await createGroup({group_name: values.input})
      if(response && response.data) {
        dispatch(setInfo(`Группа ${values.input} успешно создана`))
        setOpen(false)
        resetForm()
      }
    } catch(e) {

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
          <Form id="createForm">
            <Dialog open={open} onClose={() => setOpen(false)} className={styles.modal}>
              <div className={styles.container}>
                <DialogTitle className={styles.title}>
                  Создать группу дежурных
                </DialogTitle>
                <DialogContent className={styles.content}>
                  <TextField
                    id="input"
                    name="input"
                    label="Название группы"
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
                  <Button form="createForm" type="submit" variant="outlined" color="primary" disabled={!isValid || !values.input}>
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
