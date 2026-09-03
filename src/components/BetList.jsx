import React, { useState } from 'react';
import { ListOrdered, CheckCircle2, Clock, Trash2, Heart, MessageSquare } from 'lucide-react';

export default function BetList({ bets, myBetIds, onCancelBet }) {
  const [filterTeam, setFilterTeam] = useState('all'); // 'all' | 'prince' | 'princess'

  const filteredBets = bets.filter(b => {
    if (filterTeam === 'all') return true;
    return b.team === filterTeam;
  });

  // 格式化 24 小時制時間 (YYYY/MM/DD HH:mm:ss)
  const format24hTime = (isoString) => {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 mb-12">
      <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white">
        
        {/* 頂部標題與篩選按鈕 */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-800 text-white rounded-2xl">
              <ListOrdered className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">全場即時下注動態 🎯</h2>
              <p className="text-xs text-slate-500">即時公開透明 ‧ 所有人同步可見</p>
            </div>
          </div>

          {/* 篩選標籤 */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setFilterTeam('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterTeam === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              全部 ({bets.length})
            </button>
            <button
              onClick={() => setFilterTeam('prince')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterTeam === 'prince' ? 'bg-sky-500 text-white shadow-sm' : 'text-sky-700 hover:bg-sky-50'
              }`}
            >
              👦 王子 ({bets.filter(b => b.team === 'prince').length})
            </button>
            <button
              onClick={() => setFilterTeam('princess')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterTeam === 'princess' ? 'bg-pink-500 text-white shadow-sm' : 'text-pink-700 hover:bg-pink-50'
              }`}
            >
              👧 公主 ({bets.filter(b => b.team === 'princess').length})
            </button>
          </div>
        </div>

        {/* 列表內容 */}
        {filteredBets.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-medium">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>目前尚無下注紀錄，快來搶先成為第一位下注者吧！</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBets.map((bet) => {
              const isMine = myBetIds.includes(bet.id);
              const isPrince = bet.team === 'prince';

              return (
                <div
                  key={bet.id}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isPrince
                      ? 'bg-sky-50/40 border-sky-100 hover:border-sky-300'
                      : 'bg-pink-50/40 border-pink-100 hover:border-pink-300'
                  } ${isMine ? 'ring-2 ring-purple-400 ring-offset-1' : ''}`}
                >
                  {/* 左邊：頭像與下注資訊 */}
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 border-2 ${
                      isPrince ? 'bg-sky-100 border-sky-200' : 'bg-pink-100 border-pink-200'
                    }`}>
                      {isPrince ? '👦' : '👧'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-slate-800 text-base">{bet.name}</span>
                        
                        {/* 陣容 Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isPrince ? 'bg-sky-500 text-white' : 'bg-pink-500 text-white'
                        }`}>
                          {isPrince ? '押王子 (男寶)' : '押公主 (女寶)'}
                        </span>

                        {/* 是否自己下注的標籤 */}
                        {isMine && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-black rounded-md border border-purple-200">
                            我的手機下注
                          </span>
                        )}
                      </div>

                      {/* 留言 (可有可無) */}
                      {bet.note && (
                        <p className="text-xs text-slate-600 mt-1 bg-white/70 p-2 rounded-xl border border-slate-100 flex items-center gap-1.5">
                          <Heart className="w-3.5 h-3.5 text-pink-400 flex-shrink-0 fill-pink-400" />
                          <span>「{bet.note}」</span>
                        </p>
                      )}

                      <div className="text-[11px] text-slate-400 mt-1">
                        下注時間 (24H)：{format24hTime(bet.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* 右邊：金額、付款狀態、取消按鈕 */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-slate-200/50">
                    <div className="text-right">
                      <div className="text-lg font-black text-slate-900">
                        ${bet.amount} <span className="text-xs font-normal text-slate-500">圓</span>
                      </div>

                      {/* 付款狀態 Badge */}
                      <div className="mt-0.5">
                        {bet.isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            已付款 ✅
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                            未付款 ⏳
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 自己取消按鈕 (未付款狀態) */}
                    {isMine && !bet.isPaid && (
                      <button
                        onClick={() => {
                          if (confirm(`確定要取消您「${bet.name}」這筆 $${bet.amount} 的下注嗎？`)) {
                            onCancelBet(bet.id);
                          }
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-rose-200 flex items-center gap-1 text-xs font-bold active:scale-95"
                        title="取消未付款的下注"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">取消</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
