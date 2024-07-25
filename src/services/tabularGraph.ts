import dayjs from "dayjs";

export const getUniqueNumbers = (arr1, arr2) => {
  const combinedSet = new Set([...arr1, ...arr2]);

  const uniqueSet = new Set([...arr1.filter(num => !arr2.includes(num)), ...arr2.filter(num => !arr1.includes(num))]);

  const uniqueNumbers = [...combinedSet].filter(num => uniqueSet.has(num));

  return uniqueNumbers;
}

const dayInSeconds = dayjs().endOf('day').unix() - dayjs().startOf('day').unix()

export function getDates(startDate, endDate) {
  const datesArray = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    datesArray.push(dayjs(new Date(currentDate)).format('DD.MM.YYYY'));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return datesArray;
}

export function findFreeIntervals(schedules, datesArr) {
  const arr = []
  if(datesArr.length) {
    const dates = getDates(datesArr[0], datesArr[1]);

    const datesOBj = datesToObject(splitShifts(schedules))

    dates.forEach((date, index) => {
      if(!datesOBj[date]) {
        arr.push({
          id: -index,
          start_time: dayjs(date, 'DD.MM.YYYY').startOf('day'),
          end_time: dayjs(date, 'DD.MM.YYYY').endOf('day').add(1, 'second'),
          group: 999999999,
          isEmpty: true
        })
      } else {
        const gaps = findGapsInDay(datesOBj[date], date)

        gaps.forEach((gap, index2) => {
          arr.push({
            id: `-${index}-${index2}`,
            start_time: gap[0],
            end_time: gap[1],
            group: 999999999,
            isEmpty: true
          })
        })
      }
    })
  }
  return arr
}

function findGapsInDay(intervalsInDay, date) {
  const gaps = [];

  intervalsInDay.forEach(interval => {
    const startDayTime = dayjs(interval.start_time).startOf('day').unix()
    const startIntervalTime = dayjs(interval.start_time).unix()
    const endIntervalTime = dayjs(interval.end_time).unix()
    gaps.push([startIntervalTime - startDayTime, endIntervalTime - startDayTime])
  })
  return findGaps(gaps).map(el => [dayjs(date, 'DD.MM.YYYY').startOf('day').add(el[0], 'second'), dayjs(date, 'DD.MM.YYYY').startOf('day').add(el[1], 'second')])
}

function findGaps(intervals) {
  let gaps = [];
  let lastEndTime = 0;

  intervals.forEach(interval => {
    const [start, end] = interval;
    if (start > lastEndTime) {
      gaps.push([lastEndTime, start]);
    }
    lastEndTime = Math.max(lastEndTime, end);
  });

  // Если последний интервал не заканчивается в конце дня, добавьте интервал до конца дня
  if (lastEndTime < dayInSeconds) {
    gaps.push([lastEndTime, dayInSeconds + 1]);
  }
  return gaps;
}

function splitShifts(schedules) {
  const newSchedules = []
  schedules.forEach((el) => {
    const startDate = el.start_time.format('DD.MM.YYYY')
    const endDate = el.end_time.format('DD.MM.YYYY')
    if(startDate !== endDate) {
      newSchedules.push({
        ...el,
        end_time: el.start_time.endOf('day')
      })
      newSchedules.push({
        ...el,
        start_time: el.end_time.startOf('day')
      })
    } else {
      newSchedules.push({
        ...el,
      })
    }
  })
  return newSchedules.sort((a, b) => a.start_time - b.start_time)
}

function datesToObject(schedules) {
  return schedules.reduce((acc, cur) => {
    const date = cur.start_time.format('DD.MM.YYYY')
    if(acc[date]) {
      acc[date] = [...acc[date], cur]
    } else {
      acc[date] = [cur]
    }
    return acc
  }, {})
}

