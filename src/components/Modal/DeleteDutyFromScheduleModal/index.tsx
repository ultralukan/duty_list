import {Button, Dialog, DialogActions, DialogTitle} from "@mui/material";
import styles from './styles.module.scss';
import {useAsyncDeleteScheduleMutation} from "../../../api/schedules.ts";

interface DeleteDutyFromScheduleModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  scheduleId: string;
  setRowSelection: (obj: any) => void
}
export const DeleteDutyFromScheduleModal: React.FC<DeleteDutyFromScheduleModalProps> = ({open, setOpen,  setSelectedIds, scheduleId, setRowSelection}) => {
  const [deleteDuty] = useAsyncDeleteScheduleMutation()
  const handleAgree = async() => {
    await deleteDuty({scheduleId: scheduleId.split('_')[0]})
    setOpen(false)
    setRowSelection({})
    setSelectedIds({})
  }

  return (
    <Dialog open={open} onClose={() => setOpen(false)} className={styles.modal}>
      <DialogTitle className={styles.title}>
        Вы уверены, что хотите удалить дежурство из расписания?
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
