import {User} from "./user";

export type Schedule = {
  group_id: number,
  duty_id: number,
  start_time: string,
  end_time: string,
  is_confirmed: boolean,
  schedule_id: number
}