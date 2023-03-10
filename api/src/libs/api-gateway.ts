import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda";

export type ValidatedAPIGatewayProxyEvent<T> = Omit<APIGatewayProxyEvent, "body"> & {
  body: T;
};

export type ValidatedEventAPIGatewayProxyEvent<T> = Handler<
  ValidatedAPIGatewayProxyEvent<T>,
  APIGatewayProxyResult
>;

export const formatJSONResponse = (response: Record<string, unknown>) => {
  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
};
