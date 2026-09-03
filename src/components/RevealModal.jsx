import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, X, Heart, Medal } from 'lucide-react';

export default function RevealModal({
  revealedResult,
  bets = [],
  grandTotal = 0,
  onClose
}) {
  const isPrince = revealedResult === 'prince';

  useEffect(() => {
    // 觸發全螢幕繽紛彩帶與爆竹煙火效果
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: isPrince ? ['#0284c7', '#38bdf8', '#fbbf24', '#ffffff'] : ['#ec4899', '#f472b6', '#fbbf24', '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: isPrince ? ['#0284c7', '#38bdf8', '#fbbf24', '#ffffff'] : ['#ec4899', '#f472b6', '#fbbf24', '#ffffff']
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, [revealedResult, isPrince]);

  const winningBets = bets.filter(b => b.team === revealedResult);
  const winningTeamTotal = winningBets.reduce((acc, b) => acc + Number(b.amount || 0), 0);

  const calculateWinPayout = (betAmount) => {
    if (!winningTeamTotal || winningTeamTotal === 0 || !grandTotal || grandTotal === 0) return betAmount;
    const ratio = betAmount / winningTeamTotal;
    return Math.round(ratio * grandTotal);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn box-border">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border-4 border-amber-300 relative box-border overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* 關閉按鈕 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 頂部勝出廣播卡片 */}
        <div className={`p-6 rounded-3xl text-white text-center shadow-xl relative overflow-hidden mb-4 box-border border-2 ${
          isPrince
            ? 'bg-gradient-to-tr from-sky-500 via-blue-500 to-indigo-600 border-sky-300 shadow-sky-200'
            : 'bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 border-pink-300 shadow-pink-200'
        }`}>
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
            <span>性別大猜測 ‧ 得獎名單</span>
          </div>

          <h3 className="text-sm font-bold text-white/90 mb-1 flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
            <span>揭曉結果是...</span>
          </h3>

          {/* 中央大頭像 */}
          <div className="text-6xl mb-2 animate-bounce">
            {isPrince ? '👦' : '👧'}
          </div>

          {/* 移除重複的小頭像，簡化為標題 */}
          <h2 className="text-2xl font-black tracking-tight mb-1 flex items-center justify-center gap-2">
            <span>{isPrince ? '王子隊 勝出！ 🎉' : '公主隊 勝出！ 🎉'}</span>
          </h2>

          <p className="text-xs text-white/90 font-semibold">
            恭喜所有猜中的得獎好朋友！
          </p>
        </div>

        {/* 獎金數據卡 */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="text-[10px] font-bold text-slate-400">總獎金池 Total Pool</div>
            <div className="text-lg font-black text-slate-800">${Number(grandTotal).toLocaleString('en-US')}</div>
          </div>
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
            <div className="text-[10px] font-bold text-amber-700">勝出隊總金額</div>
            <div className="text-lg font-black text-amber-900">${Number(winningTeamTotal).toLocaleString('en-US')}</div>
          </div>
        </div>

        {/* 得獎名單列表 */}
        <div className="flex-1 overflow-y-auto no-scrollbar pr-1 space-y-2 mb-4">
          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>獲得彩金得勝者清單 ({winningBets.length} 人次)</span>
          </h4>

          {winningBets.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-400 font-medium">
              可惜！勝出陣營目前無人下注
            </div>
          ) : (
            winningBets.map((bet, idx) => {
              const payout = calculateWinPayout(bet.amount);
              return (
                <div
                  key={bet.id}
                  className="p-3 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/80 rounded-2xl border-2 border-amber-300/80 flex items-center justify-between shadow-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                      #{idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-xs text-slate-800 truncate">{bet.name}</div>
                      {bet.note && <div className="text-[10px] text-slate-400 truncate">「{bet.note}」</div>}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-[10px] text-slate-400 font-bold">下注 ${Number(bet.amount).toLocaleString('en-US')}</div>
                    <div className="text-xs font-black text-amber-800">獨得: ${Number(payout).toLocaleString('en-US')}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 關閉按鈕 */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-black text-sm rounded-2xl shadow-lg transition-all active:scale-98"
        >
          收起名單
        </button>

      </div>
    </div>
  );
}
