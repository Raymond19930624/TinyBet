import React, { useState, useEffect } from 'react';
import { Clock, Sparkles, PartyPopper, RefreshCw, Trophy } from 'lucide-react';

export default function Countdown({
  cutoffDate,
  revealDate,
  revealedResult,
  bets = [],
  grandTotal = 0,
  onReopenRevealModal
}) {
  const [cutoffTimeLeft, setCutoffTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: false });
  const [revealTimeLeft, setRevealTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: false });

  useEffect(() => {
    const calculateTimeLeft = (targetIso) => {
      if (!targetIso) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: false };
      const diff = new Date(targetIso).getTime() - new Date().getTime();
      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true };
      }
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        isPassed: false
      };
    };

    const timer = setInterval(() => {
      setCutoffTimeLeft(calculateTimeLeft(cutoffDate));
      setRevealTimeLeft(calculateTimeLeft(revealDate));
    }, 1000);

    setCutoffTimeLeft(calculateTimeLeft(cutoffDate));
    setRevealTimeLeft(calculateTimeLeft(revealDate));

    return () => clearInterval(timer);
  }, [cutoffDate, revealDate]);

  const formatDisplayTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch {
      return isoString;
    }
  };

  const renderTimerDigits = (timeLeft, colorTheme = 'sky') => {
    const digitsClass = colorTheme === 'purple' 
      ? 'bg-purple-100 text-purple-900' 
      : 'bg-sky-100 text-sky-900';

    const lastDigitClass = colorTheme === 'purple'
      ? 'bg-purple-600 text-white shadow-md shadow-purple-300'
      : 'bg-sky-600 text-white shadow-md shadow-sky-300';

    if (timeLeft.isPassed) {
      return (
        <div className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-black rounded-2xl border border-slate-200 shadow-inner">
          已截止
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1">
        {/* 天 */}
        <div className="flex flex-col items-center">
          <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${digitsClass}`}>
            {String(timeLeft.days).padStart(2, '0')}
          </span>
          <span className="text-[9px] text-slate-400 font-bold mt-0.5">天</span>
        </div>
        {/* 時 */}
        <div className="flex flex-col items-center">
          <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${digitsClass}`}>
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[9px] text-slate-400 font-bold mt-0.5">時</span>
        </div>
        {/* 分 */}
        <div className="flex flex-col items-center">
          <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${digitsClass}`}>
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[9px] text-slate-400 font-bold mt-0.5">分</span>
        </div>
        {/* 秒 */}
        <div className="flex flex-col items-center">
          <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${lastDigitClass} animate-pulse`}>
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-[9px] text-slate-400 font-bold mt-0.5">秒</span>
        </div>
      </div>
    );
  };

  // 若已揭曉，展示最終勝利結算卡片
  if (revealedResult) {
    const isPrince = revealedResult === 'prince';
    const winningBets = bets.filter(b => b.team === (isPrince ? 'prince' : 'princess'));

    return (
      <div className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 p-0.5 rounded-3xl shadow-xl border-2 border-yellow-200 animate-fadeIn">
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-[22px] text-center space-y-3">
          
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl animate-bounce">🎉</span>
            <div>
              <h3 className="text-base font-extrabold text-amber-950 flex items-center justify-center gap-1">
                <span>小元寶揭曉成功！</span>
                <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-xs font-black">
                  {isPrince ? '👦 帥氣王子' : '👧 可愛公主'}
                </span>
              </h3>
              <p className="text-xs text-amber-800 font-bold mt-0.5">
                恭喜 {winningBets.length} 位幸運兒猜中得獎！
              </p>
            </div>
            <span className="text-3xl animate-bounce">🎉</span>
          </div>

          {/* 重看煙火與爆竹按鈕 */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={onReopenRevealModal}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black text-xs rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <PartyPopper className="w-4 h-4 text-yellow-100" />
              <span>重看揭曉動畫 🎆</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2 box-border">
      
      {/* 1. 上方：投注截止倒數卡片 (Cutoff - 藍色) */}
      <div className="w-full bg-white/90 backdrop-blur-md p-3 rounded-3xl shadow-lg border border-sky-100/80 flex items-center justify-between gap-2 box-border">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 bg-sky-100 text-sky-600 rounded-2xl flex-shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-slate-800 truncate">投注截止</div>
            <div className="text-[10px] text-sky-700 font-bold truncate">
              {formatDisplayTime(cutoffDate)}
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          {renderTimerDigits(cutoffTimeLeft, 'sky')}
        </div>
      </div>

      {/* 2. 下方：揭曉時刻倒數卡片 (Reveal - 紫金) */}
      <div className="w-full bg-white/90 backdrop-blur-md p-3 rounded-3xl shadow-lg border border-purple-100/80 flex items-center justify-between gap-2 box-border">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 bg-purple-100 text-purple-600 rounded-2xl flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-slate-800 truncate">揭曉時刻</div>
            <div className="text-[10px] text-purple-700 font-bold truncate">
              {formatDisplayTime(revealDate)}
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          {renderTimerDigits(revealTimeLeft, 'purple')}
        </div>
      </div>

    </div>
  );
}
