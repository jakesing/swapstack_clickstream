import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  memorySize: 512,
  events: [
    {
      http: {
        method: "put",
        path: "clicks/archive",
        cors: true,
        private: true,
      },
    },
  ],
};
