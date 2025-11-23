"use client";

import { RangeCalendar, RangeCalendarHandle } from "@/components/range-calendar";
import {
  DateRangeValue,
  countNights,
  getReadableDate,
  todayAtMidnight,
} from "@/lib/calendar";
import { useMemo, useRef, useState } from "react";

const insights = [
  {
    title: "Свайпы вместо попапов",
    description:
      "Нативный snap-скролл по месяцам заменяет модалки и не блокирует жесты прокрутки.",
  },
  {
    title: "Умный выбор",
    description:
      "Тап по дню запускает выбор диапазона, повторный тап сбрасывает, а перетаскивание не приводит к клику.",
  },
  {
    title: "Всегда под рукой",
    description:
      "Кнопка «Сегодня» мгновенно возвращает к актуальным датам и подсвечивает текущий день.",
  },
];

const defaultRange: DateRangeValue = {
  start: null,
  end: null,
};

export const MobileRangePicker = () => {
  const [range, setRange] = useState<DateRangeValue>(defaultRange);
  const calendarRef = useRef<RangeCalendarHandle>(null);
  const nights = countNights(range.start, range.end);

  const summaryLabel = useMemo(() => {
    if (nights === 0) {
      return "Выберите период";
    }
    if (nights === 1) {
      return "1 ночь";
    }
    return `${nights} ночей`;
  }, [nights]);

  const handleReset = () => setRange(defaultRange);

  const handleSetToday = () => {
    const today = todayAtMidnight();
    setRange({ start: today, end: null });
    calendarRef.current?.scrollToAnchor();
  };

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-[#0f172a] via-[#0b1c2f] to-[#091524] text-slate-50">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300/90">
            mobile-first challenge
          </p>
          <h1 className="text-4xl font-semibold leading-tight">
            Диапазон дат с ощущением{" "}
            <span className="text-emerald-300">native</span>
          </h1>
          <p className="text-base text-slate-200/80">
            Один экран, никаких попапов. Просто прокрутите, чтобы пролистать
            месяцы, и тапните даты — как будто листаете ленту.
          </p>
        </header>

        <section className="mt-6 rounded-[32px] bg-white/10 p-5 text-slate-900 shadow-[0_25px_80px_rgba(2,6,23,0.35)] backdrop-blur">
          <div className="grid grid-cols-2 gap-6 text-slate-50">
            <RangeColumn label="Старт" value={getReadableDate(range.start)} />
            <RangeColumn label="Финиш" value={getReadableDate(range.end)} />
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-medium text-slate-200">
            <span className="rounded-full bg-white/10 px-4 py-1 text-emerald-200">
              {summaryLabel}
            </span>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-wide text-slate-50 transition hover:border-white/50"
                onClick={handleSetToday}
              >
                Сегодня
              </button>
              <button
                type="button"
                className="rounded-full border border-transparent bg-white/15 px-4 py-2 text-xs uppercase tracking-wide text-white transition hover:bg-white/25"
                onClick={handleReset}
              >
                Сброс
              </button>
            </div>
          </div>
        </section>

        <ul className="mt-4 grid grid-cols-1 gap-3 text-slate-200/90 sm:grid-cols-2">
          {insights.map((item) => (
            <li
              key={item.title}
              className="rounded-3xl border border-white/10 p-4 text-sm leading-relaxed"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
                {item.title}
              </p>
              <p className="mt-1 text-slate-200/80">{item.description}</p>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex-1">
          <RangeCalendar value={range} onChange={setRange} ref={calendarRef} />
        </div>

        <footer className="mt-6 text-center text-xs text-slate-400">
          Scroll-tested на iOS/Android. Поддерживает бесконечный диапазон без
          пересоздания страницы.
        </footer>
      </div>
    </div>
  );
};

type RangeColumnProps = {
  label: string;
  value: string;
};

const RangeColumn = ({ label, value }: RangeColumnProps) => (
  <div className="rounded-2xl bg-white/10 p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
      {label}
    </p>
    <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
  </div>
);
