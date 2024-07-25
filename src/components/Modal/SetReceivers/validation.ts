import * as Yup from 'yup';
export const validationSchemaAdd = Yup.object({
  input: Yup.string()
  .required('Обязательное поле')
  .max(50, 'Максимальное количество символов - 50')
  .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
    message: 'Пожалуйста, введите действительный адрес электронной почты.',
  }),
});

export const validationSchemaDelete = Yup.object({
  autocomplete1: Yup.array()
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