import * as Yup from 'yup';
export const validationSchema = Yup.object().shape({
  autocomplete: Yup.object()
    .shape({
      value: Yup.string().required('Обязательное поле'),
      name: Yup.string().required('Обязательное поле'),
    })
    .nullable()
    .required('Обязательное поле'),
  datePickers: Yup.array().of(
    Yup.object().shape({
      startDate: Yup.date(),
      endDate: Yup.date()
    }).test('checkRequired', 'Обязательное поле',  (value) =>  {
      if(!value.startDate || !value.endDate) {
        return false
      } else {
        return true;
      }
    }).test('checkTimeDifference', 'Период должен быть не менее 15 минут и не более 24 часов',  (value) =>  {
      if (value.startDate && value.endDate) {
        const diffInMinutes = Math.abs(value.startDate.getTime() - value.endDate.getTime()) / (1000 * 60);
        return diffInMinutes >= 15 && diffInMinutes <= 60 * 24;
      } else {
        return false;
      }
    })
  )

});