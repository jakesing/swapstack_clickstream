import middy from "@middy/core";
import type { Handler } from "aws-lambda";
import errorLogger from "@middy/error-logger";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import cors from "@middy/http-cors";
import httpSecurityHeaders from "@middy/http-security-headers";
import middyJsonBodyParser from "@middy/http-json-body-parser";

import customResponseMiddleware from "../middlewares/response.middleware";

export const middyfy = (handler?: Handler) =>
  middy(handler).use(doNotWaitForEmptyEventLoop()).use(errorLogger());

export const middyfyApi = (handler?: Handler) =>
  middyfy(handler)
    .use(
      cors({
        maxAge: 86400, // cache options for a day
      }),
    )
    .use(httpSecurityHeaders())
    .use(middyJsonBodyParser())
    .use(customResponseMiddleware());
