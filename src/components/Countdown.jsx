import React, { useState, useEffect } from 'react';
import { Clock, Sparkles, Trophy, Play, PartyPopper } from 'lucide-react';

export default function Countdown({
  cutoffDate,
  revealDate,
  revealedResult,
  bets = [],
  grandTotal = 0,
  onReopenRevealModal
}) {
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

  // 🌟 性別已揭曉模式：展示得獎結果廣播卡片 + 🎬 重播揭曉動畫按鈕
  if (revealedResult) {
    const isPrince = revealedResult === 'prince';
    const winningBets = bets.filter(b => b.team === revealedResult);

    return (
      <div className="w-full box-border animate-fadeIn">
        <div className={`w-full p-4 rounded-3xl shadow-xl border-3 relative overflow-hidden box-border ${
          isPrince
            ? 'bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 text-white border-sky-300 shadow-sky-200'
            : 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white border-pink-300 shadow-pink-200'
        }`}>
          {/* 背景慶祝光芒裝飾 */}
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/20 backdrop-blur-md rounded-2xl flex-shrink-0">
                <PartyPopper className="w-6 h-6 text-yellow-300 animate-bounce" />
              </div>
              <div>
                <div className="text-[11px] text-white/90 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>性別大揭曉成功</span>
                </div>
                <h3 className="text-lg font-black tracking-tight leading-tight">
                  小元寶是【{isPrince ? '👦 帥氣王子寶貝' : '👧 可愛公主寶貝'}】！
                </h3>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-black/15 backdrop-blur-sm border border-white/20 flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span className="font-bold text-white/90">猜對人數:</span>
              <span className="font-black text-amber-200 text-sm">{winningBets.length} 人</span>
            </div>
            <div>
              <span className="font-bold text-white/90">瓜分總獎金:</span>
              <span className="font-black text-amber-300 text-sm ml-1">${Number(grandTotal).toLocaleString('en-US')}</span>
            </div>
          </div>

          {/* 🎬 重新觀看揭曉動畫按鈕 */}
          <button
            onClick={onReopenRevealModal}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-900 font-black text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-98 border border-white/80"
          >
            <Play className="w-4 h-4 fill-slate-900 text-slate-900" />
            <span>🎬 重新觀看揭曉瞬間動畫與特效</span>
          </button>

        </div>
      </div>
    );
  }

  // 尚未揭曉模式：正常展示倒數卡片
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
