import * as dayjs from 'dayjs';
import * as weekOfYear from 'dayjs/plugin/weekOfYear';
import * as isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(weekOfYear);
dayjs.extend(isBetween);

export type Ranges<T extends Date | number> = Array<[T, T]>;

export function hasDateRangeOverlaps(ranges: Ranges<Date>): boolean {
  const unixRanges: Ranges<number> = ranges.map(([start, end]) => [
    start.getTime(),
    end.getTime(),
  ]);

  for (const rangeIndex in unixRanges) {
    const [start, end] = unixRanges[rangeIndex];
    const leftUnixRanges = unixRanges
      .slice(0, parseInt(rangeIndex))
      .concat(unixRanges.slice(parseInt(rangeIndex) + 1));

    for (const [otherStart, otherEnd] of leftUnixRanges) {
      const maxStart = Math.max(start, otherStart);
      const minEnd = Math.min(end, otherEnd);

      if (minEnd - maxStart > 0) {
        return true;
      }
    }
  }

  return false;
}

export function hasMoreThanPerWeek(count: number, dates: Date[]): boolean {
  const weeksMap: Record<number, number> = {};

  for (const date of dates) {
    const week = dayjs(date).week();

    if (weeksMap[week]) {
      weeksMap[week]++;
    } else {
      weeksMap[week] = 1;
    }
  }

  return Object.values(weeksMap).some((value) => value > count);
}

export function hasSameDate(dates: Date[]): boolean {
  return dates.some((currentDate, currentIndex) => {
    const dateToCompare = dayjs(currentDate);

    return dates.some((checkDate, checkIndex) => {
      if (currentIndex === checkIndex) {
        return false;
      }

      return dateToCompare.isSame(dayjs(checkDate), 'day');
    });
  });
}

export function dateIncludeFromRanges(
  date: Date,
  ranges: Ranges<Date>,
): boolean {
  const dateToCompare = dayjs(date);

  return ranges.some(([start, end]) => {
    return dateToCompare.isBetween(dayjs(start), dayjs(end), 'day', '[]');
  });
}

export function calculateMealVoucher(month: number, removeDays: number) {
  const date = dayjs().month(month).startOf('month');

  let i = 0;

  for (let j = 0; j < date.daysInMonth() + 1; j++) {
    const day = date.add(j, 'day');

    if (day.day() === 0 || day.day() === 6) {
      continue;
    }

    i++;
  }

  return (i - removeDays) * 8;
}
