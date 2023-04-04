import { middyfyApi } from "@libs/lambda";
import { isValid, parseISO } from "date-fns";

import { ValidatedAPIGatewayProxyEvent } from "@libs/api-gateway";

import schemaValidator from "../../middlewares/validator.middleware";

import IArchiveApis from "../../interfaces/api/IArchiveApi";

import * as eventsService from "../../services/event.service";

import * as apiExceptions from "../../exceptions/api";

import * as dbUtils from "../../utils/db.helpers";

import { clicksArchiveBodySchema } from "./schema";

// initialise db
dbUtils.fetchDb();

const process = async (event: ValidatedAPIGatewayProxyEvent<IArchiveApis>) => {
  try {
    const {
      body: { links = [], startDate, endDate = null },
    } = event;

    const parsedStartDate: Date = parseISO(startDate);
    // default to now if end date is not specified
    const parsedEndDate: Date = endDate ? parseISO(endDate) : new Date();

    if (parsedStartDate.getTime() > parsedEndDate.getTime())
      throw apiExceptions.startTimeAfterEndTimeError;
    if (!isValid(parsedStartDate)) throw apiExceptions.invalidStartDate;
    if (!isValid(parsedEndDate)) throw apiExceptions.invalidEndDate;

    const result = await eventsService.archiveClicks(links, parsedStartDate, parsedEndDate);

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
