import {User} from "./user";
import {Schedule} from "./schedule";

export type Duty = User & {
  duty_id: number
}

export type DutyWithSchedules = User & {
  duty_id: number
  schedules: Schedule[]
}
export type DutyId = {
  duty_id: string,
}