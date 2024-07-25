import {Button, Dialog, DialogActions, DialogTitle} from "@mui/material";
import styles from './styles.module.scss';
import {useDeleteGroupMutation} from "../../../api/groups.ts";

interface AddDutyToGroupModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  groupId: number;
  duties: boolean;
  setGroupId: (str: string) => void;
}

export const DeleteGroupModal: React.FC<AddDutyToGroupModalProps> = ({open, groupName, setGroupId, setOpen, groupId, duties}) => {

  const [deleteGroup] = useDeleteGroupMutation()
  const handleAgree = async() => {
    await deleteGroup({group_id: groupId})
    setOpen(false)
    setGroupId([])
  }

  return (
    <Dialog open={open} onClose={() => setOpen(false)} className={styles.modal}>
      <div className={styles.container}>
        <DialogTitle className={styles.title}>
          {duties ? (
            <div>Сначала удалите всех пользователей группы:<div><b>{groupName}</b></div></div>
          ) : <div>Вы уверены, что хотите удалить группу дежурных <div><b>{groupName}</b> ?</div></div>}
        </DialogTitle>
        <DialogActions className={styles.dialogActions}>
          <Button onClick={() => setOpen(false)} variant="outlined" color="error">
            {
              duties ? 'ОК' : 'Нет'
            }
          </Button>
          {
            !duties && (
              <Button onClick={handleAgree} variant="outlined" color="primary">
                Да
              </Button>
            )
          }
        </DialogActions>
      </div>
    </Dialog>
  );
};
