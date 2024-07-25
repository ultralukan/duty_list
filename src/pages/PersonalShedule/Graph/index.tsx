import Timeline from '@rikkeisoft/react-calendar-timeline-dayjs'
import {
  TimelineMarkers,
  TodayMarker,
  SidebarHeader,
  TimelineHeaders,
  DateHeader
} from "@rikkeisoft/react-calendar-timeline-dayjs";
import '@rikkeisoft/react-calendar-timeline-dayjs/lib/Timeline.css'

import styles from './styles.module.scss';
import './Graph.scss';
import cn from "classnames";
import {Tooltip} from "@mui/material";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {DataGraph} from "../../../types/components/table";
import {Option} from "../../../types/components/options";
import * as dayjs from "dayjs";

interface GraphScheduleProps {
  dutiesOptions?: Option[],
  groupsOptions?: Option[],
  items: DataGraph,
  setScheduleId?: () => void,
  selectedValue: number,
  setOpen?: () => void,
  setDutyId: () => void,
}

const colors = {
  current: '#92e592',
  future: '#FFF',
  selected: '#FFFBC9',
  notConfirmed: '#B94A4AFF',
  past: '#CFD2DD',
}

const format = {
  year: {
    long: 'YYYY',
    mediumLong: 'YYYY',
    medium: 'YYYY',
    short: 'YY'
  },
  month: {
    long: 'MMMM YYYY',
    mediumLong: 'MMMM',
    medium: 'MMMM',
    short: 'MM/YY'
  },
  week: {
    long: 'w',
    mediumLong: 'w',
    medium: 'w',
    short: 'w'
  },
  day: {
    long: 'dddd, D MMMM YYYY г.',
    mediumLong: 'dd D',
    medium: 'dd D',
    short: 'D'
  },
  hour: {
    long: 'dddd, D MMMM, HH:00',
    mediumLong: 'dddd, D MMMM, HH:00',
    medium: 'HH:00',
    short: 'HH'
  },
  minute: {
    long: 'HH:mm',
    mediumLong: 'HH:mm',
    medium: 'HH:mm',
    short: 'mm',
  }
}

export const GraphSchedule: React.FC<GraphScheduleProps> = ({ holidays, selectedItems, setSelectedItems, groups, defaultTime, today, setDefaultTime, items}) => {

  const [formItems, setFormItems] = useState([]);

  useEffect(() => {
    setFormItems(items)
  }, [items])

  const handleItemClick = (itemId) => {
    setFormItems(prevSelectedItems => {
      return prevSelectedItems.map((item) => {
        if(item.id === itemId) return {...item, isSelected: !item.isSelected}
        return item
      })
    });
    setSelectedItems((prevState) => {
      if(prevState.includes(itemId)) return prevState.filter(item => item != itemId)
      else return [...prevState, itemId]
    })
  };

  const timeStart = new Date(today);
  timeStart.setDate(today.getDate() - 3)

  const timeEnd = new Date(today);
  timeEnd.setDate(today.getDate() + 4)

  const timeoutRef = useRef(null);

  const verticalLineClassNamesForTime = (timeStart: any, timeEnd: any) => {
    const currentTimeStart = new Date(timeStart);
    const currentTimeEnd = new Date(timeEnd);

    let classes = [];

    for (let holiday of holidays) {
      if ((holidays.includes(dayjs(currentTimeStart).format('YYYY-MM-DD')) && holidays.includes(dayjs(currentTimeEnd).format('YYYY-MM-DD')) )
        || (currentTimeStart.getDay() === 0 && currentTimeEnd.getDay() === 0) || (currentTimeStart.getDay() === 6 && currentTimeEnd.getDay() === 6)) {
        classes.push("highlight");
      }
    }

    return classes;

  };

  const groupRenderer = ({group}) => {

    return (
      <Tooltip title={group.id !== 999999999 && group.tooltip}>
        <span className={cn({[styles.isManager]: group.isManager}, {[styles.isCurrent]: group.isCurrent}, {[styles.isEmptyFuture]: group.isBusy})}>
          {group.title}
        </span>
      </Tooltip>
    );
  };
  const itemRenderer = ({item, getItemProps}) => {

    const stringTime = `${dayjs(item.start_time).format("HH:mm")} - ${dayjs(item.end_time).format("HH:mm")}`
    let color = colors.future
    if(selectedItems.includes(item.id)) {
      color = colors.selected
    } else if(!item.is_confirmed) {
      color = colors.notConfirmed
    } else if(item.isCurrent) {
      color = colors.current
    } else if(item.isPast) {
      color = colors.past
    }
    const style = {
      background: color,
      minWidth: '7px',
      borderRadius: '10px',
    }
    const canClick = !item.is_confirmed
    return (
      <Tooltip title={stringTime}>
        <div
          {...getItemProps({style})}
          className={styles.item}
          key={item.id}
          onClick={() => canClick && handleItemClick(item.id)}
        />
      </Tooltip>
    );
  };

  const handleTimeChange = useCallback((visibleTimeStart, visibleTimeEnd, updateScrollCanvas) => {
    updateScrollCanvas(visibleTimeStart, visibleTimeEnd);
    clearTimeout(timeoutRef.current);
    if(new Date(visibleTimeStart).getDate() !== defaultTime.defaultTimeStart.getDate() && new Date(visibleTimeEnd).getDate() !== defaultTime.defaultTimeEnd.getDate()) {
      timeoutRef.current = setTimeout(() => {
        setDefaultTime({
          defaultTimeStart: new Date(visibleTimeStart),
          defaultTimeEnd: new Date(visibleTimeEnd)
        });
      }, 200);
    }

  }, [defaultTime])


  return (
    <>
      <div className={styles.table}>
        <Timeline
          groups={groups}
          items={formItems || []}
          minZoom={60 * 60 * 1000}
          maxZoom={365.24 * 86400 * 1000}
          defaultTimeStart={timeStart}
          defaultTimeEnd={timeEnd}
          canResize={false}
          canMove={false}
          lineHeight={70}
          verticalLineClassNamesForTime={verticalLineClassNamesForTime}
          sidebarWidth={320}
          groupRenderer={groupRenderer}
          itemRenderer={itemRenderer}
          onTimeChange={handleTimeChange}
          buffer={1}
        >
          <TimelineHeaders>
            <SidebarHeader>
              {({ getRootProps }) => {
                return <div {...getRootProps()} className={styles.title}>{'Группа'}</div>
              }}
            </SidebarHeader>
            <DateHeader unit="primaryHeader" labelFormat={(date, unit, width) => {
              const formatWidth = width <= 50 ? 'short' : width <= 100 ? 'medium' : width <= 150 ? 'mediumLong' : 'long'
              return date[0].format(format[unit][formatWidth])
            }} />
            <DateHeader labelFormat={(date, unit, width) => {
              const formatWidth = width <= 50 ? 'short' : width <= 100 ? 'medium' : width <= 150 ? 'mediumLong' : 'long'
              return date[0].format(format[unit][formatWidth])
            }} />
          </TimelineHeaders>
          <TimelineMarkers>
            <TodayMarker date={today}>
              {({ styles }) => {
                const customStyles = {
                  ...styles,
                  backgroundColor: "#6aca6c",
                  width: '2px'
                }
                return <div style={customStyles}  />
              }}
            </TodayMarker>
          </TimelineMarkers>
        </Timeline>
      </div>
    </>
  );
}


