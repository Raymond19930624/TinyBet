import React from 'react';
import { Crown, Flame, Users, Coins, Zap } from 'lucide-react';

export default function RatioBar({
  princeTotal,
  princessTotal,
  grandTotal,
  princePercent,
  princessPercent,
  totalBettorsCount,
  leader
}) {
  return (
    <div className="w-full box-border">
      <div className="w-full bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-lg border border-white relative overflow-hidden box-border">
        
        {/* 頂部總金額 */}
        <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-purple-100 text-purple-700 rounded-xl">
              <Coins className="w-4 h-4" />
            </span>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">總獎金池 TOTAL POOL</div>
              <div className="text-xl font-black text-slate-800 leading-tight">
                ${Number(grandTotal).toLocaleString('en-US')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-full text-slate-700 text-[11px] font-bold">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>總參與：<strong className="text-slate-900 text-xs">{totalBettorsCount}</strong> 人次</span>
          </div>
        </div>

        {/* 王子 VS 公主 數據比對區 */}
        <div className="grid grid-cols-2 gap-2.5 mb-3 text-center">
          {/* 王子隊卡片 */}
          <div className={`p-3.5 rounded-2xl border-2 transition-all relative flex flex-col items-center justify-center ${
            leader === 'prince' 
              ? 'bg-sky-50/80 border-sky-400 shadow-sm' 
              : 'bg-slate-50/60 border-slate-200 opacity-90'
          }`}>
            {leader === 'prince' && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-sky-500 text-white px-2 py-0.2 rounded-full text-[10px] font-black flex items-center gap-0.5 shadow-sm whitespace-nowrap">
                <Crown className="w-3 h-3 text-amber-300 fill-amber-300 animate-bounce" />
                領先
              </div>
            )}
            <div className="text-2xl mb-1">👦</div>
            <div className="text-xs font-extrabold text-sky-900 mb-0.5">王子隊</div>
            <div className="text-xl font-black text-sky-600">${Number(princeTotal).toLocaleString('en-US')}</div>
          </div>

          {/* 公主隊卡片 */}
          <div className={`p-3.5 rounded-2xl border-2 transition-all relative flex flex-col items-center justify-center ${
            leader === 'princess' 
              ? 'bg-pink-50/80 border-pink-400 shadow-sm' 
              : 'bg-slate-50/60 border-slate-200 opacity-90'
          }`}>
            {leader === 'princess' && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-pink-500 text-white px-2 py-0.2 rounded-full text-[10px] font-black flex items-center gap-0.5 shadow-sm whitespace-nowrap">
                <Crown className="w-3 h-3 text-amber-300 fill-amber-300 animate-bounce" />
                領先
              </div>
            )}
            <div className="text-2xl mb-1">👧</div>
            <div className="text-xs font-extrabold text-pink-900 mb-0.5">公主隊</div>
            <div className="text-xl font-black text-pink-600">${Number(princessTotal).toLocaleString('en-US')}</div>
          </div>
        </div>

        {/* 💥 比例條對決特效 (Versus Battle Progress Bar) */}
        <div className="space-y-1">
          <div className="relative h-6 w-full bg-slate-100 rounded-full overflow-hidden flex p-0.5 border border-slate-200/80 shadow-inner">
            
            {/* 藍色 Prince 邊 */}
            <div 
              className="h-full bg-gradient-to-r from-sky-400 via-sky-500 to-blue-500 rounded-l-full transition-all duration-700 flex items-center justify-start pl-2 text-[10px] text-white font-black overflow-hidden relative"
              style={{ width: `${princePercent}%` }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:16px_16px] animate-[stripe_2s_linear_infinite]" />
              <span className="relative z-10">{princePercent > 10 && `${princePercent}%`}</span>
            </div>

            {/* ⚔️ 碰撞核心爆裂點 */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 transition-all duration-700 flex items-center justify-center"
              style={{ left: `${princePercent}%` }}
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute w-6 h-6 rounded-full bg-amber-400/80 animate-ping" />
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950 border border-white shadow-[0_0_10px_rgba(245,158,11,1)] flex items-center justify-center text-[10px] font-black transform hover:scale-125 transition-transform">
                  <Zap className="w-3 h-3 text-amber-950 fill-amber-300 animate-bounce" />
                </div>
              </div>
            </div>

            {/* 粉色 Princess 邊 */}
            <div 
              className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-pink-400 rounded-r-full transition-all duration-700 flex items-center justify-end pr-2 text-[10px] text-white font-black overflow-hidden relative"
              style={{ width: `${princessPercent}%` }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(-45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:16px_16px] animate-[stripe_2s_linear_infinite]" />
              <span className="relative z-10">{princessPercent > 10 && `${princessPercent}%`}</span>
            </div>
          </div>

          {/* 簡潔自然的中間標示：🔥 對決中 */}
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 px-0.5">
            <span className="text-sky-600 font-black">👦 王子 {princePercent}%</span>
            <span className="flex items-center gap-0.5 text-slate-400 font-bold">
              <Flame className="w-3 h-3 text-amber-500 fill-amber-400" />
              <span>對決中</span>
            </span>
            <span className="text-pink-600 font-black">👧 公主 {princessPercent}%</span>
          </div>
        </div>

      </div>
    </div>
  );
}
