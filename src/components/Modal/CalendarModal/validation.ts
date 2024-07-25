import * as Yup from 'yup';
export const validationSchema = Yup.object({
  autocomplete1: Yup.object()
    .shape({
      value: Yup.string().required('Обязательное поле'),
      name: Yup.string().required('Обязательное поле'),
    })
    .nullable()
    .required('Обязательное поле'),
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