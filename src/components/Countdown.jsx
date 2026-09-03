import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Lock, AlertCircle } from 'lucide-react';

export default function Countdown({ revealDateStr, cutoffDateStr, revealedResult }) {
  const [revealTimeLeft, setRevealTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });
  const [cutoffTimeLeft, setCutoffTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    function calculate() {
      const now = new Date().getTime();

      // 揭曉時間
      const revealTarget = new Date(revealDateStr).getTime();
      const revealDiff = revealTarget - now;

      if (revealDiff <= 0) {
        setRevealTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
      } else {
        setRevealTimeLeft({
          days: Math.floor(revealDiff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((revealDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((revealDiff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((revealDiff % (1000 * 60)) / 1000),
          isPast: false
        });
      }

      // 截止時間
      const cutoffTarget = new Date(cutoffDateStr).getTime();
      const cutoffDiff = cutoffTarget - now;

      if (cutoffDiff <= 0) {
        setCutoffTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
      } else {
        setCutoffTimeLeft({
          days: Math.floor(cutoffDiff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((cutoffDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((cutoffDiff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((cutoffDiff % (1000 * 60)) / 1000),
          isPast: false
        });
      }
    }

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [revealDateStr, cutoffDateStr]);

  const isCutoffPast = cutoffTimeLeft.isPast || !!revealedResult;

  // 格式化日期時間: 2026/09/05 17:30 (六)
  const formatSingleLineDate = (dateString) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const week = weekdays[d.getDay()];

    return `${year}/${month}/${day} ${hours}:${minutes} (${week})`;
  };

  return (
    <div className="w-full space-y-2.5 box-border">
      {/* 揭曉時間卡片 */}
      <div className="w-full bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-purple-100 shadow-md flex items-center justify-between gap-2 box-border">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-slate-400 font-bold leading-none mb-1">揭曉時刻</div>
            <div className="text-xs font-black text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">
              {formatSingleLineDate(revealDateStr)}
            </div>
          </div>
        </div>

        {/* 倒數小方塊 */}
        <div className="flex-shrink-0">
          {revealTimeLeft.isPast ? (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-[11px] font-extrabold rounded-lg">
              揭曉已到！
            </span>
          ) : (
            <div className="flex gap-0.5 text-slate-800 font-bold text-[10px]">
              <div className="bg-purple-50 border border-purple-100 rounded px-1 py-0.5 text-center min-w-[26px]">
                <div className="font-black text-xs leading-none">{revealTimeLeft.days}</div>
                <div className="text-[8px] text-purple-400">天</div>
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded px-1 py-0.5 text-center min-w-[26px]">
                <div className="font-black text-xs leading-none">{revealTimeLeft.hours}</div>
                <div className="text-[8px] text-purple-400">時</div>
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded px-1 py-0.5 text-center min-w-[26px]">
                <div className="font-black text-xs leading-none">{revealTimeLeft.minutes}</div>
                <div className="text-[8px] text-purple-400">分</div>
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded px-1 py-0.5 text-center min-w-[26px] text-purple-600">
                <div className="font-black text-xs leading-none animate-pulse">{revealTimeLeft.seconds}</div>
                <div className="text-[8px] text-purple-500">秒</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 投注截止時間卡片 */}
      <div className={`w-full backdrop-blur-md p-3.5 rounded-2xl border shadow-md flex items-center justify-between gap-2 transition-colors box-border ${
        isCutoffPast ? 'bg-amber-50/90 border-amber-200' : 'bg-white/90 border-blue-100'
      }`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isCutoffPast ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-600'
          }`}>
            {isCutoffPast ? <Lock className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-slate-400 font-bold leading-none mb-1">投注截止</div>
            <div className="text-xs font-black text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">
              {formatSingleLineDate(cutoffDateStr)}
            </div>
          </div>
        </div>

        {/* 倒數小方塊 */}
        <div className="flex-shrink-0">
          {isCutoffPast ? (
            <span className="inline-flex items-center gap-0.5 px-2 py-1 bg-amber-200 text-amber-900 text-[11px] font-black rounded-lg">
              <AlertCircle className="w-3 h-3" />
              已截止
            </span>
          ) : (
            <div className="flex gap-0.5 text-slate-800 font-bold text-[10px]">
              <div className="bg-blue-50 border border-blue-100 rounded px-1 py-0.5 text-center min-w-[26px]">
                <div className="font-black text-xs leading-none">{cutoffTimeLeft.days}</div>
                <div className="text-[8px] text-blue-400">天</div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded px-1 py-0.5 text-center min-w-[26px]">
                <div className="font-black text-xs leading-none">{cutoffTimeLeft.hours}</div>
                <div className="text-[8px] text-blue-400">時</div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded px-1 py-0.5 text-center min-w-[26px]">
                <div className="font-black text-xs leading-none">{cutoffTimeLeft.minutes}</div>
                <div className="text-[8px] text-blue-400">分</div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded px-1 py-0.5 text-center min-w-[26px] text-blue-600">
                <div className="font-black text-xs leading-none animate-pulse">{cutoffTimeLeft.seconds}</div>
                <div className="text-[8px] text-blue-500">秒</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
