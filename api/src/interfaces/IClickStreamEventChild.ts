export default interface IClickStreamEventChild {
  id?: number;
  id_parent?: number;
  region: string;
  os_version: string;
  session_start_date: Date;
  referrer_protocol: string;
  referrer_path: string;
  route_slash_tag: string;
  route_creator_id: string;
  route_creator_name: string;
  route_workspace_name: string;
  route_domain_id: string;
  route_domain_raw: string;
  route_domain_zone: string;
  route_destination_raw: string;
  route_destination_protocol: string;
}
