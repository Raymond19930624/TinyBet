import React from 'react';
import { Sparkles, Heart, ShieldCheck, Wifi, WifiOff } from 'lucide-react';

export default function Header({ isConnected, onOpenAdmin }) {
  return (
    <header className="w-full relative text-center pt-4 pb-1">
      {/* 頂部狀態與管理者入口 */}
      <div className="flex items-center justify-between mb-3 text-xs font-semibold">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full shadow-sm text-slate-600 border border-slate-100 text-[11px]">
          {isConnected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span className="text-emerald-700 font-bold">即時連線中</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-amber-700 font-bold">本機連線</span>
            </>
          )}
        </div>

        <button
          onClick={onOpenAdmin}
          className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-full transition-all shadow-sm active:scale-95 text-[11px] font-bold"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>管理者登入</span>
        </button>
      </div>

      {/* 主標題卡片 (精簡不重複顯示提示) */}
      <div className="w-full bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-lg border-2 border-white relative overflow-hidden box-border">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 text-slate-700 text-xs font-bold mb-2 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '8s' }} />
          <span>性別大猜測</span>
          <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 animate-bounce" />
        </div>

        <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-1">
          小元寶性別趴 🍼
        </h1>

        <p className="text-slate-600 text-xs font-medium">
          到底是男寶還是女寶？猜對贏彩金 🎉
        </p>
      </div>
    </header>
  );
}
