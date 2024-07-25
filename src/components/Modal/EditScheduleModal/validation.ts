import * as Yup from 'yup';
export const validationSchema = Yup.object().shape({
  datePickers: Yup.array().of(
    Yup.object().shape({
      start: Yup.date(),
      end: Yup.date()
    }).test('checkRequired', 'Обязательное поле',  (value) =>  {
      if(!value.start || !value.end) {
        return false
      } else {
        return true;
      }
    }).test('checkTimeDifference', 'Период должен быть не менее 15 минут и не более 24 часов',  (value) =>  {
      if (value.start && value.end) {
        const diffInMinutes = Math.abs(value.start.getTime() - value.end.getTime()) / (1000 * 60);
        return diffInMinutes >= 15 && diffInMinutes <= 60 * 24;
      } else {
        return false;
      }
    })
  )
});