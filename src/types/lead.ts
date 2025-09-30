export interface Lead {
  [key: string]: any; // Dynamic keys for Google Sheet data
  row_index: number;
  agent_script?: string;
  history?: string;
  'Business Name'?: string;
  'Phone Number'?: string;
}