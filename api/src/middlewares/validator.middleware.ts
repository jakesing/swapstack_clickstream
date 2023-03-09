import { Schema, ValidationError, ValidateOptions } from "yup";
import httpStatus from "http-status";
import { Request } from "@middy/core";

const defaultOptions: ValidateOptions = {
  abortEarly: true,
  stripUnknown: true,
};

const schemaValidator = (schema: {
  body?: Schema;
  queryStringParameters?: Schema;
  multiValueQueryStringParameters?: Schema;
}) => {
  const before = async (request: Request) => {
    try {
      const { body, queryStringParameters, multiValueQueryStringParameters } = request.event;

      if (schema.body) await schema.body.validate(body, defaultOptions);

      if (schema.queryStringParameters)
        await schema.queryStringParameters.validate(queryStringParameters ?? {}, defaultOptions);

      if (schema.multiValueQueryStringParameters)
        await schema.multiValueQueryStringParameters.validate(
          multiValueQueryStringParameters ?? {},
          defaultOptions,
        );

      return Promise.resolve();
    } catch (e) {
      const validationError: ValidationError = e as ValidationError;
      const errorMessage: string =
        validationError?.errors?.length > 0 ? validationError.errors[0] : "Internal Server Error";

      const payload = {
        statusCode: httpStatus.UNPROCESSABLE_ENTITY,
        // API gateway needs a stringified response which needs to be returned by the lambda
        body: JSON.stringify({
          status: httpStatus.UNPROCESSABLE_ENTITY,
          message: capitalize(errorMessage),
          stack: null,
          data: null,
        }),
      };

      request.response = payload;
    }
  };

  return {
    before,
  };
};

const capitalize = (s: string) => s && s[0].toUpperCase() + s.slice(1);

export default schemaValidator;
