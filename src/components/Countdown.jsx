import React, { useState, useEffect } from 'react';
import { Clock, Sparkles } from 'lucide-react';

export default function Countdown({ cutoffDate, revealDate }) {
  // 安全日期解析函數 (防範 NaN)
  const parseSafeDate = (dateStr, defaultIso) => {
    if (!dateStr) return new Date(defaultIso);
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        return new Date(defaultIso);
      }
      return d;
    } catch {
      return new Date(defaultIso);
    }
  };

  const calculateTimeLeft = (targetDate) => {
    const difference = targetDate.getTime() - new Date().getTime();
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isPassed: false
    };
  };

  const cutoffTarget = parseSafeDate(cutoffDate, '2026-09-05T17:00:00+08:00');
  const revealTarget = parseSafeDate(revealDate, '2026-09-05T17:30:00+08:00');

  const [cutoffTimeLeft, setCutoffTimeLeft] = useState(() => calculateTimeLeft(cutoffTarget));
  const [revealTimeLeft, setRevealTimeLeft] = useState(() => calculateTimeLeft(revealTarget));

  useEffect(() => {
    const timer = setInterval(() => {
      setCutoffTimeLeft(calculateTimeLeft(cutoffTarget));
      setRevealTimeLeft(calculateTimeLeft(revealTarget));
    }, 1000);

    return () => clearInterval(timer);
  }, [cutoffDate, revealDate]);

  const renderTimeUnit = (value, label, colorBg, colorText) => {
    const safeValue = isNaN(value) ? 0 : value;
    return (
      <div className={`flex flex-col items-center justify-center p-1.5 rounded-xl ${colorBg} border border-white/60 shadow-2xs min-w-[38px]`}>
        <span className={`text-sm font-black ${colorText} leading-none`}>
          {String(safeValue).padStart(2, '0')}
        </span>
        <span className="text-[9px] font-bold text-slate-500 mt-0.5 leading-none">
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="w-full space-y-2 box-border">
      
      {/* 1. 性別揭曉時刻倒數卡片 */}
      <div className="w-full bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-md border-2 border-purple-100 flex items-center justify-between gap-2 box-border">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 bg-purple-100 text-purple-600 rounded-xl flex-shrink-0">
            <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <div className="text-xs font-black text-slate-800">揭曉時刻</div>
            <div className="text-[10px] text-purple-600 font-bold">
              {revealTimeLeft.isPassed ? '🎉 已到揭曉時間！' : '派對現場揭曉倒數'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {renderTimeUnit(revealTimeLeft.days, '天', 'bg-purple-50', 'text-purple-700')}
          {renderTimeUnit(revealTimeLeft.hours, '時', 'bg-purple-50', 'text-purple-700')}
          {renderTimeUnit(revealTimeLeft.minutes, '分', 'bg-purple-50', 'text-purple-700')}
          {renderTimeUnit(revealTimeLeft.seconds, '秒', 'bg-purple-600', 'text-white')}
        </div>
      </div>

      {/* 2. 下注截止時刻倒數卡片 */}
      <div className="w-full bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-md border-2 border-sky-100 flex items-center justify-between gap-2 box-border">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 bg-sky-100 text-sky-600 rounded-xl flex-shrink-0">
            <Clock className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-800">投注截止</div>
            <div className="text-[10px] text-sky-600 font-bold">
              {cutoffTimeLeft.isPassed ? '⏰ 投注已截止' : '下注倒數中'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {renderTimeUnit(cutoffTimeLeft.days, '天', 'bg-sky-50', 'text-sky-700')}
          {renderTimeUnit(cutoffTimeLeft.hours, '時', 'bg-sky-50', 'text-sky-700')}
          {renderTimeUnit(cutoffTimeLeft.minutes, '分', 'bg-sky-50', 'text-sky-700')}
          {renderTimeUnit(cutoffTimeLeft.seconds, '秒', 'bg-sky-600', 'text-white')}
        </div>
      </div>

    </div>
  );
}
