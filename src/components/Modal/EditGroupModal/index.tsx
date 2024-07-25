import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material";
import styles from './styles.module.scss';
import {useUpdateGroupMutation} from "../../../api/groups.ts";
import {Form, Formik} from "formik";
import {validationSchema} from "./validation.ts";

interface EditGroupModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  groupId: number;
  groupName: string;
  setGroupId: (str: string) => void;
}
export const EditGroupModal: React.FC<EditGroupModalProps> = ({open, setGroupId, setOpen, groupId, groupName}) => {

  const [updateGroup] = useUpdateGroupMutation()
  const handleSubmit = async(values: {input: string}, resetForm: () => void) => {
    await updateGroup({group_id: groupId, group_name: values.input})
    setOpen(false)
    resetForm()
    setGroupId([])
  }
  
  return (
    <Formik
      initialValues={{input: groupName}}
      onSubmit={(values, {resetForm}) => handleSubmit(values, resetForm)}
      validationSchema={validationSchema}
      validateOnChange
      enableReinitialize={true}
    >
      {({ values, handleChange, handleBlur, resetForm, errors, touched, isValid }) => {
        return (
          <Form id="editForm">
            <Dialog open={open} onClose={() => setOpen(false)} className={styles.modal}>
              <div className={styles.container}>
                <DialogTitle className={styles.title}>
                  Редактировать название группы дежурных
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
                  <Button form="editForm" type="submit" variant="outlined" color="primary" disabled={!isValid}>
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
