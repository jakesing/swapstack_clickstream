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
  sortBy: Yup.string()
    .default(null)
    .nullable()
    .oneOf(Object.values(systemConstants.SORT_BY_COLUMNS)),
  sortOrder: Yup.string()
    .default(systemConstants.SORT_ORDER.DESC)
    .nullable()
    .oneOf(Object.values(systemConstants.SORT_ORDER)),
  links: Yup.array().of(Yup.string()).default([]),
  tags: Yup.array().of(Yup.string()).default([]),
  workspaces: Yup.array().of(Yup.string()).default([]),
  filterByColumn: Yup.string()
    .default(null)
    .nullable()
    .oneOf(Object.values(systemConstants.FILTER_BY_COLUMNS)),
  filterByValue: Yup.string().when("filterByColumn", {
    is: (val: string) => !!val,
    then: (schema) => schema.trim().nullable(),
    otherwise: (schema) => schema.default(null).nullable(),
  }),
})
  .required()
  .noUnknown(true);
