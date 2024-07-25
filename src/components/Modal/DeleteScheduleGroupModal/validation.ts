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
      startDate: Yup.date().required('Укажите период'),
      endDate: Yup.date().required('Укажите период')
    })
  ).test('checkTimeDifference', 'Период должен быть не менее 15 минут и не более 24 часов',  (value) =>  {
    const isValid = value.every((dates) => {
      const diffInMinutes = Math.abs(dates.startDate.getTime() - dates.endDate.getTime()) / (1000 * 60);
      return diffInMinutes >= 15 && diffInMinutes <= 60 * 24 - 1; // 14 hours converted to minutes
    });
    return isValid;
  })
});