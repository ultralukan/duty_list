import {Button, Dialog, DialogActions, DialogTitle} from "@mui/material";
import styles from './styles.module.scss';
import {useDeleteDutyFromGroupMutation} from "../../../api/groups.ts";

interface DeleteDutyFromGroupModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  groupId: number;
  dutyId: number;
  setGroupId: (str: string) => void;
}
export const DeleteDutyFromGroupModal: React.FC<DeleteDutyFromGroupModalProps> = ({open, setGroupId, setOpen, groupId, dutyId}) => {

  const [deleteDuty] = useDeleteDutyFromGroupMutation()

  const handleAgree = async() => {
    await deleteDuty({group_id: groupId, duty_ids: [{duty_id: dutyId}]})
    setOpen(false)
    setGroupId('')
  }

  return (
    <Dialog open={open} onClose={() => setOpen(false)} className={styles.modal}>
      <DialogTitle className={styles.title}>
        Вы уверены, что хотите удалить дежурного из группы?
      </DialogTitle>
      <DialogActions className={styles.dialogActions}>
        <Button onClick={() => setOpen(false)} variant="outlined" color="error">
          Нет
        </Button>
        <Button onClick={handleAgree} variant="outlined" color="primary" >
          Да
        </Button>
      </DialogActions>
    </Dialog>
  );
};
