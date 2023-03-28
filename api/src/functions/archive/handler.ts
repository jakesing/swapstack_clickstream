import { middyfyApi } from "@libs/lambda";
import { ValidatedAPIGatewayProxyEvent } from "@libs/api-gateway";

import schemaValidator from "../../middlewares/validator.middleware";

import IArchiveApis from "../../interfaces/api/IArchiveApi";

import * as eventsService from "../../services/event.service";

import * as dbUtils from "../../utils/db.helpers";

import { clicksArchiveBodySchema } from "./schema";

// initialise db
dbUtils.fetchDb();

const process = async (event: ValidatedAPIGatewayProxyEvent<IArchiveApis>) => {
  try {
    const {
      body: { links = [] },
    } = event;

    const result = await eventsService.archiveClicks(links);

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const main = middyfyApi(process).use([
  schemaValidator({
    body: clicksArchiveBodySchema,
  }),
]);
