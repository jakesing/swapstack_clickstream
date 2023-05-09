export enum GROUP_BY_COLUMNS {
  DATE = "date",
  COUNTRY = "country",
  OS = "os",
  LANGUAGE = "language",
  BROWSER = "browser",
  DEVICE = "device",
  REFERRER = "referrer",
  LINKS = "link",
}

export enum GROUP_BY_VALUES {
  YEAR = "year",
  QUARTER = "quarter",
  MONTH = "month",
  WEEK = "week",
  DAY = "day",
  DATE = "date",
  HOUR = "hour",
}

export enum SORT_BY_COLUMNS {
  LABEL = "label",
  UNIQUE_HUMAN_CLICKS = "uniqueHumanClicks",
}

export enum SORT_ORDER {
  ASC = "asc",
  DESC = "desc",
}

export enum FILTER_BY_COLUMNS {
  LANGUAGE = "language",
  COUNTRY = "country",
  AGENT_TYPE = "agent_type",
  BROWSER = "browser",
  OS = "os",
  DEVICE = "device",
  REFERRER = "referrer",
  IS_FIRST_SESSION = "is_first_session",
  ROUTE_ID = "route_id",
  ROUTE_WORKSPACE_ID = "route_workspace_id",
}
