import * as Yup from "yup";

import { analyticsBodySchema } from "../../functions/analytics/schema";

export default interface IAnalyticsApi extends Yup.InferType<typeof analyticsBodySchema> {}
