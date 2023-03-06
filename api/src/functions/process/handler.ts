import type { SQSEvent, SQSRecord, S3EventRecord } from "aws-lambda";
import sqsBatch from "@middy/sqs-partial-batch-failure";
import { jsonrepair } from "jsonrepair";

import { middyfy } from "@libs/lambda";

import { getObject } from "../../utils/storage";
import { createDbEventRow } from "../../utils/db.helpers";

import { IClick } from "../../interfaces/IClicks";
import IEventDBRow from "../../interfaces/IEventDBRow";

import * as eventsService from "../../services/event.service";

import * as dbUtils from "../../utils/db.helpers";

// initialise db
dbUtils.fetchDb();

const processMessage = async (event: SQSEvent) => {
  try {
    console.log("🚀 ~ file: handler.ts:23 ~ processMessage ~ event:", JSON.stringify(event));

    const promises = event.Records.map(async (record: SQSRecord) => {
      try {
        console.log(
          "🚀 ~ file: handler.ts:30 ~ promises ~ payload:before",
          JSON.parse(record as unknown as string)?.s3,
        );
      } catch (ignoredError) {}
      console.log("🚀 ~ file: handler.ts:27 ~ promises ~ record:", JSON.stringify(record));
      try {
        try {
          console.log(
            "🚀 ~ file: handler.ts:30 ~ promises ~ payload:after",
            JSON.parse(record as unknown as string)?.s3,
          );
        } catch (ignoredError2) {}

        const result = await processRecord(record as unknown as S3EventRecord);

        return result;
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

const processRecord = async (record: S3EventRecord): Promise<boolean> => {
  try {
    const path = record.s3.object.key;
    console.log("🚀 ~ file: handler.ts:48 ~ processRecord ~ path:", path);

    const object = await getObject(record.s3.bucket.name, path);
    console.log("🚀 ~ file: handler.ts:51 ~ processRecord ~ object:", object);
    const contents = await object.Body.transformToString();
    console.log("🚀 ~ file: handler.ts:53 ~ processRecord ~ contents:", contents);
    const repaired: IClick | IClick[] = JSON.parse(jsonrepair(contents));
    console.log("🚀 ~ file: handler.ts:55 ~ processRecord ~ repaired:", repaired);

    let payload: IClick[] = [];
    if (Array.isArray(repaired)) payload = repaired;
    else payload.push(repaired);

    const rows: IEventDBRow[] = payload.map((row) => createDbEventRow(row));
    console.log("🚀 ~ file: handler.ts:62 ~ processRecord ~ rows:", rows);

    await eventsService.logEvents(rows);

    return true;
  } catch (error) {
    console.error("🚀 ~ file: handler.ts:68 ~ processRecord ~ error:", error);
    throw error;
  }
};

export const main = middyfy(processMessage).use(sqsBatch());
