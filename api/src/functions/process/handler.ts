import type { SQSEvent, SQSRecord } from "aws-lambda";
import sqsBatch from "@middy/sqs-partial-batch-failure";

import { middyfy } from "@libs/lambda";

const processMessage = async (event: SQSEvent) => {
  try {
    // process each message
    const promises = event.Records.map(async (record: SQSRecord) => {
      try {
        const payload = JSON.parse(record.body);
        console.log("🚀 ~ file: handler.ts:12 ~ promises ~ payload:", JSON.stringify(payload));

        return null;
      } catch (error) {
        console.error("🚀 ~ file: handler.ts:16 ~ promises ~ error", error);

        return record.messageId;
      }
    });

    return Promise.allSettled(promises);
  } catch (sqsError) {
    console.error("🚀 ~ file: handler.ts:25 ~ processMessage ~ sqsError:", sqsError);
    throw sqsError;
  }
};

export const main = middyfy(processMessage).use(sqsBatch());
