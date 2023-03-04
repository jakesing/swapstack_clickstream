import { Knex } from "knex";
import { jsonrepair } from "jsonrepair";
import * as pLimit from "p-limit";

import { IClick } from "../interfaces/IClicks";
import IClickStreamEventParent from "../interfaces/IClickStreamEventParent";
import IClickStreamEventChild from "../interfaces/IClickStreamEventChild";

import config from "../config/vars";

import { getObject, getFilePaths } from "../utils/storage";

const parentTableName = config.isRelease
  ? "clickstream_events_parent"
  : `${config.environment}_clickstream_events_parent`;

const childTableName = config.isRelease
  ? "clickstream_events_child"
  : `${config.environment}_clickstream_events_child`;

type DBRow = {
  parent: IClickStreamEventParent;
  child: IClickStreamEventChild;
};

export async function seed(knex: Knex): Promise<void> {
  try {
    const awsLimit = pLimit(100);
    const dbLimit = pLimit(100);

    const paths: string[] = await getFilePaths({
      bucket: config.bucket,
      prefix: "/2023/03/01",
    });

    const limitedPromises = paths.map((path) => awsLimit(() => getParsedJSON(path)));
    const result = await Promise.all(limitedPromises);
    const data = result.flat();
    console.log("🚀 ~ file: bucket.seed.ts:42 ~ seed ~ data:", data.length);

    /* const path: string =
      // "/2023/02/03/10/rb-clicks-stream-1-2023-02-03-10-55-22-34141783-b76b-445c-969c-d85f440d032c";
      "/2023/02/04/01/rb-clicks-stream-1-2023-02-04-01-04-05-8cbc6d1d-e8df-4cb3-a95e-f3129125dd3a";

    const object = await getObject(config.bucket, path);
    const contents = await object.Body.transformToString();
    const repaired = JSON.parse(jsonrepair(contents));

    let dbRows: DBRow[];
    if (Array.isArray(repaired)) {
      const payload: IClick[] = repaired;
      dbRows = payload.map((row) => createDbRow(row));
    } else {
      const payload: IClick = repaired;
      dbRows = [createDbRow(payload)];
    } */

    await knex.transaction(async (trx) => {
      // insert all parents

      // Deletes ALL existing entries
      // await knex(childTableName).del();
      // await knex(parentTableName).del();

      await Promise.all(
        data
          .map((row) => createDbRow(row))
          .map((row) =>
            dbLimit(async () => {
              const parentId: number[] = await knex(parentTableName)
                .insert(row.parent, "id")
                .transacting(trx);

              await knex(childTableName)
                .insert(
                  {
                    ...row.child,
                    id_parent: parentId[0],
                  },
                  "id",
                )
                .transacting(trx);
            }),
          ),
      );

      return true;
    });
  } catch (error) {
    throw error;
  }
}

const getParsedJSON = async (path: string): Promise<IClick[]> => {
  try {
    const object = await getObject(config.bucket, path);
    const contents = await object.Body.transformToString();
    const repaired = JSON.parse(jsonrepair(contents));

    if (Array.isArray(repaired)) return repaired;
    else return [repaired];
  } catch (error) {
    throw error;
  }
};

const createDbRow = (payload: IClick): DBRow => {
  return {
    parent: {
      log_date: new Date(payload.timestamp),
      language: payload.client.language,
      country: payload.client.location.country,
      agent_type: payload.client.agent.type,
      browser: payload.client.agent?.browser?.name,
      os: payload.client.agent.os?.name,
      device: payload.client.agent?.device?.name,
      referrer: payload.referral?.hostname,
      is_first_session: payload.client.session.first,
      route_id: payload.route.id,
      route_workspace_id: payload.route.creator.workspace.id,
    },
    child: {
      region: payload.client.location.region,
      os_version: payload.client.agent.os?.version,
      session_start_date: new Date(payload.client.session.started),
      referrer_protocol: payload.referral?.protocol || null,
      referrer_path: payload.referral?.path || null,
      route_slash_tag: payload.route.slashtag,
      route_creator_id: payload.route.creator.id,
      route_creator_name: payload.route.creator.name,
      route_workspace_name: payload.route.creator.workspace.name,
      route_domain_id: payload.route.domain.id,
      route_domain_raw: payload.route.domain.raw,
      route_domain_zone: payload.route.domain.zone,
      route_destination_raw: payload.route.destination.raw,
      route_destination_protocol: payload.route.destination.protocol,
    },
  };
};
