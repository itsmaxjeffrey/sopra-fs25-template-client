
export interface User {
  id?: number;
  password?: string;
  username?: string;
  token?: string;
  status?: string;
  creationDate?: Date;
  birthday?: string | null; // Changed from dayjs.Dayjs to a string for a formatted date
}