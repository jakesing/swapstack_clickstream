export default interface IClickStreamEventParent {
  id?: number;
  log_date: Date;
  language: string;
  country: string;
  agent_type: string;
  browser: string;
  os: string;
  device: string;
  referrer: string;
  is_first_session: boolean;
  route_id: string;
  route_workspace_id: string;
}
