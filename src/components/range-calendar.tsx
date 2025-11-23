"use client";

import {
  CalendarDay,
  DateRangeValue,
  WEEKDAY_LABELS,
  buildNextRangeValue,
  generateMonthSequence,
  isSameDay,
  isWithinRange,
  startOfMonth,
} from "@/lib/calendar";
import { cn } from "@/lib/cn";
import {
  ForwardedRef,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  KeyboardEvent,
  PointerEvent,
  UIEvent,
} from "react";

type Direction = "past" | "future";

export type RangeCalendarHandle = {
  scrollToAnchor: () => void;
};

type RangeCalendarProps = {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  locale?: string;
};

const POINTER_THRESHOLD = 8;
const SCROLL_BUFFER = 120;
const MONTH_STEP = 6;

export const RangeCalendar = forwardRef(function RangeCalendar(
  { value, onChange, locale = "ru-RU" }: RangeCalendarProps,
  ref: ForwardedRef<RangeCalendarHandle>,
) {
  const anchorMonth = useMemo(() => startOfMonth(new Date()), []);
  const [edges, setEdges] = useState({ start: -1, end: 11 });
  const months = useMemo(
    () => generateMonthSequence(anchorMonth, edges.start, edges.end, locale),
    [anchorMonth, edges, locale],
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const monthRefs = useRef(new Map<number, HTMLElement>());
  const pointerState = useRef<{
    id: number | null;
    startX: number;
    startY: number;
    moved: boolean;
    dayKey: string | null;
  }>({
    id: null,
    startX: 0,
    startY: 0,
    moved: false,
    dayKey: null,
  });
  const scrollCooldown = useRef({ past: 0, future: 0 });

  const resetPointer = () => {
    pointerState.current = {
      id: null,
      startX: 0,
      startY: 0,
      moved: false,
      dayKey: null,
    };
  };

  const extendWindow = useCallback((direction: Direction) => {
    setEdges((prev) =>
      direction === "past"
        ? { ...prev, start: prev.start - MONTH_STEP }
        : { ...prev, end: prev.end + MONTH_STEP },
    );
  }, []);

  const handleScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      const container = event.currentTarget;
      const now = performance.now();
      if (
        container.scrollTop < SCROLL_BUFFER &&
        now - scrollCooldown.current.past > 450
      ) {
        extendWindow("past");
        scrollCooldown.current.past = now;
      }

      const remaining =
        container.scrollHeight - container.clientHeight - container.scrollTop;
      if (
        remaining < SCROLL_BUFFER &&
        now - scrollCooldown.current.future > 450
      ) {
        extendWindow("future");
        scrollCooldown.current.future = now;
      }
    },
    [extendWindow],
  );

  const registerMonthRef = useCallback(
    (offset: number, node: HTMLElement | null) => {
      if (node) {
        monthRefs.current.set(offset, node);
      } else {
        monthRefs.current.delete(offset);
      }
    },
    [],
  );

  const handleSelectDay = useCallback(
    (day: Date) => {
      onChange(buildNextRangeValue(value, day));
    },
    [onChange, value],
  );

  useImperativeHandle(
    ref,
    () => ({
      scrollToAnchor: () => {
        const node = monthRefs.current.get(0);
        if (node) {
          node.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }

        scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      },
    }),
    [],
  );

  const getPointerHandlers = (day: CalendarDay) => {
    const dayKey = day.dateKey;

    return {
      onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        pointerState.current = {
          id: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          moved: false,
          dayKey,
        };
      },
      onPointerMove: (event: React.PointerEvent<HTMLButtonElement>) => {
        if (pointerState.current.id !== event.pointerId) {
          return;
        }
        const deltaX = Math.abs(event.clientX - pointerState.current.startX);
        const deltaY = Math.abs(event.clientY - pointerState.current.startY);
        if (deltaX > POINTER_THRESHOLD || deltaY > POINTER_THRESHOLD) {
          pointerState.current.moved = true;
        }
      },
      onPointerUp: (event: React.PointerEvent<HTMLButtonElement>) => {
        if (pointerState.current.id !== event.pointerId) {
          resetPointer();
          return;
        }

        if (!pointerState.current.moved && pointerState.current.dayKey === dayKey) {
          handleSelectDay(day.date);
        }
        event.currentTarget.releasePointerCapture(event.pointerId);
        resetPointer();
      },
      onPointerCancel: () => {
        resetPointer();
      },
      onPointerLeave: () => {
        pointerState.current.moved = true;
      },
    };
  };

  return (
    <div className="rounded-[32px] bg-white/60 p-4 shadow-xl shadow-black/5 ring-1 ring-black/5 backdrop-blur">
      <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500">
        <span>Свайпайте месяцы</span>
        <span className="text-emerald-600">Snap-to-month</span>
      </div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="range-scroll mt-4 h-[65vh] max-h-[calc(100dvh-220px)] overflow-y-auto scroll-smooth pr-1 snap-y snap-mandatory touch-pan-y"
        style={{ minHeight: "420px" }}
      >
        <div className="flex flex-col gap-6">
          {months.map((month) => (
            <article
              key={`${month.id}-${month.offset}`}
              ref={(node) => registerMonthRef(month.offset, node)}
              data-offset={month.offset}
              className="snap-start rounded-[28px] bg-white/90 p-4 shadow-inner shadow-black/5 ring-1 ring-slate-100"
            >
              <header className="flex items-baseline justify-between gap-2">
                <p className="text-lg font-semibold capitalize text-slate-900">
                  {month.label}
                </p>
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  {month.offset === 0
                    ? "текущий"
                    : month.offset > 0
                      ? `+${month.offset}`
                      : month.offset}
                </span>
              </header>
              <div className="mt-4 grid grid-cols-7 gap-y-1 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {WEEKDAY_LABELS.map((label) => (
                  <div key={`${month.id}-${label}`}>{label}</div>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-y-3">
                {month.weeks.flat().map((day) => (
                  <DayCell
                    key={`${month.id}-${day.dateKey}`}
                    day={day}
                    value={value}
                    onSelect={handleSelectDay}
                    pointerHandlers={getPointerHandlers(day)}
                  />
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
});

type DayCellProps = {
  day: CalendarDay;
  value: DateRangeValue;
  onSelect: (date: Date) => void;
  pointerHandlers: {
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
    onPointerMove: (event: PointerEvent<HTMLButtonElement>) => void;
    onPointerUp: (event: PointerEvent<HTMLButtonElement>) => void;
    onPointerCancel: () => void;
    onPointerLeave: () => void;
  };
};

const DayCell = ({ day, value, onSelect, pointerHandlers }: DayCellProps) => {
  const isStart = isSameDay(day.date, value.start);
  const isEnd = isSameDay(day.date, value.end);
  const hasRange =
    value.start &&
    value.end &&
    !isSameDay(value.start, value.end) &&
    (isStart || isEnd || isWithinRange(day.date, value.start, value.end));
  const isBetween =
    !!value.start &&
    !!value.end &&
    isWithinRange(day.date, value.start, value.end);
  const isDisabled = false;

  const buttonClasses = cn(
    "relative z-10 flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 touch-manipulation",
    day.isCurrentMonth ? "text-slate-900" : "text-slate-400",
    !day.isCurrentMonth && "opacity-40",
    day.isPast && !day.isToday && "text-slate-400/80",
    isStart || isEnd
      ? "scale-105 bg-emerald-500 text-white shadow-lg shadow-emerald-300/60"
      : "bg-white",
    isBetween && !isStart && !isEnd && "text-emerald-700",
  );

  const rangeClasses = cn(
    "absolute inset-x-0 top-1/2 -z-10 h-10 -translate-y-1/2 bg-emerald-100",
    hasRange ? "block" : "hidden",
    isStart && !isEnd && "rounded-l-3xl",
    isEnd && !isStart && "rounded-r-3xl",
    !isStart && !isEnd && "rounded-3xl",
    isStart && isEnd && "rounded-3xl",
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(day.date);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center gap-1">
      <span className={rangeClasses} aria-hidden />
      <button
        type="button"
        aria-pressed={isStart || isEnd}
        className={buttonClasses}
        disabled={isDisabled}
        onKeyDown={handleKeyDown}
        {...pointerHandlers}
      >
        {day.dayNumber}
      </button>
      {day.isToday ? (
        <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
          сегодня
        </span>
      ) : (
        <span className="text-[10px] text-transparent">.</span>
      )}
    </div>
  );
};
