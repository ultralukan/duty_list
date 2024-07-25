import * as Yup from 'yup';
export const validationSchema = Yup.object().shape({
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