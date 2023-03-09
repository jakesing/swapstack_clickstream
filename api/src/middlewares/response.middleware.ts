import httpStatus from "http-status";
import { Request } from "@middy/core";

import { formatJSONResponse } from "@libs/api-gateway";

import config from "../config/vars";

type CustomRequest = Request & {
  error: Error & {
    status: number;
    data: any;
  };
};

const customResponseMiddleware = () => {
  // custom response handler to format any response and standardise it
  const customMiddlewareAfter = async (request: Request) => {
    const { response } = request;

    const payload = {
      statusCode: response.status || 200,
      // API gateway needs a stringified response which needs to be returned by the lambda
      body: JSON.stringify({
        status: response.status || 200,
        message: response.message || "Success",
        stack: null,
        data: response,
      }),
    };

    request.response = payload;
  };

  const httpErrorHandlerMiddlewareOnError = async (request: CustomRequest) => {
    const { error } = request;

    let status: number = error && error.status ? error.status : httpStatus.INTERNAL_SERVER_ERROR;
    let message: string = error && error.message ? error.message : httpStatus[status];

    const errResponse = {
      status,
      message,
      stack: config.isRelease ? null : error.stack,
      data: error?.data || null,
    };

    if (request.response !== undefined) return;

    request.response = formatJSONResponse(errResponse);
  };

  return {
    after: customMiddlewareAfter,
    onError: httpErrorHandlerMiddlewareOnError,
  };
};

export default customResponseMiddleware;
