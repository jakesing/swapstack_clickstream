import type { S3Event, S3EventRecord, SQSRecord, SQSEvent } from "aws-lambda";
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
    const promises = event.Records.map(async (record: SQSRecord) => {
      try {
        const s3Records: S3Event = JSON.parse(record.body);

        await Promise.all(s3Records.Records.map((s3Item: S3EventRecord) => processRecord(s3Item)));

        return true;
      } catch (error) {
        console.error("🚀 ~ file: handler.ts:16 ~ promises ~ error", error);

        const eventRecord: SQSRecord = record as unknown as SQSRecord;
        return eventRecord?.messageId;
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

    const object = await getObject(record.s3.bucket.name, path);
    const contents = await object.Body.transformToString();
    const repaired: IClick | IClick[] = JSON.parse(jsonrepair(contents));

    let payload: IClick[] = [];
    if (Array.isArray(repaired)) payload = repaired;
    else payload.push(repaired);

    const rows: IEventDBRow[] = payload.map((row) => createDbEventRow(row));

    await eventsService.logEvents(rows);

    return true;
  } catch (error) {
    console.error("🚀 ~ file: handler.ts:68 ~ processRecord ~ error:", error);
    throw error;
  }
};

export const main = middyfy(processMessage).use(sqsBatch());
