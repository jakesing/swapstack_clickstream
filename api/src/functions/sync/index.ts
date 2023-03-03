import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      schedule: {
        rate: ["rate(6 hours)"],
        enabled: true,
        name: "${env:ENVIRONMENT}_CalendlyAvailabilitySync",
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
