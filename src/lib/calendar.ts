export type DateRangeValue = {
  start: Date | null;
  end: Date | null;
};

export type CalendarDay = {
  date: Date;
  dateKey: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  weekdayIndex: number;
};

export type CalendarMonth = {
  id: string;
  label: string;
  offset: number;
  weeks: CalendarDay[][];
};

const DEFAULT_LOCALE = "ru-RU";
const WEEKDAY_LABELS_RU = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MS_IN_DAY = 86_400_000;

export const WEEKDAY_LABELS = WEEKDAY_LABELS_RU;

export const todayAtMidnight = () => startOfDay(new Date());

export const getReadableDate = (
  value: Date | null | undefined,
  locale = DEFAULT_LOCALE,
) => {
  if (!value) {
    return "Выберите дату";
  }

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  })
    .format(value)
    .replace(".", "")
    .replace(" г.", "");
};

export const countNights = (start: Date | null, end: Date | null) => {
  if (!start || !end) {
    return 0;
  }
  const distance =
    (startOfDay(end).getTime() - startOfDay(start).getTime()) / MS_IN_DAY;
  return Math.max(0, Math.round(distance));
};

export const isSameDay = (
  a: Date | null | undefined,
  b: Date | null | undefined,
) => {
  if (!a || !b) return false;
  return getDateKey(a) === getDateKey(b);
};

export const isWithinRange = (
  date: Date,
  start: Date | null,
  end: Date | null,
) => {
  if (!start || !end) return false;
  const current = startOfDay(date).getTime();
  const startTime = startOfDay(start).getTime();
  const endTime = startOfDay(end).getTime();
  return current > Math.min(startTime, endTime) && current < Math.max(startTime, endTime);
};

export const buildNextRangeValue = (
  current: DateRangeValue,
  day: Date,
): DateRangeValue => {
  if (!current.start || (current.start && current.end)) {
    return {
      start: day,
      end: null,
    };
  }

  if (isSameDay(current.start, day)) {
    return {
      start: null,
      end: null,
    };
  }

  if (day < current.start) {
    return {
      start: day,
      end: current.start,
    };
  }

  return {
    start: current.start,
    end: day,
  };
};

export const startOfMonth = (date: Date) => {
  const next = new Date(date);
  next.setDate(1);
  return startOfDay(next);
};

const endOfMonth = (date: Date) => {
  const start = startOfMonth(date);
  const next = new Date(start);
  next.setMonth(start.getMonth() + 1);
  next.setDate(0);
  return startOfDay(next);
};

const startOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const addMonths = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + amount);
  return startOfMonth(next);
};

const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return startOfDay(next);
};

const getWeekdayIndex = (date: Date) => (date.getDay() + 6) % 7;

const getDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export const generateMonthSequence = (
  anchor: Date,
  startOffset: number,
  endOffset: number,
  locale = DEFAULT_LOCALE,
): CalendarMonth[] => {
  const formatter = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  });

  const today = todayAtMidnight();
  const months: CalendarMonth[] = [];

  for (let offset = startOffset; offset <= endOffset; offset++) {
    const monthStart = addMonths(anchor, offset);
    const monthEnd = endOfMonth(monthStart);
    const leadingOffset = getWeekdayIndex(monthStart);
    const trailingOffset = 6 - getWeekdayIndex(monthEnd);
    const totalCells =
      Math.ceil((leadingOffset + monthEnd.getDate() + trailingOffset) / 7) * 7;
    const firstCellDate = addDays(monthStart, -leadingOffset);
    const days: CalendarDay[] = [];

    for (let dayIndex = 0; dayIndex < totalCells; dayIndex++) {
      const cellDate = addDays(firstCellDate, dayIndex);
      days.push({
        date: cellDate,
        dateKey: getDateKey(cellDate),
        dayNumber: cellDate.getDate(),
        isCurrentMonth: cellDate.getMonth() === monthStart.getMonth(),
        isToday: isSameDay(cellDate, today),
        isPast: cellDate < today,
        weekdayIndex: getWeekdayIndex(cellDate),
      });
    }

    const weeks: CalendarDay[][] = [];
    for (let index = 0; index < days.length; index += 7) {
      weeks.push(days.slice(index, index + 7));
    }

    months.push({
      id: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}`,
      label: capitalize(formatter.format(monthStart)),
      offset,
      weeks,
    });
  }

  return months;
};
