export interface IClick {
  timestamp: string;
  client: Client;
  route: Route;
  referral?: Referral;
}

export interface Client {
  language: string;
  location: Location;
  agent: Agent;
  session: Session;
}

export interface Agent {
  type: string;
  browser: Browser;
  os: Browser;
  device: Device;
}

export interface Browser {
  name: string;
  version?: string;
}

export interface Device {
  name: string;
}

export interface Location {
  country: string;
  region: string;
  city: string;
}

export interface Session {
  started: string;
  first: boolean;
}

export interface Referral {
  hostname: string;
  protocol: string;
  path: string;
  origin: Origin;
}

export interface Origin {
  type: string;
  name: string;
}

export interface Route {
  id: string;
  slashtag: string;
  createdAt: Date;
  creator: Creator;
  domain: Domain;
  destination: Destination;
  tags: Tags;
}

export interface Creator {
  id: string;
  name: string;
  workspace: Workspace;
}

export interface Workspace {
  id: string;
  name: string;
}

export interface Destination {
  raw: string;
  protocol: string;
  hostname: string;
  path: string;
  params: Params;
}

export interface Tags {
  [key: string]: {
    value: string;
    version: string;
  };
}

export interface Params {
  query: Query;
}

export interface Query {
  utm_source: string[];
  utm_medium: string[];
  utm_campaign: string[];
}

export interface Domain {
  id: string;
  raw: string;
  zone: string;
}
