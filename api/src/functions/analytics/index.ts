import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  memorySize: 1024,
  events: [
    {
      http: {
        method: "get",
        path: "analytics",
        cors: true,
        // private: true,
      },
    },
  ],
};
