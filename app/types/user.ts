export interface User {
  id: number | null;
  password: string | null;
  username: string | null;
  token: string | null;
  status: string | null;
  creationDate: Date | null;
  birthday: Date | null;
}
