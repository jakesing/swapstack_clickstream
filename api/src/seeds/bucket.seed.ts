// import { Knex } from "knex";
import { jsonrepair } from "jsonrepair";
import * as pLimit from "p-limit";
// import * as fs from "fs";

import { IClick } from "../interfaces/IClicks";

import config from "../config/vars";

import { getObject, getFilePaths } from "../utils/storage";
/* import { createDbEventRow } from "../utils/db.helpers";

const parentTableName = "clickstream_events_parent";
const childTableName = "clickstream_events_child"; */

export async function seed(/* knex: Knex */): Promise<void> {
  try {
    return;
    const awsLimit = pLimit(3000);
    // const dbLimit = pLimit(500);

    const paths: string[] = await getFilePaths({
      bucket: config.bucket,
      prefix: "/2023/03/03",
    });

    const limitedPromises = paths.map((path) => awsLimit(() => getParsedJSON(path)));
    const promiseResult = await Promise.allSettled(limitedPromises);
    const result = promiseResult
      .filter((row) => row.status === "fulfilled")
      .map((row: any) => row?.value);
    const resultFailed = promiseResult.filter((row) => row.status !== "fulfilled");
    console.log("🚀 ~ file: bucket.seed.ts:38 ~ seed ~ resultFailed:", resultFailed);
    const data = result.flat();
    console.log("🚀 ~ file: bucket.seed.ts:42 ~ seed ~ data:", data.length);

    // await fs.promises.writeFile("05_march.json", JSON.stringify(data), "utf8");

    // await knex.transaction(async (trx) => {
    // insert all parents

    // Deletes ALL existing entries
    // await knex(childTableName).del();
    // await knex(parentTableName).del();

    /* await Promise.allSettled(
      data
        .map((row) => createDbEventRow(row))
        .map((row) =>
          dbLimit(async () => {
            const parentId: number[] = await knex(parentTableName).insert(row.parent, "id");
            // .transacting(trx);

            await knex(childTableName).insert(
              {
                ...row.child,
                id_parent: parentId[0],
              },
              "id",
            );
            // .transacting(trx);
          }),
        ),
    ); */

    return;
    // });
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
    console.log("🚀 ~ file: bucket.seed.ts:81 ~ getParsedJSON ~ error:", error, path);
    throw error;
  }
};
