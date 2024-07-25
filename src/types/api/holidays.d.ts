import {Holiday} from "../components/holiday";

interface ResponseGetHolidays {
  holiday_dates: string[]
}

interface ResponseAddHolidays {
  holiday_dates: string[]
}

interface ResponseHolidays {
  holiday: string,
  result: boolean,
  detail: string
}
