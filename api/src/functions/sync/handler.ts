import type { ScheduledEvent } from "aws-lambda";
import { middyfy } from "@libs/lambda";


const processMessage = async (event: ScheduledEvent) => {
  try {

    return event;
  } catch (error) {
    console.error("🚀 ~ file: handler.ts:9 ~ processMessage ~ error", error);
    throw error;
  }
};

export const main = middyfy(processMessage);
