import {Button, Dialog, DialogActions, DialogTitle} from "@mui/material";
import styles from './styles.module.scss';


interface DeleteAgreeModalProps {
  setAgreeModal: (open?: boolean) => void;
  setAgree: () => void;
  agreeModal: boolean;
}
export const DeleteAgreeModal: React.FC<DeleteAgreeModalProps> = ({setAgree, setAgreeModal, agreeModal, title}) => {
  const handleClick = () => {
    setAgree()
    setAgreeModal(false)
  }

  return (
    <Dialog open={agreeModal} onClose={() => setAgreeModal(false)} className={styles.modal}>
      <DialogTitle className={styles.title}>
        Вы уверены, что хотите удалить {title}?
      </DialogTitle>
      <DialogActions className={styles.dialogActions}>
        <Button onClick={() => setAgreeModal(false)} variant="outlined" color="error">
          Нет
        </Button>
        <Button onClick={handleClick} variant="outlined" color="primary" >
          Да
        </Button>
      </DialogActions>
    </Dialog>
  );
};
