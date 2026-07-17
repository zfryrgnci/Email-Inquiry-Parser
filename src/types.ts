export interface ParsedInquiry {
  client_name: string;
  company: string;
  email_address: string;
  phone_number: string;
  service_requested: string;
  budget: string;
  deadline: string;
  priority: "High" | "Medium" | "Low" | string;
  summary: string;
  key_points: string[];
  sentiment: string;
  parsedAt?: string;
  id?: string;
}
