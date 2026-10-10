import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { ReportRange, getDoseStats } from '../../utils/doseStats';
import {
  formatKolkataDate,
  formatKolkataDateTime,
  formatKolkataTime,
  getKolkataDateString,
} from '../../utils/timezone';
import {
  Calendar,
  Clock,
  RotateCcw,
  Table as TableIcon,
  PieChart,
  TrendingUp,
  BarChart3,
  Layers,
  History,
  FileText,
  Info,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { MedicineTitle } from '../common/MedicineTitle';

export const HistoryReportScreen: React.FC = () => {
  const { data, lastUpdated, t } = useStore();

  const [selectedRange, setSelectedRange] = useState<ReportRange>('7days');
  const [showTable1, setShowTable1] = useState(false);
  const [showTable2, setShowTable2] = useState(false);
  const [showTable3, setShowTable3] = useState(false);
  const [showTable4, setShowTable4] = useState(false);
  const [showTable5, setShowTable5] = useState(false);

  // Tooltip interactive state
  const [activeTooltip, setActiveTooltip] = useState<{
    id: string;
    text: string;
    x: number;
    y: number;
  } | null>(null);

  const nowMs = Date.now();
  const todayStr = getKolkataDateString();

  // SINGLE SOURCE OF TRUTH SELECTOR: getDoseStats derived with useMemo
  const stats = useMemo(() => {
    return getDoseStats(data.dose_occurrences, selectedRange, data.medications, nowMs);
  }, [data.dose_occurrences, selectedRange, data.medications, nowMs]);

  // Recent activity list
  const recentActivities = useMemo(() => {
    return data.activity_log.slice(0, 10);
  }, [data.activity_log]);

  // Format last updated friendly
  const formattedLastUpdated = useMemo(() => {
    return formatKolkataTime(lastUpdated);
  }, [lastUpdated]);

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-8">
      {/* Screen Title & Last Updated */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 border-b border-[#D5DCD5] pb-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1F2B25] tracking-tight">
            {t.historyTitle}
          </h1>
          <p className="text-sm text-[#53645A] mt-1">
            {t.historySubtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#53645A] bg-[#F0F3ED] px-3 py-1.5 rounded-full border border-[#D5DCD5]">
          <Clock className="w-3.5 h-3.5 text-[#214F3A]" />
          <span>Last updated: {formattedLastUpdated}</span>
        </div>
      </div>

      {/* Range Selector Controls */}
      <div className="bg-white border border-[#D5DCD5] rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <span className="text-sm font-semibold text-[#1F2B25] flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#214F3A]" />
          <span>Reporting Period:</span>
        </span>

        <div className="flex items-center gap-2 bg-[#F0F3ED] p-1 rounded-lg border border-[#D5DCD5]">
          <button
            type="button"
            onClick={() => setSelectedRange('today')}
            className={`min-h-[40px] px-4 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A] ${
              selectedRange === 'today'
                ? 'bg-[#214F3A] text-white shadow-xs'
                : 'text-[#53645A] hover:text-[#1F2B25]'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setSelectedRange('7days')}
            className={`min-h-[40px] px-4 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A] ${
              selectedRange === '7days'
                ? 'bg-[#214F3A] text-white shadow-xs'
                : 'text-[#53645A] hover:text-[#1F2B25]'
            }`}
          >
            Last 7 days
          </button>
          <button
            type="button"
            onClick={() => setSelectedRange('30days')}
            className={`min-h-[40px] px-4 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A] ${
              selectedRange === '30days'
                ? 'bg-[#214F3A] text-white shadow-xs'
                : 'text-[#53645A] hover:text-[#1F2B25]'
            }`}
          >
            Last 30 days
          </button>
        </div>
      </div>

      {/* High-level KPI Summary */}
      <div className="bg-white border border-[#D5DCD5] rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D5DCD5] pb-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-[#53645A]">
              Confirmed Intake Percentage
            </span>
            <h2 className="text-2xl font-serif font-bold text-[#1F2B25] mt-0.5">
              {stats.rate === '—' ? '—' : `${stats.rate}%`}
            </h2>
            <p className="text-xs text-[#53645A] mt-1">
              Confirmed taken: {stats.taken} of {stats.totalCounted} completed doses
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2.5 bg-[#EAF3ED] border border-[#B8D7C2] rounded-lg">
              <span className="text-xs font-semibold text-[#266044] block">Taken</span>
              <span className="font-mono font-bold text-lg text-[#266044] tabular-nums">
                {stats.taken}
              </span>
            </div>
            <div className="p-2.5 bg-[#FBECEA] border border-[#F2BDB9] rounded-lg">
              <span className="text-xs font-semibold text-[#A3342A] block">Not taken</span>
              <span className="font-mono font-bold text-lg text-[#A3342A] tabular-nums">
                {stats.missed}
              </span>
            </div>
            <div className="p-2.5 bg-[#FBF2D9] border border-[#E6D4A5] rounded-lg">
              <span className="text-xs font-semibold text-[#805A13] block">Unconfirmed</span>
              <span className="font-mono font-bold text-lg text-[#805A13] tabular-nums">
                {stats.unconfirmed}
              </span>
            </div>
          </div>
        </div>

        {stats.pendingNotCounted > 0 && (
          <div className="text-xs text-[#875E16] bg-[#FBF2D9]/60 px-3 py-2 rounded border border-[#E6D4A5] flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>
              {stats.pendingNotCounted} upcoming or due doses today are pending (not counted in adherence rate until time has passed).
            </span>
          </div>
        )}

        <div className="p-3 bg-[#F0F3ED] border border-[#D5DCD5] rounded-lg flex items-center gap-2 text-xs text-[#1F2B25] font-medium">
          <FileText className="w-4 h-4 text-[#214F3A] shrink-0" />
          <span>{t.followUpDoctorAdvice}</span>
        </div>
      </div>

      {/* SVG Pattern Definitions for accessible charts */}
      <svg className="hidden" aria-hidden="true">
        <defs>
          <pattern id="pat-taken" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#1d4834" strokeWidth="1.5" />
          </pattern>
          <pattern id="pat-missed" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#87231a" strokeWidth="2" />
          </pattern>
          <pattern id="pat-unconfirmed" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.5" fill="#6d4b0d" />
          </pattern>
        </defs>
      </svg>

      {/* CHART SECTION */}
      <div className="space-y-8">
        {/* CHART 1: Stacked Bar per Day */}
        <div className="bg-white border border-[#D5DCD5] rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D5DCD5] pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#214F3A]" />
              <h3 className="font-serif font-bold text-lg text-[#1F2B25]">
                1. Daily Dose Outcomes (Stacked Bar)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowTable1(!showTable1)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#214F3A] hover:bg-[#F0F3ED] px-3 py-1.5 rounded border border-[#718278] self-start sm:self-auto min-h-[36px]"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>{showTable1 ? 'Hide table' : 'View as table'}</span>
            </button>
          </div>

          {!stats.hasData ? (
            <div className="p-8 text-center text-[#53645A] text-sm italic">
              No recorded doses in this range yet.
            </div>
          ) : (
            <div className="space-y-3">
              {/* SVG Stacked Bar */}
              <div className="w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${Math.max(480, stats.days.length * 48)} 220`}
                  className="w-full h-auto min-w-[320px] max-h-64"
                  role="img"
                  aria-label="Daily Stacked Bar Chart"
                >
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="100%" y2="20" stroke="#E5EAE2" strokeDasharray="3 3" />
                  <line x1="40" y1="80" x2="100%" y2="80" stroke="#E5EAE2" strokeDasharray="3 3" />
                  <line x1="40" y1="140" x2="100%" y2="140" stroke="#E5EAE2" strokeDasharray="3 3" />
                  <line x1="40" y1="180" x2="100%" y2="180" stroke="#D5DCD5" strokeWidth="1.5" />

                  {/* Bars */}
                  {(() => {
                    const maxCount = Math.max(
                      1,
                      ...stats.days.map((d) => d.taken + d.missed + d.unconfirmed)
                    );
                    const chartHeight = 150;
                    const svgWidth = Math.max(480, stats.days.length * 48);
                    const slotWidth = (svgWidth - 60) / stats.days.length;
                    const barWidth = Math.min(28, slotWidth * 0.65);

                    return stats.days.map((day, idx) => {
                      const total = day.taken + day.missed + day.unconfirmed;
                      const xCenter = 50 + idx * slotWidth + slotWidth / 2;
                      const xBar = xCenter - barWidth / 2;

                      const takenH = total > 0 ? (day.taken / maxCount) * chartHeight : 0;
                      const missedH = total > 0 ? (day.missed / maxCount) * chartHeight : 0;
                      const unconfH = total > 0 ? (day.unconfirmed / maxCount) * chartHeight : 0;

                      const takenY = 180 - takenH;
                      const missedY = takenY - missedH;
                      const unconfY = missedY - unconfH;

                      // Display short date
                      const label = day.isToday
                        ? 'Today'
                        : day.dateStr.slice(5).replace('-', '/');

                      return (
                        <g
                          key={day.dateStr}
                          tabIndex={0}
                          role="graphics-symbol"
                          aria-label={`${label}: Taken ${day.taken}, Not taken ${day.missed}, Unconfirmed ${day.unconfirmed}`}
                          className="focus:outline-hidden group cursor-pointer"
                        >
                          {/* Taken Segment */}
                          {takenH > 0 && (
                            <rect
                              x={xBar}
                              y={takenY}
                              width={barWidth}
                              height={takenH}
                              fill="#266044"
                              rx="2"
                              className="hover:opacity-90 transition-opacity"
                            />
                          )}
                          {/* Missed Segment */}
                          {missedH > 0 && (
                            <rect
                              x={xBar}
                              y={missedY}
                              width={barWidth}
                              height={missedH}
                              fill="#A3342A"
                              rx="2"
                              className="hover:opacity-90 transition-opacity"
                            />
                          )}
                          {/* Unconfirmed Segment */}
                          {unconfH > 0 && (
                            <rect
                              x={xBar}
                              y={unconfY}
                              width={barWidth}
                              height={unconfH}
                              fill="#805A13"
                              rx="2"
                              className="hover:opacity-90 transition-opacity"
                            />
                          )}

                          {/* Empty / Zero state bar placeholder */}
                          {total === 0 && (
                            <rect
                              x={xBar}
                              y={176}
                              width={barWidth}
                              height={4}
                              fill="#D5DCD5"
                              rx="1"
                            />
                          )}

                          {/* X label */}
                          <text
                            x={xCenter}
                            y="200"
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight={day.isToday ? 'bold' : 'normal'}
                            fill={day.isToday ? '#214F3A' : '#53645A'}
                          >
                            {label}
                          </text>

                          {/* Count on top */}
                          {total > 0 && (
                            <text
                              x={xCenter}
                              y={unconfY - 5}
                              textAnchor="middle"
                              fontSize="9"
                              fontWeight="bold"
                              fill="#1F2B25"
                            >
                              {day.taken}/{total}
                            </text>
                          )}
                        </g>
                      );
                    });
                  })()}
                </svg>
              </div>

              {/* Legend with textures/colors */}
              <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#266044]" />
                  <span className="font-semibold text-[#1F2B25]">Taken</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#A3342A]" />
                  <span className="font-semibold text-[#1F2B25]">Not taken</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#805A13]" />
                  <span className="font-semibold text-[#1F2B25]">Unconfirmed</span>
                </span>
              </div>
            </div>
          )}

          {/* Table Toggle View */}
          {showTable1 && (
            <div className="mt-4 border border-[#D5DCD5] rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAF7] border-b border-[#D5DCD5] font-bold text-[#53645A]">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-center">Taken</th>
                    <th className="py-2.5 px-3 text-center">Not taken</th>
                    <th className="py-2.5 px-3 text-center">Unconfirmed</th>
                    <th className="py-2.5 px-3 text-right">Total Counted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5DCD5]">
                  {stats.days.map((d) => (
                    <tr key={d.dateStr} className="hover:bg-[#F0F3ED]/40">
                      <td className="py-2 px-3 font-semibold text-[#1F2B25]">
                        {formatKolkataDate(d.dateStr)} {d.isToday ? '(Today)' : ''}
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-[#266044]">{d.taken}</td>
                      <td className="py-2 px-3 text-center font-bold text-[#A3342A]">{d.missed}</td>
                      <td className="py-2 px-3 text-center font-bold text-[#805A13]">{d.unconfirmed}</td>
                      <td className="py-2 px-3 text-right font-bold">{d.totalCounted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CHART 2: Line Chart of Confirmed Taken % per Day */}
        <div className="bg-white border border-[#D5DCD5] rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D5DCD5] pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#214F3A]" />
              <h3 className="font-serif font-bold text-lg text-[#1F2B25]">
                2. Confirmed Taken Trend (% per Day)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowTable2(!showTable2)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#214F3A] hover:bg-[#F0F3ED] px-3 py-1.5 rounded border border-[#718278] self-start sm:self-auto min-h-[36px]"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>{showTable2 ? 'Hide table' : 'View as table'}</span>
            </button>
          </div>

          {!stats.hasData ? (
            <div className="p-8 text-center text-[#53645A] text-sm italic">
              No recorded doses in this range yet.
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${Math.max(480, stats.days.length * 48)} 220`}
                className="w-full h-auto min-w-[320px] max-h-64"
                role="img"
                aria-label="Confirmed Taken Percentage Line Chart"
              >
                {/* Horizontal reference lines: 100%, 75%, 50%, 25%, 0% */}
                <line x1="40" y1="30" x2="100%" y2="30" stroke="#E5EAE2" strokeDasharray="3 3" />
                <text x="32" y="34" textAnchor="end" fontSize="9" fill="#53645A">100%</text>

                <line x1="40" y1="67.5" x2="100%" y2="67.5" stroke="#E5EAE2" strokeDasharray="3 3" />
                <text x="32" y="71" textAnchor="end" fontSize="9" fill="#53645A">75%</text>

                <line x1="40" y1="105" x2="100%" y2="105" stroke="#E5EAE2" strokeDasharray="3 3" />
                <text x="32" y="108" textAnchor="end" fontSize="9" fill="#53645A">50%</text>

                <line x1="40" y1="142.5" x2="100%" y2="142.5" stroke="#E5EAE2" strokeDasharray="3 3" />
                <text x="32" y="146" textAnchor="end" fontSize="9" fill="#53645A">25%</text>

                <line x1="40" y1="180" x2="100%" y2="180" stroke="#D5DCD5" strokeWidth="1.5" />
                <text x="32" y="184" textAnchor="end" fontSize="9" fill="#53645A">0%</text>

                {(() => {
                  const svgWidth = Math.max(480, stats.days.length * 48);
                  const slotWidth = (svgWidth - 60) / stats.days.length;

                  const points = stats.days
                    .map((day, idx) => {
                      if (day.totalCounted === 0) return null;
                      const x = 50 + idx * slotWidth + slotWidth / 2;
                      // 0% -> y=180, 100% -> y=30. Range is 150 px.
                      const y = 180 - (day.rawRate / 100) * 150;
                      return { x, y, day };
                    })
                    .filter((p): p is { x: number; y: number; day: (typeof stats.days)[0] } => p !== null);

                  const pathStr = points.reduce((acc, p, i) => {
                    return `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
                  }, '');

                  return (
                    <>
                      {/* Connecting line */}
                      {points.length > 1 && (
                        <path d={pathStr} fill="none" stroke="#266044" strokeWidth="2.5" />
                      )}

                      {/* Circles for each active point */}
                      {points.map((p) => (
                        <g
                          key={p.day.dateStr}
                          tabIndex={0}
                          role="graphics-symbol"
                          aria-label={`${p.day.dateStr}: ${p.day.rate}%`}
                          className="focus:outline-hidden cursor-pointer"
                        >
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="5"
                            fill="#FFFFFF"
                            stroke="#266044"
                            strokeWidth="2.5"
                          />
                          <text
                            x={p.x}
                            y={p.y - 8}
                            textAnchor="middle"
                            fontSize="9"
                            fontWeight="bold"
                            fill="#214F3A"
                          >
                            {p.day.rate}%
                          </text>
                        </g>
                      ))}

                      {/* X labels */}
                      {stats.days.map((day, idx) => {
                        const x = 50 + idx * slotWidth + slotWidth / 2;
                        const label = day.isToday ? 'Today' : day.dateStr.slice(5).replace('-', '/');
                        return (
                          <text
                            key={day.dateStr}
                            x={x}
                            y="200"
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight={day.isToday ? 'bold' : 'normal'}
                            fill={day.isToday ? '#214F3A' : '#53645A'}
                          >
                            {label}
                          </text>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>
          )}

          {showTable2 && (
            <div className="mt-4 border border-[#D5DCD5] rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAF7] border-b border-[#D5DCD5] font-bold text-[#53645A]">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Confirmed Taken %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5DCD5]">
                  {stats.days.map((d) => (
                    <tr key={d.dateStr} className="hover:bg-[#F0F3ED]/40">
                      <td className="py-2 px-3 font-semibold text-[#1F2B25]">
                        {formatKolkataDate(d.dateStr)} {d.isToday ? '(Today)' : ''}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-[#214F3A]">
                        {d.rate === '—' ? '—' : `${d.rate}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CHART 3: Donut Chart (Outcome Split with Percentage in Centre) */}
        <div className="bg-white border border-[#D5DCD5] rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D5DCD5] pb-3">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#214F3A]" />
              <h3 className="font-serif font-bold text-lg text-[#1F2B25]">
                3. Overall Outcome Split (Donut Chart)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowTable3(!showTable3)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#214F3A] hover:bg-[#F0F3ED] px-3 py-1.5 rounded border border-[#718278] self-start sm:self-auto min-h-[36px]"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>{showTable3 ? 'Hide table' : 'View as table'}</span>
            </button>
          </div>

          {!stats.hasData ? (
            <div className="p-8 text-center text-[#53645A] text-sm italic">
              No recorded doses in this range yet.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
              {/* SVG Donut */}
              <div className="w-56 h-56 shrink-0 relative">
                <svg
                  viewBox="0 0 200 200"
                  className="w-full h-full transform -rotate-90"
                  role="img"
                  aria-label="Outcome Distribution Donut"
                >
                  {(() => {
                    const radius = 70;
                    const circumference = 2 * Math.PI * radius; // ~439.8
                    const total = stats.totalCounted;

                    const takenLen = (stats.taken / total) * circumference;
                    const missedLen = (stats.missed / total) * circumference;
                    const unconfLen = (stats.unconfirmed / total) * circumference;

                    const takenOffset = 0;
                    const missedOffset = -takenLen;
                    const unconfOffset = -(takenLen + missedLen);

                    return (
                      <>
                        {/* Background track */}
                        <circle
                          cx="100"
                          cy="100"
                          r={radius}
                          fill="transparent"
                          stroke="#F0F3ED"
                          strokeWidth="28"
                        />

                        {/* Taken stroke */}
                        {takenLen > 0 && (
                          <circle
                            cx="100"
                            cy="100"
                            r={radius}
                            fill="transparent"
                            stroke="#266044"
                            strokeWidth="28"
                            strokeDasharray={`${takenLen} ${circumference - takenLen}`}
                            strokeDashoffset={takenOffset}
                          />
                        )}

                        {/* Missed stroke */}
                        {missedLen > 0 && (
                          <circle
                            cx="100"
                            cy="100"
                            r={radius}
                            fill="transparent"
                            stroke="#A3342A"
                            strokeWidth="28"
                            strokeDasharray={`${missedLen} ${circumference - missedLen}`}
                            strokeDashoffset={missedOffset}
                          />
                        )}

                        {/* Unconfirmed stroke */}
                        {unconfLen > 0 && (
                          <circle
                            cx="100"
                            cy="100"
                            r={radius}
                            fill="transparent"
                            stroke="#805A13"
                            strokeWidth="28"
                            strokeDasharray={`${unconfLen} ${circumference - unconfLen}`}
                            strokeDashoffset={unconfOffset}
                          />
                        )}
                      </>
                    );
                  })()}
                </svg>

                {/* Center text: Percentage in centre */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-2xl font-serif font-bold text-[#214F3A] tabular-nums">
                    {stats.rate}%
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[#53645A]">
                    Confirmed
                  </span>
                </div>
              </div>

              {/* Legend with percentages */}
              <div className="space-y-3 text-xs w-full max-w-xs">
                <div className="flex items-center justify-between p-2 rounded bg-[#EAF3ED] border border-[#B8D7C2]">
                  <span className="flex items-center gap-2 font-semibold text-[#266044]">
                    <span className="w-3 h-3 rounded-full bg-[#266044]" />
                    <span>Taken</span>
                  </span>
                  <span className="font-mono font-bold text-[#266044]">
                    {stats.taken} (
                    {stats.totalCounted > 0
                      ? ((stats.taken / stats.totalCounted) * 100).toFixed(1)
                      : 0}
                    %)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-[#FBECEA] border border-[#F2BDB9]">
                  <span className="flex items-center gap-2 font-semibold text-[#A3342A]">
                    <span className="w-3 h-3 rounded-full bg-[#A3342A]" />
                    <span>Not taken</span>
                  </span>
                  <span className="font-mono font-bold text-[#A3342A]">
                    {stats.missed} (
                    {stats.totalCounted > 0
                      ? ((stats.missed / stats.totalCounted) * 100).toFixed(1)
                      : 0}
                    %)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-[#FBF2D9] border border-[#E6D4A5]">
                  <span className="flex items-center gap-2 font-semibold text-[#805A13]">
                    <span className="w-3 h-3 rounded-full bg-[#805A13]" />
                    <span>Unconfirmed</span>
                  </span>
                  <span className="font-mono font-bold text-[#805A13]">
                    {stats.unconfirmed} (
                    {stats.totalCounted > 0
                      ? ((stats.unconfirmed / stats.totalCounted) * 100).toFixed(1)
                      : 0}
                    %)
                  </span>
                </div>
              </div>
            </div>
          )}

          {showTable3 && (
            <div className="mt-4 border border-[#D5DCD5] rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAF7] border-b border-[#D5DCD5] font-bold text-[#53645A]">
                  <tr>
                    <th className="py-2 px-3">Outcome Status</th>
                    <th className="py-2 px-3 text-center">Count</th>
                    <th className="py-2 px-3 text-right">Proportion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5DCD5]">
                  <tr>
                    <td className="py-2 px-3 font-semibold text-[#266044]">Taken</td>
                    <td className="py-2 px-3 text-center font-bold">{stats.taken}</td>
                    <td className="py-2 px-3 text-right font-bold">
                      {stats.totalCounted > 0 ? ((stats.taken / stats.totalCounted) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-[#A3342A]">Not taken</td>
                    <td className="py-2 px-3 text-center font-bold">{stats.missed}</td>
                    <td className="py-2 px-3 text-right font-bold">
                      {stats.totalCounted > 0 ? ((stats.missed / stats.totalCounted) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-[#805A13]">Unconfirmed</td>
                    <td className="py-2 px-3 text-center font-bold">{stats.unconfirmed}</td>
                    <td className="py-2 px-3 text-right font-bold">
                      {stats.totalCounted > 0 ? ((stats.unconfirmed / stats.totalCounted) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CHART 4: Horizontal Bars per Medicine */}
        <div className="bg-white border border-[#D5DCD5] rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D5DCD5] pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#214F3A]" />
              <h3 className="font-serif font-bold text-lg text-[#1F2B25]">
                4. Confirmed Taken % per Medicine
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowTable4(!showTable4)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#214F3A] hover:bg-[#F0F3ED] px-3 py-1.5 rounded border border-[#718278] self-start sm:self-auto min-h-[36px]"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>{showTable4 ? 'Hide table' : 'View as table'}</span>
            </button>
          </div>

          {stats.byMedicine.length === 0 ? (
            <div className="p-8 text-center text-[#53645A] text-sm italic">
              No recorded doses in this range yet.
            </div>
          ) : (
            <div className="space-y-4">
              {stats.byMedicine.map((med) => (
                <div key={med.medicationId} className="space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                    <div>
                      <MedicineTitle
                        name={med.name}
                        transliterations={data.medications.find((m) => m.id === med.medicationId)?.nameTransliterations}
                        size="sm"
                      />
                      <span className="text-[#53645A] text-xs">
                        {med.strength || 'Strength not specified'}
                      </span>
                    </div>
                    <div className="font-mono font-bold text-[#214F3A]">
                      {med.rate === '—' ? '—' : `${med.rate}%`}{' '}
                      <span className="text-xs font-normal text-[#53645A]">
                        ({med.taken}/{med.totalCounted} taken)
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="h-4 w-full bg-[#F0F3ED] rounded-full overflow-hidden flex border border-[#D5DCD5]">
                    {med.totalCounted > 0 ? (
                      <>
                        <div
                          style={{ width: `${(med.taken / med.totalCounted) * 100}%` }}
                          className="bg-[#266044] transition-all"
                          title={`Taken: ${med.taken}`}
                        />
                        <div
                          style={{ width: `${(med.missed / med.totalCounted) * 100}%` }}
                          className="bg-[#A3342A] transition-all"
                          title={`Missed: ${med.missed}`}
                        />
                        <div
                          style={{ width: `${(med.unconfirmed / med.totalCounted) * 100}%` }}
                          className="bg-[#805A13] transition-all"
                          title={`Unconfirmed: ${med.unconfirmed}`}
                        />
                      </>
                    ) : (
                      <div className="w-full bg-[#F0F3ED]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {showTable4 && (
            <div className="mt-4 border border-[#D5DCD5] rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAF7] border-b border-[#D5DCD5] font-bold text-[#53645A]">
                  <tr>
                    <th className="py-2.5 px-3">Medicine</th>
                    <th className="py-2.5 px-3 text-center">Taken</th>
                    <th className="py-2.5 px-3 text-center">Not taken</th>
                    <th className="py-2.5 px-3 text-center">Unconfirmed</th>
                    <th className="py-2.5 px-3 text-right">Confirmed Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5DCD5]">
                  {stats.byMedicine.map((m) => (
                    <tr key={m.medicationId} className="hover:bg-[#F0F3ED]/40">
                      <td className="py-2 px-3 font-semibold text-[#1F2B25]">
                        <MedicineTitle
                          name={m.name}
                          transliterations={data.medications.find((med) => med.id === m.medicationId)?.nameTransliterations}
                          size="sm"
                        />
                        <span className="text-xs text-[#53645A]">
                          ({m.strength || 'Strength not specified'})
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-[#266044]">{m.taken}</td>
                      <td className="py-2 px-3 text-center font-bold text-[#A3342A]">{m.missed}</td>
                      <td className="py-2 px-3 text-center font-bold text-[#805A13]">{m.unconfirmed}</td>
                      <td className="py-2 px-3 text-right font-bold text-[#214F3A]">
                        {m.rate === '—' ? '—' : `${m.rate}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CHART 5: Time-of-Day View */}
        <div className="bg-white border border-[#D5DCD5] rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D5DCD5] pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#214F3A]" />
              <h3 className="font-serif font-bold text-lg text-[#1F2B25]">
                5. Time-of-Day View (Counts by Scheduled Slot)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowTable5(!showTable5)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#214F3A] hover:bg-[#F0F3ED] px-3 py-1.5 rounded border border-[#718278] self-start sm:self-auto min-h-[36px]"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>{showTable5 ? 'Hide table' : 'View as table'}</span>
            </button>
          </div>

          {stats.byTimeSlot.length === 0 ? (
            <div className="p-8 text-center text-[#53645A] text-sm italic">
              No recorded doses in this range yet.
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${Math.max(480, stats.byTimeSlot.length * 64)} 200`}
                className="w-full h-auto min-w-[320px] max-h-60"
                role="img"
                aria-label="Time of Day Outcome Counts"
              >
                {/* Horizontal guide */}
                <line x1="30" y1="160" x2="100%" y2="160" stroke="#D5DCD5" strokeWidth="1.5" />

                {(() => {
                  const maxSlot = Math.max(1, ...stats.byTimeSlot.map((s) => s.totalCounted));
                  const svgW = Math.max(480, stats.byTimeSlot.length * 64);
                  const slotW = (svgW - 50) / stats.byTimeSlot.length;
                  const barW = Math.min(32, slotW * 0.7);

                  return stats.byTimeSlot.map((slot, idx) => {
                    const xCenter = 40 + idx * slotW + slotW / 2;
                    const xBar = xCenter - barW / 2;

                    const takenH = (slot.taken / maxSlot) * 120;
                    const missedH = (slot.missed / maxSlot) * 120;
                    const unconfH = (slot.unconfirmed / maxSlot) * 120;

                    const takenY = 160 - takenH;
                    const missedY = takenY - missedH;
                    const unconfY = missedY - unconfH;

                    return (
                      <g key={slot.timeSlot} tabIndex={0} className="focus:outline-hidden">
                        {takenH > 0 && (
                          <rect
                            x={xBar}
                            y={takenY}
                            width={barW}
                            height={takenH}
                            fill="#266044"
                            rx="2"
                          />
                        )}
                        {missedH > 0 && (
                          <rect
                            x={xBar}
                            y={missedY}
                            width={barW}
                            height={missedH}
                            fill="#A3342A"
                            rx="2"
                          />
                        )}
                        {unconfH > 0 && (
                          <rect
                            x={xBar}
                            y={unconfY}
                            width={barW}
                            height={unconfH}
                            fill="#805A13"
                            rx="2"
                          />
                        )}

                        {/* Slot label on X */}
                        <text
                          x={xCenter}
                          y="180"
                          textAnchor="middle"
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight="bold"
                          fill="#1F2B25"
                        >
                          {slot.timeSlot}
                        </text>

                        {/* Total on top */}
                        <text
                          x={xCenter}
                          y={unconfY - 4}
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight="bold"
                          fill="#53645A"
                        >
                          {slot.taken}/{slot.totalCounted}
                        </text>
                      </g>
                    );
                  });
                })()}
              </svg>
            </div>
          )}

          {showTable5 && (
            <div className="mt-4 border border-[#D5DCD5] rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAF7] border-b border-[#D5DCD5] font-bold text-[#53645A]">
                  <tr>
                    <th className="py-2 px-3">Time Slot</th>
                    <th className="py-2 px-3 text-center">Taken</th>
                    <th className="py-2 px-3 text-center">Not taken</th>
                    <th className="py-2 px-3 text-center">Unconfirmed</th>
                    <th className="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5DCD5]">
                  {stats.byTimeSlot.map((s) => (
                    <tr key={s.timeSlot} className="hover:bg-[#F0F3ED]/40">
                      <td className="py-2 px-3 font-mono font-bold text-[#1F2B25]">{s.timeSlot}</td>
                      <td className="py-2 px-3 text-center font-bold text-[#266044]">{s.taken}</td>
                      <td className="py-2 px-3 text-center font-bold text-[#A3342A]">{s.missed}</td>
                      <td className="py-2 px-3 text-center font-bold text-[#805A13]">{s.unconfirmed}</td>
                      <td className="py-2 px-3 text-right font-bold">{s.totalCounted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* DAILY INTAKE LOG TABLE (INCLUDES "Today (in progress)") */}
      <div className="bg-white border border-[#D5DCD5] rounded-xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 bg-[#F0F3ED] border-b border-[#D5DCD5] flex items-center justify-between">
          <h3 className="text-lg font-serif font-bold text-[#1F2B25]">
            Daily Intake Log
          </h3>
          <span className="text-xs font-semibold text-[#53645A]">
            Includes Today (in progress) &bull; Last updated {formattedLastUpdated}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#D5DCD5] bg-[#FAFAF7] text-xs font-bold text-[#53645A] uppercase">
                <th className="py-3 px-4">{t.date}</th>
                <th className="py-3 px-4 text-center">{t.statusTaken}</th>
                <th className="py-3 px-4 text-center">{t.statusMissed}</th>
                <th className="py-3 px-4 text-center">{t.statusUnconfirmed}</th>
                <th className="py-3 px-4 text-center">Pending (Upcoming/Due)</th>
                <th className="py-3 px-4 text-right">Confirmed Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5DCD5]">
              {stats.days.map((day) => (
                <tr
                  key={day.dateStr}
                  className={`notebook-table-row transition-colors ${
                    day.isToday ? 'bg-[#FBF2D9]/40 font-semibold' : 'hover:bg-[#F0F3ED]/50'
                  }`}
                >
                  <td className="py-3.5 px-4 font-semibold text-[#1F2B25] whitespace-nowrap">
                    {day.isToday ? (
                      <span className="inline-flex items-center gap-1.5 text-[#875E16]">
                        <Clock className="w-3.5 h-3.5" />
                        Today (in progress)
                      </span>
                    ) : (
                      formatKolkataDate(day.dateStr)
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-[#266044] tabular-nums">
                    {day.taken}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-[#A3342A] tabular-nums">
                    {day.missed}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-[#805A13] tabular-nums">
                    {day.unconfirmed}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-[#53645A] tabular-nums">
                    {day.pendingNotCounted > 0 ? (
                      <span className="bg-[#F0F3ED] text-[#53645A] px-2 py-0.5 rounded text-xs border border-[#D5DCD5]">
                        {day.pendingNotCounted} pending
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#214F3A] tabular-nums">
                    {day.rate === '—' ? '—' : `${day.rate}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECENT ACTIVITY LIST ON REPORT */}
      <div className="bg-white border border-[#D5DCD5] rounded-xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 bg-[#F0F3ED] border-b border-[#D5DCD5] flex items-center gap-2">
          <History className="w-5 h-5 text-[#214F3A]" />
          <h3 className="text-lg font-serif font-bold text-[#1F2B25]">
            Recent Activity (Audit Log)
          </h3>
        </div>

        {recentActivities.length === 0 ? (
          <div className="p-6 text-center text-[#53645A] text-sm">
            No recent activity recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-[#D5DCD5] text-sm">
            {recentActivities.map((log) => {
              const isCorrection = log.action === 'CORRECT_DOSE';
              const isTaken = log.actionType === 'TAKEN' || log.newValue === 'Taken';
              const isMissed = log.actionType === 'MISSED' || log.newValue === 'Not taken';

              return (
                <div
                  key={log.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#FAFAF7]"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <MedicineTitle
                        name={log.medicineName || 'Medication'}
                        transliterations={data.medications.find((m) => m.name.toLowerCase() === log.medicineName?.toLowerCase())?.nameTransliterations}
                        size="sm"
                      />
                      {isCorrection && (
                        <span className="text-[11px] bg-[#FBF2D9] text-[#805A13] px-2 py-0.5 rounded font-bold border border-[#E6D4A5]">
                          Correction
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#53645A]">{log.details}</p>
                    <p className="text-[11px] text-[#718278]">
                      {formatKolkataDateTime(log.timestamp)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs self-start sm:self-auto">
                    {isCorrection ? (
                      <span className="flex items-center gap-1 font-semibold">
                        <span className="px-2 py-0.5 rounded bg-[#FBECEA] text-[#A3342A] border border-[#F2BDB9]">
                          {log.previousValue || 'Original'}
                        </span>
                        <span className="text-[#53645A]">&rarr;</span>
                        <span className="px-2 py-0.5 rounded bg-[#EAF3ED] text-[#266044] border border-[#B8D7C2]">
                          {log.newValue}
                        </span>
                      </span>
                    ) : isTaken ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-[#EAF3ED] text-[#266044] border border-[#B8D7C2]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Taken
                      </span>
                    ) : isMissed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-[#FBECEA] text-[#A3342A] border border-[#F2BDB9]">
                        <XCircle className="w-3.5 h-3.5" />
                        Not taken
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-[#F0F3ED] text-[#53645A] font-semibold border border-[#D5DCD5]">
                        {log.action}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product boundary footer */}
      <div className="p-4 bg-[#F0F3ED] rounded-lg border border-[#D5DCD5] text-xs text-[#53645A] flex items-start gap-2">
        <Info className="w-4 h-4 shrink-0 text-[#214F3A] mt-0.5" />
        <p>
          These charts and summaries reflect patient self-reported logs according to written prescriptions. CareDose does not verify ingestion or give medical dosage recommendations.
        </p>
      </div>
    </div>
  );
};
