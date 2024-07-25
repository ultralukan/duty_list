import {Duty, DutyId, DutyWithSchedules} from "../components/duty";
import {User} from "../components/user";
import {Schedule} from "../components/schedule";
import {Group} from "../components/group";

interface RequestGetGroupsContent {
  table_view: string,
  timedelta: number
}

interface ResponseGetGroupsContent {
  groups_content: {
    group_name: string,
    group_id: number,
    managers: User[],
    content: DutyWithSchedules[]
  }
}

interface ResponseGetAllGroup {
  groups: Group[]
}

interface ResponseGetCurrentDuties {
  duties: Duty[]
}

interface RequestGetGroupSchedule {
  group_id: number,
  start_time: string,
  end_time: string,
  timedelta: number
}

interface ResponseGetGroupSchedule {
  schedules: Schedule[]
}

interface RequestDeleteDutyFromGroup {
  group_id: number,
  duty_ids: DutyId[]
}

interface ResponseDeleteDutyFromGroup {
  duty_id: number,
  result: boolean,
  detail: string,
  group_id: number
}

interface RequestAddDutiesToGroupGroup {
  group_id: number,
  duty_id: number
}
