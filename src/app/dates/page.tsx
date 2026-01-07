"use client";

import Link from "next/link";
import { useState } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import DatePicker from "react-datepicker";
import {
  DatePicker as AriaDatePicker,
  DateRangePicker as AriaDateRangePicker,
  DateInput,
  DateSegment,
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Dialog,
  Group,
  Heading,
  Label,
  Popover,
  RangeCalendar,
  FieldError,
} from "react-aria-components";
import { today, getLocalTimeZone } from "@internationalized/date";
import type { DateValue } from "@internationalized/date";
import { addDays, subDays, format } from "date-fns";

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  library: "native" | "day-picker" | "datepicker" | "react-aria";
}

type TabType = "all" | "native" | "day-picker" | "datepicker" | "react-aria";

const libraryColors = {
  native: { bg: "bg-gray-50", border: "border-gray-400", badge: "bg-gray-200 text-gray-800" },
  "day-picker": { bg: "bg-blue-50", border: "border-blue-400", badge: "bg-blue-200 text-blue-800" },
  datepicker: { bg: "bg-green-50", border: "border-green-400", badge: "bg-green-200 text-green-800" },
  "react-aria": { bg: "bg-purple-50", border: "border-purple-400", badge: "bg-purple-200 text-purple-800" },
};

export default function DatesPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("all");

  // Native HTML states
  const [nativeDate, setNativeDate] = useState("");
  const [nativeDatetime, setNativeDatetime] = useState("");
  const [nativeTime, setNativeTime] = useState("");
  const [nativeMonth, setNativeMonth] = useState("");
  const [nativeWeek, setNativeWeek] = useState("");

  // react-day-picker states
  const [dayPickerSingle, setDayPickerSingle] = useState<Date | undefined>();
  const [dayPickerRange, setDayPickerRange] = useState<DateRange | undefined>();
  const [dayPickerMultiple, setDayPickerMultiple] = useState<Date[] | undefined>();
  const [dayPickerConstrained, setDayPickerConstrained] = useState<Date | undefined>();
  const [dayPickerNoWeekends, setDayPickerNoWeekends] = useState<Date | undefined>();
  const [dayPickerInline, setDayPickerInline] = useState<Date | undefined>();

  // react-datepicker states
  const [rdpSingle, setRdpSingle] = useState<Date | null>(null);
  const [rdpDateTime, setRdpDateTime] = useState<Date | null>(null);
  const [rdpTimeOnly, setRdpTimeOnly] = useState<Date | null>(null);
  const [rdpRangeSingle, setRdpRangeSingle] = useState<[Date | null, Date | null]>([null, null]);
  const [rdpRangeStart, setRdpRangeStart] = useState<Date | null>(null);
  const [rdpRangeEnd, setRdpRangeEnd] = useState<Date | null>(null);
  const [rdpMonthYear, setRdpMonthYear] = useState<Date | null>(null);
  const [rdpInline, setRdpInline] = useState<Date | null>(null);
  const [rdpPresets, setRdpPresets] = useState<Date | null>(null);

  // React Aria states
  const [ariaDate, setAriaDate] = useState<DateValue | null>(null);
  const [ariaRangeStart, setAriaRangeStart] = useState<DateValue | null>(null);
  const [ariaRangeEnd, setAriaRangeEnd] = useState<DateValue | null>(null);
  const [ariaValidation, setAriaValidation] = useState<DateValue | null>(null);
  const [ariaValidationError, setAriaValidationError] = useState(false);

  const addLog = (message: string, library: LogEntry["library"]) => {
    const newLog: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      message,
      library,
    };
    setLogs((prev) => [...prev, newLog]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "all", label: "All" },
    { id: "native", label: "Native HTML" },
    { id: "day-picker", label: "react-day-picker" },
    { id: "datepicker", label: "react-datepicker" },
    { id: "react-aria", label: "React Aria" },
  ];

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const minDate = subDays(new Date(), 7);
  const maxDate = addDays(new Date(), 30);

  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline">
            &larr; Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-4">Date Pickers Demo</h1>
        <p className="text-gray-600 mb-8">
          22 date picker variants across 4 libraries for e2e automation testing.
        </p>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 mb-8">
          <span className="text-sm text-gray-600">Filter:</span>
          <div className="flex gap-1 bg-gray-200 rounded-lg p-1 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  activeTab === tab.id
                    ? "bg-white text-gray-900 shadow"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-12">
          {/* Native HTML Section */}
          {(activeTab === "all" || activeTab === "native") && (
            <section className={`${libraryColors.native.bg} p-6 rounded-lg border-2 ${libraryColors.native.border}`}>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                Native HTML
                <span className={`text-xs px-2 py-0.5 rounded ${libraryColors.native.badge}`}>5 variants</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Single Date */}
                <div className="bg-white p-4 rounded border border-gray-300">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Single Date (with min/max)
                  </label>
                  <input
                    type="date"
                    value={nativeDate}
                    min={format(minDate, "yyyy-MM-dd")}
                    max={format(maxDate, "yyyy-MM-dd")}
                    onChange={(e) => {
                      setNativeDate(e.target.value);
                      addLog(`Native date selected: ${e.target.value}`, "native");
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                  {nativeDate && <p className="mt-2 text-sm text-gray-600">Selected: {nativeDate}</p>}
                </div>

                {/* Date + Time */}
                <div className="bg-white p-4 rounded border border-gray-300">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date + Time
                  </label>
                  <input
                    type="datetime-local"
                    value={nativeDatetime}
                    onChange={(e) => {
                      setNativeDatetime(e.target.value);
                      addLog(`Native datetime selected: ${e.target.value}`, "native");
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                  {nativeDatetime && <p className="mt-2 text-sm text-gray-600">Selected: {nativeDatetime}</p>}
                </div>

                {/* Time Only */}
                <div className="bg-white p-4 rounded border border-gray-300">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Only
                  </label>
                  <input
                    type="time"
                    value={nativeTime}
                    onChange={(e) => {
                      setNativeTime(e.target.value);
                      addLog(`Native time selected: ${e.target.value}`, "native");
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                  {nativeTime && <p className="mt-2 text-sm text-gray-600">Selected: {nativeTime}</p>}
                </div>

                {/* Month Picker */}
                <div className="bg-white p-4 rounded border border-gray-300">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Month Picker
                  </label>
                  <input
                    type="month"
                    value={nativeMonth}
                    onChange={(e) => {
                      setNativeMonth(e.target.value);
                      addLog(`Native month selected: ${e.target.value}`, "native");
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                  {nativeMonth && <p className="mt-2 text-sm text-gray-600">Selected: {nativeMonth}</p>}
                </div>

                {/* Week Picker */}
                <div className="bg-white p-4 rounded border border-gray-300">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Week Picker (Chrome only)
                  </label>
                  <input
                    type="week"
                    value={nativeWeek}
                    onChange={(e) => {
                      setNativeWeek(e.target.value);
                      addLog(`Native week selected: ${e.target.value}`, "native");
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                  {nativeWeek && <p className="mt-2 text-sm text-gray-600">Selected: {nativeWeek}</p>}
                </div>
              </div>
            </section>
          )}

          {/* react-day-picker Section */}
          {(activeTab === "all" || activeTab === "day-picker") && (
            <section className={`${libraryColors["day-picker"].bg} p-6 rounded-lg border-2 ${libraryColors["day-picker"].border}`}>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                react-day-picker v9
                <span className={`text-xs px-2 py-0.5 rounded ${libraryColors["day-picker"].badge}`}>6 variants</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Single Date */}
                <div className="bg-white p-4 rounded border border-blue-300">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Single Date
                  </label>
                  <DayPicker
                    mode="single"
                    selected={dayPickerSingle}
                    onSelect={(date) => {
                      setDayPickerSingle(date);
                      if (date) {
                        addLog(`DayPicker single: ${format(date, "yyyy-MM-dd")}`, "day-picker");
                      }
                    }}
                  />
                </div>

                {/* Date Range */}
                <div className="bg-white p-4 rounded border border-blue-300">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <DayPicker
                    mode="range"
                    selected={dayPickerRange}
                    onSelect={(range) => {
                      setDayPickerRange(range);
                      if (range?.from && range?.to) {
                        addLog(`DayPicker range: ${format(range.from, "yyyy-MM-dd")} to ${format(range.to, "yyyy-MM-dd")}`, "day-picker");
                      }
                    }}
                  />
                </div>

                {/* Multiple Dates */}
                <div className="bg-white p-4 rounded border border-blue-300">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Multiple Dates
                  </label>
                  <DayPicker
                    mode="multiple"
                    selected={dayPickerMultiple}
                    onSelect={(dates) => {
                      setDayPickerMultiple(dates);
                      if (dates && dates.length > 0) {
                        addLog(`DayPicker multiple: ${dates.length} dates selected`, "day-picker");
                      }
                    }}
                  />
                </div>

                {/* With Min/Max */}
                <div className="bg-white p-4 rounded border border-blue-300">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    With Min/Max (-7 to +30 days)
                  </label>
                  <DayPicker
                    mode="single"
                    selected={dayPickerConstrained}
                    disabled={{ before: minDate, after: maxDate }}
                    onSelect={(date) => {
                      setDayPickerConstrained(date);
                      if (date) {
                        addLog(`DayPicker constrained: ${format(date, "yyyy-MM-dd")}`, "day-picker");
                      }
                    }}
                  />
                </div>

                {/* Disabled Weekends */}
                <div className="bg-white p-4 rounded border border-blue-300">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disabled Weekends
                  </label>
                  <DayPicker
                    mode="single"
                    selected={dayPickerNoWeekends}
                    disabled={isWeekend}
                    onSelect={(date) => {
                      setDayPickerNoWeekends(date);
                      if (date) {
                        addLog(`DayPicker no weekends: ${format(date, "yyyy-MM-dd")}`, "day-picker");
                      }
                    }}
                  />
                </div>

                {/* Inline Calendar */}
                <div className="bg-white p-4 rounded border border-blue-300">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inline Calendar (always visible)
                  </label>
                  <DayPicker
                    mode="single"
                    selected={dayPickerInline}
                    onSelect={(date) => {
                      setDayPickerInline(date);
                      if (date) {
                        addLog(`DayPicker inline: ${format(date, "yyyy-MM-dd")}`, "day-picker");
                      }
                    }}
                  />
                  {dayPickerInline && (
                    <p className="mt-2 text-sm text-blue-600 font-medium">
                      Selected: {format(dayPickerInline, "MMMM d, yyyy")}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* react-datepicker Section */}
          {(activeTab === "all" || activeTab === "datepicker") && (
            <section className={`${libraryColors.datepicker.bg} p-6 rounded-lg border-2 ${libraryColors.datepicker.border}`}>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                react-datepicker
                <span className={`text-xs px-2 py-0.5 rounded ${libraryColors.datepicker.badge}`}>8 variants</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Single Date */}
                <div className="bg-white p-4 rounded border border-green-300">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Single Date
                  </label>
                  <DatePicker
                    selected={rdpSingle}
                    onChange={(date: Date | null) => {
                      setRdpSingle(date);
                      if (date) {
                        addLog(`react-datepicker single: ${format(date, "yyyy-MM-dd")}`, "datepicker");
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholderText="Select a date"
                  />
                </div>

                {/* Date + Time */}
                <div className="bg-white p-4 rounded border border-green-300">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date + Time (15-min intervals)
                  </label>
                  <DatePicker
                    selected={rdpDateTime}
                    onChange={(date: Date | null) => {
                      setRdpDateTime(date);
                      if (date) {
                        addLog(`react-datepicker datetime: ${format(date, "yyyy-MM-dd HH:mm")}`, "datepicker");
                      }
                    }}
                    showTimeSelect
                    timeIntervals={15}
                    dateFormat="Pp"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholderText="Select date and time"
                  />
                </div>

                {/* Time Only */}
                <div className="bg-white p-4 rounded border border-green-300">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Only
                  </label>
                  <DatePicker
                    selected={rdpTimeOnly}
                    onChange={(date: Date | null) => {
                      setRdpTimeOnly(date);
                      if (date) {
                        addLog(`react-datepicker time: ${format(date, "HH:mm")}`, "datepicker");
                      }
                    }}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    dateFormat="p"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholderText="Select time"
                  />
                </div>

                {/* Date Range (single input) */}
                <div className="bg-white p-4 rounded border border-green-300">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range (single input)
                  </label>
                  <DatePicker
                    selectsRange
                    startDate={rdpRangeSingle[0]}
                    endDate={rdpRangeSingle[1]}
                    onChange={(dates: [Date | null, Date | null]) => {
                      const [start, end] = dates;
                      setRdpRangeSingle([start, end]);
                      if (start && end) {
                        addLog(`react-datepicker range: ${format(start, "yyyy-MM-dd")} to ${format(end, "yyyy-MM-dd")}`, "datepicker");
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholderText="Select date range"
                  />
                </div>

                {/* Date Range (dual inputs) */}
                <div className="bg-white p-4 rounded border border-green-300">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range (dual inputs)
                  </label>
                  <div className="flex gap-2">
                    <DatePicker
                      selected={rdpRangeStart}
                      onChange={(date: Date | null) => {
                        setRdpRangeStart(date);
                        if (date) {
                          addLog(`react-datepicker start: ${format(date, "yyyy-MM-dd")}`, "datepicker");
                        }
                      }}
                      selectsStart
                      startDate={rdpRangeStart}
                      endDate={rdpRangeEnd}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholderText="Start"
                    />
                    <DatePicker
                      selected={rdpRangeEnd}
                      onChange={(date: Date | null) => {
                        setRdpRangeEnd(date);
                        if (date) {
                          addLog(`react-datepicker end: ${format(date, "yyyy-MM-dd")}`, "datepicker");
                        }
                      }}
                      selectsEnd
                      startDate={rdpRangeStart}
                      endDate={rdpRangeEnd}
                      minDate={rdpRangeStart ?? undefined}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholderText="End"
                    />
                  </div>
                </div>

                {/* Month/Year Picker */}
                <div className="bg-white p-4 rounded border border-green-300">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Month/Year Picker
                  </label>
                  <DatePicker
                    selected={rdpMonthYear}
                    onChange={(date: Date | null) => {
                      setRdpMonthYear(date);
                      if (date) {
                        addLog(`react-datepicker month: ${format(date, "yyyy-MM")}`, "datepicker");
                      }
                    }}
                    showMonthYearPicker
                    dateFormat="MMMM yyyy"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholderText="Select month"
                  />
                </div>

                {/* Inline */}
                <div className="bg-white p-4 rounded border border-green-300">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inline Calendar
                  </label>
                  <DatePicker
                    selected={rdpInline}
                    onChange={(date: Date | null) => {
                      setRdpInline(date);
                      if (date) {
                        addLog(`react-datepicker inline: ${format(date, "yyyy-MM-dd")}`, "datepicker");
                      }
                    }}
                    inline
                  />
                </div>

                {/* With Presets */}
                <div className="bg-white p-4 rounded border border-green-300">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    With Presets
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <button
                      onClick={() => {
                        const d = new Date();
                        setRdpPresets(d);
                        addLog(`react-datepicker preset: Today`, "datepicker");
                      }}
                      className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => {
                        const d = subDays(new Date(), 7);
                        setRdpPresets(d);
                        addLog(`react-datepicker preset: 7 days ago`, "datepicker");
                      }}
                      className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      7 days ago
                    </button>
                    <button
                      onClick={() => {
                        const d = addDays(new Date(), 7);
                        setRdpPresets(d);
                        addLog(`react-datepicker preset: In 7 days`, "datepicker");
                      }}
                      className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      In 7 days
                    </button>
                  </div>
                  <DatePicker
                    selected={rdpPresets}
                    onChange={(date: Date | null) => {
                      setRdpPresets(date);
                      if (date) {
                        addLog(`react-datepicker presets: ${format(date, "yyyy-MM-dd")}`, "datepicker");
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholderText="Select or use preset"
                  />
                </div>
              </div>
            </section>
          )}

          {/* React Aria Section */}
          {(activeTab === "all" || activeTab === "react-aria") && (
            <section className={`${libraryColors["react-aria"].bg} p-6 rounded-lg border-2 ${libraryColors["react-aria"].border}`}>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                React Aria
                <span className={`text-xs px-2 py-0.5 rounded ${libraryColors["react-aria"].badge}`}>3 variants</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* DatePicker */}
                <div className="bg-white p-4 rounded border border-purple-300">
                  <AriaDatePicker
                    value={ariaDate}
                    onChange={(date) => {
                      setAriaDate(date);
                      if (date) {
                        addLog(`React Aria date: ${date.toString()}`, "react-aria");
                      }
                    }}
                    className="flex flex-col gap-1"
                  >
                    <Label className="text-sm font-medium text-gray-700">
                      DatePicker (Accessible)
                    </Label>
                    <Group className="flex rounded-lg border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-purple-500">
                      <DateInput className="flex flex-1 py-2 pl-3">
                        {(segment) => (
                          <DateSegment
                            segment={segment}
                            className="px-0.5 tabular-nums outline-none rounded focus:bg-purple-100 data-[placeholder]:text-gray-400"
                          />
                        )}
                      </DateInput>
                      <Button className="px-3 rounded-r-lg border-l border-gray-300 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <span aria-hidden="true">&#128197;</span>
                      </Button>
                    </Group>
                    <Popover>
                      <Dialog className="p-4 bg-white rounded-lg shadow-lg border">
                        <Calendar>
                          <header className="flex items-center justify-between mb-4">
                            <Button slot="previous" className="p-1 rounded hover:bg-gray-100">&lt;</Button>
                            <Heading className="font-semibold" />
                            <Button slot="next" className="p-1 rounded hover:bg-gray-100">&gt;</Button>
                          </header>
                          <CalendarGrid>
                            <CalendarGridHeader>
                              {(day) => <CalendarHeaderCell className="text-xs text-gray-500 font-medium p-2">{day}</CalendarHeaderCell>}
                            </CalendarGridHeader>
                            <CalendarGridBody>
                              {(date) => (
                                <CalendarCell
                                  date={date}
                                  className="p-2 text-center rounded hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 data-[selected]:bg-purple-600 data-[selected]:text-white data-[disabled]:text-gray-300"
                                />
                              )}
                            </CalendarGridBody>
                          </CalendarGrid>
                        </Calendar>
                      </Dialog>
                    </Popover>
                  </AriaDatePicker>
                </div>

                {/* DateRangePicker */}
                <div className="bg-white p-4 rounded border border-purple-300">
                  <AriaDateRangePicker
                    value={ariaRangeStart && ariaRangeEnd ? { start: ariaRangeStart, end: ariaRangeEnd } : null}
                    onChange={(range) => {
                      if (range) {
                        setAriaRangeStart(range.start);
                        setAriaRangeEnd(range.end);
                        addLog(`React Aria range: ${range.start.toString()} to ${range.end.toString()}`, "react-aria");
                      }
                    }}
                    className="flex flex-col gap-1"
                  >
                    <Label className="text-sm font-medium text-gray-700">
                      DateRangePicker (Accessible)
                    </Label>
                    <Group className="flex rounded-lg border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-purple-500">
                      <DateInput slot="start" className="flex py-2 pl-3">
                        {(segment) => (
                          <DateSegment
                            segment={segment}
                            className="px-0.5 tabular-nums outline-none rounded focus:bg-purple-100 data-[placeholder]:text-gray-400"
                          />
                        )}
                      </DateInput>
                      <span className="px-2 py-2 text-gray-400">-</span>
                      <DateInput slot="end" className="flex py-2">
                        {(segment) => (
                          <DateSegment
                            segment={segment}
                            className="px-0.5 tabular-nums outline-none rounded focus:bg-purple-100 data-[placeholder]:text-gray-400"
                          />
                        )}
                      </DateInput>
                      <Button className="px-3 rounded-r-lg border-l border-gray-300 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <span aria-hidden="true">&#128197;</span>
                      </Button>
                    </Group>
                    <Popover>
                      <Dialog className="p-4 bg-white rounded-lg shadow-lg border">
                        <RangeCalendar>
                          <header className="flex items-center justify-between mb-4">
                            <Button slot="previous" className="p-1 rounded hover:bg-gray-100">&lt;</Button>
                            <Heading className="font-semibold" />
                            <Button slot="next" className="p-1 rounded hover:bg-gray-100">&gt;</Button>
                          </header>
                          <CalendarGrid>
                            <CalendarGridHeader>
                              {(day) => <CalendarHeaderCell className="text-xs text-gray-500 font-medium p-2">{day}</CalendarHeaderCell>}
                            </CalendarGridHeader>
                            <CalendarGridBody>
                              {(date) => (
                                <CalendarCell
                                  date={date}
                                  className="p-2 text-center rounded hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 data-[selected]:bg-purple-600 data-[selected]:text-white data-[disabled]:text-gray-300"
                                />
                              )}
                            </CalendarGridBody>
                          </CalendarGrid>
                        </RangeCalendar>
                      </Dialog>
                    </Popover>
                  </AriaDateRangePicker>
                </div>

                {/* With Validation */}
                <div className="bg-white p-4 rounded border border-purple-300">
                  <AriaDatePicker
                    value={ariaValidation}
                    isInvalid={ariaValidationError}
                    onChange={(date) => {
                      setAriaValidation(date);
                      if (date) {
                        const todayDate = today(getLocalTimeZone());
                        const isInPast = date.compare(todayDate) < 0;
                        setAriaValidationError(isInPast);
                        addLog(`React Aria validation: ${date.toString()} ${isInPast ? "(invalid - in past)" : "(valid)"}`, "react-aria");
                      }
                    }}
                    className="flex flex-col gap-1"
                  >
                    <Label className="text-sm font-medium text-gray-700">
                      With Validation (no past dates)
                    </Label>
                    <Group className={`flex rounded-lg border bg-white focus-within:ring-2 ${ariaValidationError ? "border-red-500 focus-within:ring-red-500" : "border-gray-300 focus-within:ring-purple-500"}`}>
                      <DateInput className="flex flex-1 py-2 pl-3">
                        {(segment) => (
                          <DateSegment
                            segment={segment}
                            className="px-0.5 tabular-nums outline-none rounded focus:bg-purple-100 data-[placeholder]:text-gray-400"
                          />
                        )}
                      </DateInput>
                      <Button className="px-3 rounded-r-lg border-l border-gray-300 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <span aria-hidden="true">&#128197;</span>
                      </Button>
                    </Group>
                    <Popover>
                      <Dialog className="p-4 bg-white rounded-lg shadow-lg border">
                        <Calendar minValue={today(getLocalTimeZone())}>
                          <header className="flex items-center justify-between mb-4">
                            <Button slot="previous" className="p-1 rounded hover:bg-gray-100">&lt;</Button>
                            <Heading className="font-semibold" />
                            <Button slot="next" className="p-1 rounded hover:bg-gray-100">&gt;</Button>
                          </header>
                          <CalendarGrid>
                            <CalendarGridHeader>
                              {(day) => <CalendarHeaderCell className="text-xs text-gray-500 font-medium p-2">{day}</CalendarHeaderCell>}
                            </CalendarGridHeader>
                            <CalendarGridBody>
                              {(date) => (
                                <CalendarCell
                                  date={date}
                                  className="p-2 text-center rounded hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 data-[selected]:bg-purple-600 data-[selected]:text-white data-[disabled]:text-gray-300"
                                />
                              )}
                            </CalendarGridBody>
                          </CalendarGrid>
                        </Calendar>
                      </Dialog>
                    </Popover>
                    {ariaValidationError && (
                      <FieldError className="text-sm text-red-600">
                        Please select a date in the future
                      </FieldError>
                    )}
                  </AriaDatePicker>
                </div>
              </div>
            </section>
          )}

          {/* Activity Log */}
          <section className="bg-gray-50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Activity Log</h2>
              {logs.length > 0 && (
                <button
                  onClick={clearLogs}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Clear Logs
                </button>
              )}
            </div>

            {logs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No interactions yet. Select dates using any picker to log events.
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {[...logs].reverse().map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded border-l-4 ${libraryColors[log.library].bg} ${
                      log.library === "native"
                        ? "border-gray-500"
                        : log.library === "day-picker"
                        ? "border-blue-500"
                        : log.library === "datepicker"
                        ? "border-green-500"
                        : "border-purple-500"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <span className="text-sm text-gray-500 font-mono">
                          [{log.timestamp}]
                        </span>
                        <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded ${libraryColors[log.library].badge}`}>
                          {log.library.toUpperCase()}
                        </span>
                        <p className="mt-1 text-gray-900">{log.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
