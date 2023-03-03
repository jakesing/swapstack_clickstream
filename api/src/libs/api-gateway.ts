import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda";
import type { FromSchema, JSONSchema7 } from "json-schema-to-ts";

export type ValidatedAPIGatewayProxyEvent<S extends JSONSchema7> = Omit<
  APIGatewayProxyEvent,
  "body"
> & {
  body: FromSchema<S>;
};

export type ValidatedEventAPIGatewayProxyEvent<S extends JSONSchema7> = Handler<
  ValidatedAPIGatewayProxyEvent<S>,
  APIGatewayProxyResult
>;

export const formatJSONResponse = (response: Record<string, unknown>) => {
  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
};
