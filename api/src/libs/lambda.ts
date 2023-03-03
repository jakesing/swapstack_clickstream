import middy from "@middy/core";
import type { Handler } from "aws-lambda";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";

export const middyfy = (handler?: Handler) => {
  return middy(handler).use(doNotWaitForEmptyEventLoop());
};
