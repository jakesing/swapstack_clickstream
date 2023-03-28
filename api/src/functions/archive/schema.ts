import * as Yup from "yup";

export const clicksArchiveBodySchema = Yup.object({
  links: Yup.array().of(Yup.string().required()).default([]).min(1).required(),
})
  .required()
  .noUnknown(true);
