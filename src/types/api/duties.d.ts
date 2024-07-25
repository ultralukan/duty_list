import {Duty, DutyId} from "../components/duty";
import {Chief} from "../components/chief";
import {UserId} from "../components/user";
import {Schedule} from "../components/schedule";

interface RequestGetAllDuties {
  duties: Duty[]
}

interface RequestGetPhoto {
  user_id: string
}

interface RequestGetChief {
  user_ids: string
}

interface ResponseGetChief {
  chief: Chief | null,
  user_id: string,
  result: boolean,
  detail: string
}

interface RequestAddDuty {
  user_ids: UserId[]
}

interface ResponseAddDuty {
  duty_id: number,
  result: boolean,
  detail: string
}

interface RequestDeleteDuty {
  duty_ids: DutyId[]
}

interface ResponseDeleteDuty {
  duty_id: number,
  result: boolean,
  detail: string
}

interface RequestUploadDuty {
  file_bytes: string
}

interface ResponseUploadDuty {
  duty_id: number,
  result: boolean,
  detail: string
}

interface RequestGetDutiesSelectedDuty {
  duty_id: number,
  timedelta: number,
  start_time?: string,
  end_time?: string
}

interface ResponseGetDutiesSelectedDuty {
  schedules: Schedule[]
}