import * as Yup from 'yup';

export const validationSchema = Yup.object().shape({
  input: Yup.string()
    .required('Обязательное поле')
    .max(50, 'Максимальное количество символов - 50')
    .matches(/^[^\\]*$/, {
      message: 'Имя пользователя не должно содержать символ \\',
    })
});