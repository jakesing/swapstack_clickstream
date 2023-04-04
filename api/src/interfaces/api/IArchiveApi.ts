import * as Yup from "yup";

import { clicksArchiveBodySchema } from "../../functions/archive/schema";

export default interface IArchiveApi extends Yup.InferType<typeof clicksArchiveBodySchema> {}
