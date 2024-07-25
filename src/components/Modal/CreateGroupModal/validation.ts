import * as Yup from 'yup';
interface FormData {
  input: string;
}

export const validationSchema: Yup.SchemaOf<FormData> = Yup.object({
  input: Yup.string()
    .required('Обязательное поле')
    .min(2, 'Минимальное количество символов - 2')
    .max(32, 'Максимальное количество символов - 32')
    .matches(/^(?![ !?])(?!.*[!?])(?!.*  )[^!?]*[^!? ]$/, {
      message: 'Название группы не должно начинаться на пробел, заканчиваться пробелом, содержать символы ! и ?, количество пробелов между словами не может быть больше одного',
    }),
});