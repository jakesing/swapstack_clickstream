import * as Yup from "yup";

import * as systemConstants from "../../constants/system";

export const analyticsBodySchema = Yup.object({
  startDate: Yup.string().required().trim(),
  endDate: Yup.string().default(null).nullable(),
  groupByColumn: Yup.string()
    .default(null)
    .nullable()
    .oneOf(Object.values(systemConstants.GROUP_BY_COLUMNS)),
  dateGrouping: Yup.string()
    .oneOf(Object.values(systemConstants.GROUP_BY_VALUES))
    .when("groupByColumn", {
      is: (val: string) => !!val && systemConstants.GROUP_BY_COLUMNS.DATE === val,
      then: (schema) => schema.required().trim(),
      otherwise: (schema) => schema.default(null).nullable(),
    }),
  links: Yup.array().of(Yup.string()).default([]),
})
  .required()
  .noUnknown(true);
