import Knex, { Knex as KnexType } from "knex";
import { parseISO } from "date-fns";

import { IClick, Tags } from "../interfaces/IClicks";
import IEventDBRow from "../interfaces/IEventDBRow";

import config from "../config/vars";

import knexFile from "../config/knexfile";

let db = null;

export const fetchDb = (): KnexType => {
  if (!db) {
    const dbConfig = knexFile[config.environment];
    db = Knex(dbConfig);
  }

  return db;
};

export const createDbEventRow = (payload: IClick): IEventDBRow => {
  let tag_id: string = null;
  let tag_value: string = null;

  // save tag if it exists
  const tags: Tags = payload.route?.tags;
  if (tags && Object.keys(tags)?.length) {
    // tags exist, pick the first one
    const key: string = Object.keys(tags)?.[0];
    if (key) {
      tag_id = key;
      tag_value = tags[key]?.value || null;
    }
  }

  const date = parseISO(payload.timestamp);
  const sessionStartDate = payload.client?.session?.started
    ? parseISO(payload.client?.session?.started)
    : null;

  return {
    parent: {
      log_date: date,
      log_date_unix: date.getTime() / 1000,
      language: payload.client?.language,
      country: payload.client?.location?.country,
      agent_type: payload.client?.agent?.type,
      browser: payload.client?.agent?.browser?.name,
      os: payload.client?.agent.os?.name,
      device: payload.client?.agent?.device?.name,
      referrer: payload.referral?.hostname,
      is_first_session: payload.client?.session?.first || false,
      route_id: payload.route?.id,
      route_workspace_id: payload.route?.creator?.workspace?.id,
    },
    child: {
      region: payload.client?.location?.region,
      os_version: payload.client?.agent?.os?.version,
      session_start_date: sessionStartDate,
      referrer_protocol: payload.referral?.protocol || null,
      referrer_path: payload.referral?.path || null,
      route_slash_tag: payload.route?.slashtag,
      route_creator_id: payload.route?.creator?.id,
      route_creator_name: payload.route?.creator?.name,
      route_workspace_id: payload.route?.creator?.workspace?.id,
      route_workspace_name: payload.route?.creator?.workspace?.name,
      route_domain_id: payload.route?.domain?.id,
      route_domain_raw: payload.route?.domain?.raw,
      route_domain_zone: payload.route?.domain?.zone,
      route_destination_raw: payload.route?.destination?.raw,
      route_destination_protocol: payload.route?.destination?.protocol,
      tag_id,
      tag_value,
    },
  };
};
