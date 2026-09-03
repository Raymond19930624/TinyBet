import React from 'react';
import { Trophy, Flame, Zap, Crown } from 'lucide-react';

export default function RatioBar({
  princeTotal,
  princessTotal,
  grandTotal,
  princePercent,
  princessPercent,
  totalBettorsCount,
  leader,
  revealedResult
}) {
  const isPrinceRevealed = revealedResult === 'prince';
  const isPrincessRevealed = revealedResult === 'princess';

  return (
    <div className="w-full bg-white/95 backdrop-blur-md p-4 rounded-3xl shadow-xl border border-white relative overflow-hidden box-border">
      
      {/* 頂部：總獎金池 Header */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-tr from-amber-400 to-yellow-500 text-white rounded-2xl shadow-md">
            <Trophy className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="text-[10px] font-black text-amber-600 tracking-wider uppercase">
              總獎金池 TOTAL POOL
            </div>
            <div className="text-2xl font-black text-slate-800 tracking-tight leading-none mt-0.5">
              ${Number(grandTotal).toLocaleString('en-US')}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60 text-slate-600 text-xs font-bold">
          <span>總參與:</span>
          <span className="font-black text-slate-900">{totalBettorsCount} 人次</span>
        </div>
      </div>

      {/* 中間：兩隊對決數據卡片 */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* 王子隊 */}
        <div
          className={`p-3.5 rounded-2xl transition-all relative border-2 box-border ${
            isPrinceRevealed
              ? 'bg-gradient-to-b from-sky-50 to-sky-100 border-sky-500 shadow-md ring-2 ring-sky-300'
              : leader === 'prince'
              ? 'bg-sky-50/80 border-sky-400 shadow-sm'
              : 'bg-slate-50/60 border-slate-200'
          }`}
        >
          {isPrinceRevealed ? (
            <div className="absolute -top-2.5 right-2 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[10px] font-black rounded-full shadow-md flex items-center gap-0.5 border border-amber-200">
              <Crown className="w-3 h-3 fill-yellow-200 text-yellow-100 animate-bounce" />
              👑 最終勝出！
            </div>
          ) : leader === 'prince' && (
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-sky-500 text-white text-[10px] font-black rounded-full shadow-xs flex items-center gap-0.5">
              <Crown className="w-3 h-3 fill-sky-200 text-sky-200" />
              領先
            </div>
          )}

          <div className="text-center pt-1">
            <span className="text-2xl block mb-1">👦</span>
            <div className="font-black text-slate-800 text-xs mb-1">王子隊</div>
            <div className="text-xl font-black text-sky-600 tracking-tight">
              ${Number(princeTotal).toLocaleString('en-US')}
            </div>
          </div>
        </div>

        {/* 公主隊 */}
        <div
          className={`p-3.5 rounded-2xl transition-all relative border-2 box-border ${
            isPrincessRevealed
              ? 'bg-gradient-to-b from-pink-50 to-pink-100 border-pink-500 shadow-md ring-2 ring-pink-300'
              : leader === 'princess'
              ? 'bg-pink-50/80 border-pink-400 shadow-sm'
              : 'bg-slate-50/60 border-slate-200'
          }`}
        >
          {isPrincessRevealed ? (
            <div className="absolute -top-2.5 right-2 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[10px] font-black rounded-full shadow-md flex items-center gap-0.5 border border-amber-200">
              <Crown className="w-3 h-3 fill-yellow-200 text-yellow-100 animate-bounce" />
              👑 最終勝出！
            </div>
          ) : leader === 'princess' && (
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-pink-500 text-white text-[10px] font-black rounded-full shadow-xs flex items-center gap-0.5">
              <Crown className="w-3 h-3 fill-pink-200 text-pink-200" />
              領先
            </div>
          )}

          <div className="text-center pt-1">
            <span className="text-2xl block mb-1">👧</span>
            <div className="font-black text-slate-800 text-xs mb-1">公主隊</div>
            <div className="text-xl font-black text-pink-600 tracking-tight">
              ${Number(princessTotal).toLocaleString('en-US')}
            </div>
          </div>
        </div>
      </div>

      {/* 底部：雙向戰力對決條 */}
      <div className="w-full relative pt-1">
        <div className="w-full h-5 rounded-full bg-slate-100 overflow-hidden flex shadow-inner relative border border-slate-200/80">
          {/* 王子戰力條 */}
          <div
            style={{ width: `${princePercent}%` }}
            className="h-full bg-gradient-to-r from-sky-400 to-sky-500 transition-all duration-700 relative overflow-hidden flex items-center justify-start pl-2"
          >
            <div className="absolute inset-0 bg-stripe animate-stripe opacity-25" />
            <span className="text-[10px] font-black text-white z-10 drop-shadow-xs">
              {princePercent}%
            </span>
          </div>

          {/* 公主戰力條 */}
          <div
            style={{ width: `${princessPercent}%` }}
            className="h-full bg-gradient-to-r from-pink-400 to-pink-500 transition-all duration-700 relative overflow-hidden flex items-center justify-end pr-2"
          >
            <div className="absolute inset-0 bg-stripe animate-stripe opacity-25" />
            <span className="text-[10px] font-black text-white z-10 drop-shadow-xs">
              {princessPercent}%
            </span>
          </div>

          {/* 交界處黃金雷電標誌 */}
          {!revealedResult && (
            <div
              style={{ left: `${princePercent}%` }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 transition-all duration-700"
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute w-6 h-6 rounded-full bg-amber-400 animate-ping opacity-75" />
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-white shadow-md flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-amber-950 fill-amber-950" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 比例條底部對決標語 (已移除重複的火焰 Icon，修復為乾淨的🔥 對決中) */}
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mt-1.5 px-1">
          <span className="flex items-center gap-1 text-sky-700 font-extrabold">
            👦 王子 {princePercent}%
          </span>
          
          {revealedResult ? (
            <span className="text-amber-600 font-black flex items-center gap-1">
              🎉 揭曉成功
            </span>
          ) : (
            <span className="text-amber-600 font-black flex items-center gap-1">
              <span className="animate-bounce inline-block">🔥</span>
              <span>對決中</span>
            </span>
          )}

          <span className="flex items-center gap-1 text-pink-700 font-extrabold">
            👧 公主 {princessPercent}%
          </span>
        </div>
      </div>

    </div>
  );
}
