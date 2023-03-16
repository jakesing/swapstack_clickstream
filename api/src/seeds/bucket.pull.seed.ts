import { Knex } from "knex";
import { jsonrepair } from "jsonrepair";
import * as pLimit from "p-limit";

import { IClick } from "../interfaces/IClicks";

import config from "../config/vars";

import { getObject, getFilePaths } from "../utils/storage";

import { createDbEventRow } from "../utils/db.helpers";

const parentTableName = "clickstream_events_parent";
const childTableName = "clickstream_events_child";

const awsLimit = pLimit(3000);
const dbLimit = pLimit(900);
const concurrentFetchLimit = pLimit(3);

export async function seed(knex: Knex): Promise<void> {
  try {
    const days: string[] = [
      // "/2023/02/03",
      // "/2023/02/04",
      // "/2023/02/05",
      // "/2023/02/06",
      // "/2023/02/07",
      // "/2023/02/08",
      // "/2023/02/09",
      // "/2023/02/10",
      // "/2023/02/11",
      // "/2023/02/12",
      // "/2023/02/13",
      // "/2023/02/14",
      // "/2023/02/15",
      // "/2023/02/16",
      // "/2023/02/17",
      // "/2023/02/18",
      // "/2023/02/19",
      // "/2023/02/20",
      // "/2023/02/21",
      // "/2023/02/22",
      // "/2023/02/23",
      // "/2023/02/24",
      // "/2023/02/25",
      // "/2023/02/26",
      // "/2023/02/27",
      // "/2023/02/28",
      // "/2023/03/01",
      // "/2023/03/02",
      // "/2023/03/03",
      // "/2023/03/04",
      // "/2023/03/05",
      // "/2023/03/06",
      // "/2023/03/07",
      // "/2023/03/08",
      // "/2023/03/09",
      // "/2023/03/10",
      // "/2023/03/11",
      // "/2023/03/12",
      // "/2023/03/13",
      // "/2023/03/14",
      // "/2023/03/15",
    ];

    const limitedPromises = days.map((day) => concurrentFetchLimit(() => fetchFiles(day)));
    const promiseResult = await Promise.allSettled(limitedPromises);

    const resultFailed = promiseResult.filter((row) => row.status !== "fulfilled");
    console.log("🚀 ~ file: bucket.seed.ts:38 ~ seed ~ resultFailed Total:", resultFailed);

    const result = promiseResult
      .filter((row) => row.status === "fulfilled")
      .map((row: any) => row?.value);

    await Promise.all(
      result
        .flat()
        .map((row) => createDbEventRow(row))
        .map((row) =>
          dbLimit(async () => {
            try {
              const parentId: number[] = await knex(parentTableName).insert(row.parent, "id");

              await knex(childTableName).insert(
                {
                  ...row.child,
                  id_parent: parentId[0],
                },
                "id",
              );
            } catch (sqlError) {
              console.log("🚀 ~ file: bucket.pull.seed.ts:101 ~ dbLimit ~ sqlError:", sqlError);
              throw sqlError;
            }
          }),
        ),
    );

    return;
  } catch (error) {
    throw error;
  }
}

const fetchFiles = async (path: string) => {
  console.log("🚀 ~ file: bucket.pull.seed.ts:44 ~ fetchFiles ~ path:", path);
  try {
    const paths: string[] = await getFilePaths({
      bucket: config.bucket,
      prefix: path,
    });

    const limitedPromises = paths.map((path) => awsLimit(() => getParsedJSON(path)));
    const promiseResult = await Promise.allSettled(limitedPromises);
    const result = promiseResult
      .filter((row) => row.status === "fulfilled")
      .map((row: any) => row?.value);
    const resultFailed = promiseResult.filter((row) => row.status !== "fulfilled");
    console.log("🚀 ~ file: bucket.seed.ts:38 ~ seed ~ resultFailed:", path, resultFailed);
    const data = result.flat();
    console.log("🚀 ~ file: bucket.seed.ts:42 ~ seed ~ data:", path, data.length);

    return data;
  } catch (error) {
    throw error;
  }
};

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
