import dayjs from "dayjs";

export interface User {
id?: number;
password?: string;
username?: string;
token?: string;
status?: string;
creationDate?: Date;
birthday?: dayjs.Dayjs | null;}
