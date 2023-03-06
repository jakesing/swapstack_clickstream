import type { SQSEvent, SQSRecord, S3EventRecord } from "aws-lambda";
import sqsBatch from "@middy/sqs-partial-batch-failure";
import { jsonrepair } from "jsonrepair";

import { middyfy } from "@libs/lambda";

import { getObject } from "../../utils/storage";
import { createDbEventRow } from "../../utils/db.helpers";

import { IClick } from "../../interfaces/IClicks";
import IEventDBRow from "../../interfaces/IEventDBRow";

import * as eventsService from "../../services/event.service";

import config from "../../config/vars";

import * as dbUtils from "../../utils/db.helpers";

// initialise db
dbUtils.fetchDb();

const processMessage = async (event: SQSEvent) => {
  try {
    // process each message
    const promises = event.Records.map(async (record: SQSRecord) => {
      try {
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

    const object = await getObject(config.bucket, path);
    const contents = await object.Body.transformToString();
    const repaired: IClick | IClick[] = JSON.parse(jsonrepair(contents));

    let payload: IClick[] = [];
    if (Array.isArray(repaired)) payload = repaired;
    else payload.push(repaired);

    const rows: IEventDBRow[] = payload.map((row) => createDbEventRow(row));

    await eventsService.logEvents(rows);

    return true;
  } catch (error) {
    throw error;
  }
};

export const main = middyfy(processMessage).use(sqsBatch());
