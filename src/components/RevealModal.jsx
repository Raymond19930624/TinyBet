import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, PartyPopper, X, Award } from 'lucide-react';

export default function RevealModal({ revealedResult, bets, grandTotal, onClose }) {
  if (!revealedResult) return null;

  const isPrinceWinner = revealedResult === 'prince';
  const winningTeamName = isPrinceWinner ? '👦 王子隊' : '👧 公主隊';

  const winners = bets.filter(b => b.team === revealedResult);
  const winnersTotalPaidAmount = winners.reduce((sum, b) => sum + b.amount, 0);

  useEffect(() => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: isPrinceWinner ? ['#38bdf8', '#0284c7', '#ffffff'] : ['#f472b6', '#ec4899', '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: isPrinceWinner ? ['#38bdf8', '#0284c7', '#ffffff'] : ['#f472b6', '#ec4899', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, [revealedResult, isPrinceWinner]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border-4 border-amber-300 relative overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* 關閉按鈕 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 頂部標題 */}
        <div className="text-center pt-2 pb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 font-black rounded-full text-xs mb-2">
            <Trophy className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>性別大揭曉 ‧ 得獎名單</span>
          </div>

          <h2 className="text-2xl font-black text-slate-800 flex items-center justify-center gap-2">
            <PartyPopper className="w-6 h-6 text-pink-500 animate-bounce" />
            <span>揭曉結果是...</span>
          </h2>

          {/* 獲勝方大卡片 */}
          <div className={`my-3 p-4 rounded-3xl border-4 text-center shadow-lg transform transition-transform hover:scale-105 ${
            isPrinceWinner ? 'bg-sky-500 border-sky-300 text-white shadow-sky-200' : 'bg-pink-500 border-pink-300 text-white shadow-pink-200'
          }`}>
            <div className="text-5xl mb-1">{isPrinceWinner ? '👦' : '👧'}</div>
            <div className="text-2xl font-black">{winningTeamName} 勝出！🎉</div>
            <p className="text-xs font-medium mt-1 text-white/90">恭喜所有猜中的得獎好朋友！</p>
          </div>

          {/* 獎金池統計 */}
          <div className="grid grid-cols-2 gap-2 text-left mb-3">
            <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-[10px] text-slate-400 font-bold">總獎金池 Total Pool</div>
              <div className="text-base font-black text-slate-800">${Number(grandTotal).toLocaleString('en-US')}</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-[10px] text-slate-400 font-bold">獲勝組總金額</div>
              <div className="text-base font-black text-slate-800">${Number(winnersTotalPaidAmount).toLocaleString('en-US')}</div>
            </div>
          </div>
        </div>

        {/* 得獎名單列表 */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Award className="w-4 h-4 text-amber-500" />
            獲勝得獎者清單 ({winners.length} 人次)
          </h3>

          {winners.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs">
              哎呀！竟然沒有人下注猜中～
            </div>
          ) : (
            winners.map((winner, idx) => {
              const winRatio = winnersTotalPaidAmount > 0 ? (winner.amount / winnersTotalPaidAmount) : 0;
              const estimatedPayout = Math.round(grandTotal * winRatio);

              return (
                <div
                  key={winner.id || idx}
                  className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center flex-shrink-0 shadow">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-800 text-xs">{winner.name}</div>
                      {winner.note && (
                        <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                          「{winner.note}」
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-500">下注 ${Number(winner.amount).toLocaleString('en-US')}</div>
                    <div className="text-xs font-black text-amber-700">
                      獲獎: <strong className="text-sm text-amber-900">${Number(estimatedPayout).toLocaleString('en-US')}</strong>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 底部按鈕 */}
        <div className="pt-3 mt-2 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-2xl transition-all shadow active:scale-98"
          >
            收起名單
          </button>
        </div>

      </div>
    </div>
  );
}
