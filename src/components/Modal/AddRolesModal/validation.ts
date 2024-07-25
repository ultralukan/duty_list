import * as Yup from 'yup';
interface FormData {
  input: string;
}

export const validationSchema: Yup.SchemaOf<FormData> = Yup.object({
  autocomplete2: Yup.array()
    .min(1, 'Обязательное поле')
    .of(
      Yup.object().shape({
        value: Yup.string().required('Обязательное поле'),
        name: Yup.string().required('Обязательное поле'),
      })
    )
    .nullable()
    .required('Обязательное поле'),
});

export const validationEmptySchema: Yup.SchemaOf<FormData> = Yup.object({
});