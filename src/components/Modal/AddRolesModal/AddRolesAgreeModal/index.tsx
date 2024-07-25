import {Button, Dialog, DialogActions, DialogTitle} from "@mui/material";
import styles from './styles.module.scss';


interface AddRolesModalProps {
  setExit: (open?: boolean) => void;
  setAgree: () => void;
  agreeModal: boolean;
}
export const AddRolesAgreeModal: React.FC<AddRolesModalProps> = ({setExit, setAgree, agreeModal}) => {
  const handleClick = () => {
    setAgree()
    setExit(false)
  }

  return (
    <Dialog open={agreeModal} onClose={() => setExit(false)} className={styles.modal}>
      <DialogTitle className={styles.title}>
        Вы действительно хотите внести изменения?
      </DialogTitle>
      <DialogActions className={styles.dialogActions}>
        <Button onClick={() => setExit(false)} variant="outlined" color="error">
          Нет
        </Button>
        <Button onClick={handleClick} variant="outlined" color="primary" >
          Да
        </Button>
      </DialogActions>
    </Dialog>
  );
};
