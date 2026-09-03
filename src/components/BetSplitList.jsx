import React, { useState } from 'react';
import { CheckCircle2, Clock, Trash2, Heart, Trophy, Sparkles, Crown, Megaphone } from 'lucide-react';
import ToastModal from './ToastModal';

export default function BetSplitList({
  bets,
  myBetIds = [],
  myBetNames = [],
  princeTotal,
  princessTotal,
  grandTotal,
  revealedResult,
  onCancelBet
}) {
  const [activeTab, setActiveTab] = useState('prince');
  
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, betId: null, betName: '', betAmount: 0 });

  const princeBets = bets.filter(b => b.team === 'prince');
  const princessBets = bets.filter(b => b.team === 'princess');

  const calculateWinPayout = (betAmount, teamTotal) => {
    if (!teamTotal || teamTotal === 0 || !grandTotal || grandTotal === 0) return betAmount;
    const ratio = betAmount / teamTotal;
    return Math.round(ratio * grandTotal);
  };

  const handleTriggerCancel = (bet) => {
    setConfirmDialog({
      isOpen: true,
      betId: bet.id,
      betName: bet.name,
      betAmount: bet.amount
    });
  };

  const handleConfirmCancel = () => {
    if (confirmDialog.betId) {
      onCancelBet(confirmDialog.betId);
    }
    setConfirmDialog({ isOpen: false, betId: null, betName: '', betAmount: 0 });
  };

  const renderBetCard = (bet, isPrince) => {
    const cleanName = bet.name ? bet.name.trim() : '';
    const isMine = (myBetIds && myBetIds.includes(bet.id)) || (myBetNames && myBetNames.includes(cleanName));
    
    const teamTotal = isPrince ? princeTotal : princessTotal;
    const winPayout = calculateWinPayout(bet.amount, teamTotal);
    const isWinningTeam = revealedResult === (isPrince ? 'prince' : 'princess');

    return (
      <div
        key={bet.id}
        className={`w-full p-3.5 rounded-2xl transition-all relative box-border ${
          isWinningTeam
            ? 'bg-gradient-to-r from-amber-50/90 via-white to-amber-50/90 border-3 border-amber-500 shadow-md ring-2 ring-amber-300 scale-[1.01]'
            : isMine
            ? 'bg-gradient-to-r from-amber-50/80 via-white to-amber-50/80 border-3 border-amber-600/90 shadow-md shadow-amber-100 ring-3 ring-amber-300/70 scale-[1.01]'
            : isPrince
            ? 'bg-sky-50/70 border-2 border-sky-200'
            : 'bg-pink-50/70 border-2 border-pink-200'
        }`}
      >
        {/* 卡片頂部：姓名與金額 */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base flex-shrink-0">{isPrince ? '👦' : '👧'}</span>
            <span className="font-black text-slate-800 text-sm truncate">{bet.name}</span>
            {isWinningTeam && (
              <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[10px] font-black rounded-full shadow-xs border border-amber-300 flex items-center gap-0.5 flex-shrink-0">
                <Crown className="w-3 h-3 text-yellow-100 fill-yellow-100 animate-bounce" />
                恭喜獲勝
              </span>
            )}
            {isMine && !isWinningTeam && (
              <span className="px-2 py-0.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-[10px] font-black rounded-full shadow-xs border border-amber-400 flex items-center gap-0.5 flex-shrink-0">
                <Sparkles className="w-3 h-3 text-amber-200 fill-amber-200" />
                我的下注
              </span>
            )}
          </div>

          <div className="text-right flex-shrink-0">
            <div className={`text-base font-black ${isMine || isWinningTeam ? 'text-amber-950' : 'text-slate-900'}`}>
              ${Number(bet.amount).toLocaleString('en-US')}
            </div>
          </div>
        </div>

        {/* 獎金估算 Badge */}
        <div className={`mb-1.5 p-1.5 rounded-xl border flex items-center justify-between text-xs ${
          isWinningTeam ? 'bg-amber-100/60 border-amber-400' : isMine ? 'bg-amber-100/40 border-amber-300/80' : 'bg-white/80 border-amber-200/80'
        }`}>
          <span className="text-slate-600 font-bold text-[11px] flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            {isWinningTeam ? '🎉 得彩金:' : '若獲勝可得彩金:'}
          </span>
          <span className="font-black text-amber-800 text-xs">
            ${Number(winPayout).toLocaleString('en-US')}
          </span>
        </div>

        {/* 祝福留言 (若有) */}
        {bet.note && (
          <p className="text-xs text-slate-600 mb-1.5 bg-white/70 p-1.5 rounded-xl border border-slate-100/80 flex items-start gap-1">
            <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400 flex-shrink-0 mt-0.5" />
            <span className="break-all">「{bet.note}」</span>
          </p>
        )}

        {/* 底部：狀態與取消按鈕 */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 text-[10px]">
          <div>
            {bet.isPaid ? (
              <span className="inline-flex items-center gap-0.5 text-emerald-700 font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 已付款 ✅
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-amber-700 font-bold">
                <Clock className="w-3 h-3 text-amber-600 animate-pulse" /> 未付款 ⏳
              </span>
            )}
          </div>

          {/* 取消按鈕 */}
          {isMine && !bet.isPaid && !revealedResult && (
            <button
              onClick={() => handleTriggerCancel(bet)}
              className="px-2 py-0.5 text-rose-600 hover:bg-rose-100/80 rounded-lg transition-all border border-rose-200 flex items-center gap-0.5 font-bold text-[10px]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>取消</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="w-full box-border">
        <div className="w-full bg-white/95 backdrop-blur-md p-4 rounded-3xl shadow-xl border border-white box-border">
          
          {/* 區塊標題 (自然寬度緊湊膠囊包覆，徹底消除右側多餘空白) */}
          <div className="mb-3 pb-2 border-b border-slate-100 flex items-center justify-between gap-1.5 box-border">
            <h2 className="text-[13px] font-black text-slate-800 flex-shrink-0">
              全場即時對決動態牆
            </h2>

            {revealedResult ? (
              <div className={`px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 shadow-sm border border-white animate-bounce flex-shrink-0 ${
                revealedResult === 'prince'
                  ? 'bg-gradient-to-r from-sky-500 via-blue-500 to-amber-500 text-white'
                  : 'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white'
              }`}>
                <Crown className="w-3.5 h-3.5 text-yellow-200 fill-yellow-200" />
                <span>揭曉：{revealedResult === 'prince' ? '👦 王子勝出' : '👧 公主勝出'}！</span>
              </div>
            ) : (
              /* 自然寬度緊湊包覆 inline-flex，消除右側多餘空白 */
              <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200/90 rounded-full px-2 py-0.5 shadow-2xs flex-shrink-0">
                <Megaphone className="w-3 h-3 text-amber-600 flex-shrink-0 animate-bounce" />
                <span className="text-[10px] font-black text-amber-900 tracking-tight whitespace-nowrap">
                  下注後請洽【元寶媽】付款與確認！
                </span>
              </div>
            )}
          </div>

          {/* 雙 Tab 切換按鈕 */}
          <div className="grid grid-cols-2 gap-2 mb-3 w-full">
            <button
              onClick={() => setActiveTab('prince')}
              className={`w-full py-2.5 px-3 rounded-2xl transition-all flex flex-col items-center justify-center border-2 relative box-border ${
                revealedResult === 'prince'
                  ? 'bg-sky-500 text-white border-amber-400 shadow-md shadow-sky-200 scale-[1.01]'
                  : activeTab === 'prince'
                  ? 'bg-sky-500 text-white border-sky-600 shadow-md shadow-sky-200 scale-[1.01]'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-sky-50'
              }`}
            >
              {revealedResult === 'prince' && (
                <span className="absolute -top-2 right-2 px-1.5 py-0.2 bg-amber-400 text-amber-950 text-[9px] font-black rounded-full shadow border border-white">
                  👑 獲勝
                </span>
              )}
              <span className="text-lg leading-none mb-0.5">👦</span>
              <span className="font-extrabold text-xs leading-tight">王子隊</span>
            </button>

            <button
              onClick={() => setActiveTab('princess')}
              className={`w-full py-2.5 px-3 rounded-2xl transition-all flex flex-col items-center justify-center border-2 relative box-border ${
                revealedResult === 'princess'
                  ? 'bg-pink-500 text-white border-amber-400 shadow-md shadow-pink-200 scale-[1.01]'
                  : activeTab === 'princess'
                  ? 'bg-pink-500 text-white border-pink-600 shadow-md shadow-pink-200 scale-[1.01]'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-pink-50'
              }`}
            >
              {revealedResult === 'princess' && (
                <span className="absolute -top-2 right-2 px-1.5 py-0.2 bg-amber-400 text-amber-950 text-[9px] font-black rounded-full shadow border border-white">
                  👑 獲勝
                </span>
              )}
              <span className="text-lg leading-none mb-0.5">👧</span>
              <span className="font-extrabold text-xs leading-tight">公主隊</span>
            </button>
          </div>

          {/* 名單內容卡片 */}
          <div className="w-full">
            {/* 王子隊名單 */}
            {activeTab === 'prince' && (
              <div className="w-full bg-sky-50/50 p-3 rounded-2xl border-2 border-sky-100 box-border animate-fadeIn">
                {princeBets.length === 0 ? (
                  <div className="w-full py-8 text-center text-sky-400 text-xs font-medium border-2 border-dashed border-sky-200/80 rounded-2xl">
                    {revealedResult ? '王子隊目前尚無下注紀錄' : '目前尚無人挺王子隊，快點下注按鈕搶先下注！'}
                  </div>
                ) : (
                  <div className="w-full space-y-2.5 max-h-[420px] overflow-y-auto no-scrollbar">
                    {princeBets.map(b => renderBetCard(b, true))}
                  </div>
                )}
              </div>
            )}

            {/* 公主隊名單 */}
            {activeTab === 'princess' && (
              <div className="w-full bg-pink-50/50 p-3 rounded-2xl border-2 border-pink-100 box-border animate-fadeIn">
                {princessBets.length === 0 ? (
                  <div className="w-full py-8 text-center text-pink-400 text-xs font-medium border-2 border-dashed border-pink-200/80 rounded-2xl">
                    {revealedResult ? '公主隊目前尚無下注紀錄' : '目前尚無人挺公主隊，快點下注按鈕搶先下注！'}
                  </div>
                ) : (
                  <div className="w-full space-y-2.5 max-h-[420px] overflow-y-auto no-scrollbar">
                    {princessBets.map(b => renderBetCard(b, false))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 取消下注 Confirm 浮窗 */}
      <ToastModal
        isOpen={confirmDialog.isOpen}
        type="confirm"
        title="取消下注確認"
        message={`確定要取消您「${confirmDialog.betName}」這筆 $${Number(confirmDialog.betAmount).toLocaleString('en-US')} 的下注嗎？`}
        confirmText="確定取消"
        cancelText="保留下注"
        onConfirm={handleConfirmCancel}
        onCancel={() => setConfirmDialog({ isOpen: false, betId: null, betName: '', betAmount: 0 })}
      />
    </>
  );
}
