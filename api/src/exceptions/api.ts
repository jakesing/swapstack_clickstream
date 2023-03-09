import httpStatus from "http-status";

import APIError from "../utils/APIError";

export const startTimeAfterEndTimeError = new APIError(
  "Start time cannot be after end time",
  httpStatus.UNPROCESSABLE_ENTITY,
);

export const invalidStartDate = new APIError("Invalid start date", httpStatus.PRECONDITION_FAILED);
export const invalidEndDate = new APIError("Invalid end date", httpStatus.PRECONDITION_FAILED);

export const invalidGroupByClause = new APIError(
  "Invalid group by clause",
  httpStatus.PRECONDITION_FAILED,
);
export const missingGroupByColumnClause = new APIError(
  "Missing group by column clause",
  httpStatus.PRECONDITION_FAILED,
);

export const missingTimezone = new APIError("Missing timezone", httpStatus.UNPROCESSABLE_ENTITY);
