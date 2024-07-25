import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {Button, styled} from "@mui/material";
import {useEffect, useState} from "react";
import {setError, setInfo} from "../../../slices/auth.ts";
import {useDispatch} from "react-redux";
import {useUploadDutiesMutation} from "../../../api/duties.ts";

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});
export default function InputFileUpload() {
  const [upload] = useUploadDutiesMutation({})
  const [file, setFile] = useState(null);
  const dispatch = useDispatch();
  useEffect(() => {
    const uploadFile = async () => {
      try {
        if (file) {
          const formData = new FormData();
          formData.append('file_bytes', file);
          const response = await upload(formData);
          if(!response.error) {
            const errors = []
            const success = []
            response.data && response.data.forEach((el) => {
              if(el.result) {
                success.push(el.detail)
              } else {
                errors.push(el.detail)
              }
            })
            dispatch(setInfo(success.join(' ')))
            dispatch(setError(errors.join(' ')))
          }
          setFile(null);
        }
      } catch (e) {
      }
    };

    uploadFile();
  }, [file]);

  const handleUpload = (e) => {
    const file = e.target.files[0]
    setFile(file)
  };

  return (
    <Button
      component="label"
      role={undefined}
      variant="contained"
      tabIndex={-1}
      startIcon={<CloudUploadIcon />}
      onChange={handleUpload}
      onClick={(event)=> {
        event.target.value = null
      }}
    >
      Загрузить файл с дежурными
      <VisuallyHiddenInput type="file" />
    </Button>
  );
}