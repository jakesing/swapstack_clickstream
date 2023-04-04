import * as Yup from "yup";

export const clicksArchiveBodySchema = Yup.object({
  startDate: Yup.string().required().trim(),
  endDate: Yup.string().default(null).nullable(),
  links: Yup.array().of(Yup.string().required()).default([]).min(1).required(),
})
  .required()
  .noUnknown(true);
