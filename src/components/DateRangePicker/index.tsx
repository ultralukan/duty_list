import React, {useEffect, useMemo, useRef} from "react";
import { CustomProvider, DateRangePicker } from "rsuite";
import { ruRU } from "rsuite/locales";
import { allowedMaxDays } from "rsuite/cjs/DateRangePicker/disabledDateUtils";
import './DateRangePicker.scss';
import cn from "classnames";
import {DateRange} from "../../types/components/date";
import ClearIcon from '@mui/icons-material/Clear';
import {Tooltip} from "@mui/material";
interface CustomDateRangePickerProps {
  helperText: string;
  index: number;
  setDatePickers: (value:any) => void;
  readonly?: boolean;
}

export const CustomDateRangePicker: React.FC<CustomDateRangePickerProps> = ({helperText, index, shouldClear=true, setDatePickers, datePickers, readonly}) => {
  const startDate = useMemo(() => datePickers.startDate, [datePickers, index])
  const endDate = useMemo(() => datePickers.endDate, [datePickers, index])
  const period = startDate && endDate ? [startDate, endDate] : []

  const diffDate = useMemo(() => startDate && endDate && Math.abs(startDate.getTime() - endDate.getTime()) / (1000 * 60), [startDate, endDate]);
  const isValid = !(diffDate >= 15 && diffDate <= 60 * 24)
  const handleChange = async (values: Date[]) => {
    const startDate = values && (values[0].getTime() > values[1].getTime() ? values[1] : values[0])
    const endDate = values && (values[0].getTime() > values[1].getTime() ? values[0] : values[1])
    setDatePickers((prevState: DateRange) => {
      const array = [...prevState]
      array[index] = {startDate, endDate}
      return array
    })
  }

  const handleKeyPress = (event) => {
    const { key } = event;
    const allowedCharacters = /[0-9:. ]|Backspace|Delete|ArrowLeft|ArrowRight/;

    if (!allowedCharacters.test(key)) {
      event.preventDefault();
    }
  };
  const handleClean = () => {
    setDatePickers((prevState) => {
      const newArray = [...prevState];
      newArray[index] = {};
      return newArray;
    })
  }
  const myInputRef = useRef(null);
  return (
    <div className={cn({ ["dateRangeError"]: helperText && isValid})}>
      <div className="range">
        <CustomProvider locale={ruRU}>
          <DateRangePicker
            format="dd.MM.yyyy HH:mm"
            value={period}
            disabledDate={allowedMaxDays(2)}
            ranges={[]}
            onChange={(values) => handleChange(values)}
            placeholder='Дата начала - Дата окончания'
            placement='autoVerticalStart'
            onInput={() => myInputRef.current.close()}
            readOnly={readonly}
            ref={myInputRef}
            onKeyDown={handleKeyPress}
            isoWeek
          />
        </CustomProvider>
        {shouldClear && (
          <Tooltip title={'Очистить'} className="icon-container">
            <ClearIcon onClick={handleClean}/>
          </Tooltip>
        )}
      </div>
      {helperText && isValid ? (
        <div className="helpertext">{helperText}</div>
      ) : null}
    </div>
  );
};
