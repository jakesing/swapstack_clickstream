import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      sqs: {
        arn: "arn:aws:sqs:${opt:region}:${aws:accountId}:${env:ENVIRONMENT}_click_event_s3_queue",
        // TODO: update count of messages handled by the lambda
        batchSize: 10,
      },
    },
    /* {
      http: {
        method: "get",
        path: "sync",
      },
    }, */
  ],
};
