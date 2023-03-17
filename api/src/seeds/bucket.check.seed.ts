import { Knex } from "knex";
import * as fs from "fs";
import * as path from "path";
import { isBefore, startOfDay, endOfDay, format, addDays } from "date-fns";

import { createDbEventRow } from "../utils/db.helpers";

import { IClick } from "../interfaces/IClicks";

const files = [
  // "_2023_02_08.json",
  // "_2023_02_09.json",
  // "_2023_02_10.json",
  // "_2023_02_11.json",
  // "_2023_02_12.json",
  // "_2023_02_13.json",
  // "_2023_02_14.json",
  // "_2023_02_15.json",
  // "_2023_02_16.json",
  // "_2023_02_17.json",
  // "_2023_02_18.json",
  // "_2023_02_19.json",
  // "_2023_02_20.json",
  // "_2023_02_21.json",
  // "_2023_02_22.json",
  // "_2023_02_23.json",
  // "_2023_02_24.json",
  // "_2023_02_25.json",
  // "_2023_02_26.json",
  // "_2023_02_27.json",
  // "_2023_02_28.json",
  // "_2023_03_01.json",
  // "_2023_03_02.json",
  // "_2023_03_03.json",
  // "_2023_03_04.json",
  // "_2023_03_05.json",
  // "_2023_03_06.json",
  // "_2023_03_07.json",
  // "_2023_03_08.json",
  // "_2023_03_09.json",
  // "_2023_03_10.json",
  // "_2023_03_11.json",
  // "_2023_03_12.json",
  // "_2023_03_13.json",
  // "_2023_03_14.json",
  // "_2023_03_15.json",
  // "_2023_03_16.json",
  // "_2023_03_17.json",
];

export async function seed(knex: Knex): Promise<void> {
  try {
    return;
    await filesCheck();

    return;
    await datesCheck(knex, 1675323826000, 1679039026000);
  } catch (error) {
    throw error;
  }
}

const filesCheck = async () => {
  try {
    const result = await Promise.all(
      files.map(async (filename) => {
        const data = await fs.promises.readFile(path.join(__dirname, `./payload/${filename}`));

        const parsedData: IClick[] = JSON.parse(data as unknown as string);
        console.log(`${filename} = `, parsedData?.length);

        const filteredData = parsedData
          .map((row) => createDbEventRow(row))
          .filter((row) => isBefore(row.parent.log_date, new Date(1679011200 * 1000)));

        return {
          filename,
          count: filteredData?.length,
        };
      }),
    );
    console.log("🚀 ~ file: bucket.check.seed.ts:43 ~ seed ~ result:", JSON.stringify(result));

    // return;
    /*  const filename: string = "_2023_02_09.json";

    const data = await fs.promises.readFile(path.join(__dirname, `./payload/${filename}`));

    const parsedData = JSON.parse(data as unknown as string);
    console.log("🚀 ~ file: bucket.check.seed.ts:11 ~ seed ~ parsedData:", parsedData?.length); */
  } catch (error) {
    throw error;
  }
};

const datesCheck = async (knex: Knex, start: number, end: number) => {
  try {
    let currentDate = new Date(start);
    const endDate = new Date(end);

    const ranges = [];
    while (isBefore(currentDate, endDate)) {
      const dayStart = format(startOfDay(currentDate), "t");
      const dayEnd = format(endOfDay(currentDate), "t");

      currentDate = addDays(currentDate, 1);

      ranges.push({
        dayStart,
        dayEnd,
      });
    }

    const result = await Promise.all(
      ranges.map(async (range) => {
        const queryR: any = await knex("clickstream_events_parent")
          .select(knex.raw("count(*) as count"))
          .where("log_date_unix", ">=", +range.dayStart)
          .andWhere("log_date_unix", "<=", +range.dayEnd);

        const count = queryR[0]?.count;

        return {
          start: range.dayStart,
          end: range.dayEnd,
          startDate: format(new Date(range.dayStart * 1000), "yyyy-MM-dd"),
          endDate: format(new Date(range.dayEnd * 1000), "yyyy-MM-dd"),
          count: count,
        };
      }),
    );

    return result;
  } catch (error) {
    throw error;
  }
};
