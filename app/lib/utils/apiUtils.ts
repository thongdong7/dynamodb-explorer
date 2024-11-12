export interface APIError {
  ok: false;
  error?: string;
  errors?: {
    name: (string | number)[];
    errors: string[];
  }[];
}
