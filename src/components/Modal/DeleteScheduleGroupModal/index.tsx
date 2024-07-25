import {Button, Dialog, DialogActions, DialogTitle} from "@mui/material";
import styles from './styles.module.scss';
import {RowSelectionInterface} from "../../../types/components/table";
import {useAsyncDeleteScheduleMutation} from "../../../api/schedules.ts";

interface DeleteScheduleGroupModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  rowSelection: RowSelectionInterface;
  setRowSelection: (obj: any) => void;
}

export const DeleteScheduleGroupModal: React.FC<DeleteScheduleGroupModalProps> = ({open, setOpen, rowSelection, setRowSelection, setSelectedIds}) => {
  const [deleteDuty] = useAsyncDeleteScheduleMutation()
  const handleAgree = async() => {
    try {
      await Promise.all(
        Object.keys(rowSelection).map(async (scheduleId) => {
          await deleteDuty({scheduleId: scheduleId.split('_')[0]})
        })
      );
    } catch (error) {
      console.error(error);
    }
    setSelectedIds({})
    setRowSelection({})
    setOpen(false)
  }
  return (
    <Dialog open={open} onClose={() => setOpen(false)} className={styles.modal}>
      <DialogTitle className={styles.title}>
        Вы уверены, что хотите удалить выбранные дежурства из расписания?
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
