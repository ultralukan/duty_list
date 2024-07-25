import * as Yup from 'yup';
export const selectValidationSchema = Yup.object().shape({
});

export const periodValidationSchema = Yup.object().shape({
  autocomplete: Yup.object()
    .shape({
      value: Yup.string().required('Обязательное поле'),
      name: Yup.string().required('Обязательное поле'),
    })
    .nullable()
    .required('Обязательное поле'),
  period: Yup.array().of(
    Yup.object().shape({
      start: Yup.date(),
      end: Yup.date()
    }).test('checkRequired', 'Обязательное поле',  (value) =>  {
      if(!value.start || !value.end) {
        return false
      } else {
        return true;
      }
    })
  )
});