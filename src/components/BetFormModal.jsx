import React, { useState } from 'react';
import { Send, HeartHandshake, AlertCircle, User, MessageCircleHeart, Plus, Minus, X, Trophy, Sparkles } from 'lucide-react';
import ToastModal from './ToastModal';

export default function BetFormModal({
  isOpen,
  onClose,
  onPlaceBet,
  isLocked,
  princeTotal,
  princessTotal,
  grandTotal,
  revealedResult
}) {
  const [name, setName] = useState('');
  const [team, setTeam] = useState('prince');
  const [amount, setAmount] = useState(100);
  const [note, setNote] = useState('');

  const [toast, setToast] = useState({ isOpen: false, title: '', message: '', type: 'warning' });

  if (!isOpen) return null;

  const quickAmounts = [100, 200, 300, 500, 1000];

  const handleIncrease = () => {
    setAmount(prev => prev + 100);
  };

  const handleDecrease = () => {
    setAmount(prev => (prev > 100 ? prev - 100 : 100));
  };

  const currentTeamTotal = team === 'prince' ? princeTotal : princessTotal;
  const newTeamTotal = currentTeamTotal + amount;
  const newGrandTotal = grandTotal + amount;
  const myRatio = amount / newTeamTotal;
  const estimatedWinPayout = Math.round(myRatio * newGrandTotal);
  const returnRatePercent = Math.round(((estimatedWinPayout - amount) / amount) * 100);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLocked) {
      setToast({
        isOpen: true,
        title: '無法下注',
        message: '目前投注已截止或已揭曉結果，無法再下注囉！',
        type: 'warning'
      });
      return;
    }

    if (!name.trim()) {
      setToast({
        isOpen: true,
        title: '請填寫姓名',
        message: '請輸入您的姓名或暱稱才可以送出下注喔！',
        type: 'warning'
      });
      return;
    }

    if (amount < 100 || amount % 100 !== 0) {
      setToast({
        isOpen: true,
        title: '金額錯誤',
        message: '下注金額必須是 100 的倍數！',
        type: 'warning'
      });
      return;
    }

    // 1. 送出下注
    onPlaceBet({
      name,
      team,
      amount,
      note
    });

    // 2. 清空欄位並【立刻關閉表單 Modal】不留在原本畫面！
    setNote('');
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-md w-full p-4 shadow-2xl border-2 border-white relative max-h-[90vh] flex flex-col overflow-hidden">
          
          {/* 關閉按鈕 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* 標題 */}
          <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-100">
            <div className="p-2 bg-gradient-to-tr from-pink-400 to-purple-500 text-white rounded-2xl shadow-md">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">下注猜猜看 🎲</h2>
              <p className="text-xs text-slate-500">100為一單位 ‧ 點加減按鈕調整金額</p>
            </div>
          </div>

          {isLocked ? (
            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center my-auto">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
              <h3 className="text-lg font-black text-amber-900 mb-1">
                {revealedResult ? '🎉 結果已揭曉，停止下注' : '⏰ 下注時間已截止'}
              </h3>
              <p className="text-sm text-amber-700 font-medium mb-4">
                感謝大家的參與！請觀看最新動態與揭曉名單！
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-800 text-white font-bold rounded-xl text-sm"
              >
                關閉視窗
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar pr-1 space-y-3">
              
              {/* 1. 選擇陣容 */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  1. 選擇你預測的陣營 <span className="text-pink-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {/* 王子 */}
                  <button
                    type="button"
                    onClick={() => setTeam('prince')}
                    className={`p-2.5 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all ${
                      team === 'prince'
                        ? 'bg-sky-500 text-white border-sky-600 shadow-md shadow-sky-200 scale-[1.01]'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-sky-50'
                    }`}
                  >
                    <span className="text-lg">👦</span>
                    <div className="text-left">
                      <div className="font-extrabold text-xs">王子隊</div>
                      <div className={`text-[10px] ${team === 'prince' ? 'text-sky-100' : 'text-slate-500'}`}>帥氣小男寶</div>
                    </div>
                  </button>

                  {/* 公主 */}
                  <button
                    type="button"
                    onClick={() => setTeam('princess')}
                    className={`p-2.5 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all ${
                      team === 'princess'
                        ? 'bg-pink-500 text-white border-pink-600 shadow-md shadow-pink-200 scale-[1.01]'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-pink-50'
                    }`}
                  >
                    <span className="text-lg">👧</span>
                    <div className="text-left">
                      <div className="font-extrabold text-xs">公主隊</div>
                      <div className={`text-[10px] ${team === 'princess' ? 'text-pink-100' : 'text-slate-500'}`}>可愛小女寶</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. 下注人姓名 */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  2. 下注人姓名 (Name) <span className="text-pink-500">*</span>
                </label>
                <div className="relative mb-1">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="請輸入您的姓名或暱稱"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-2xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-slate-800 font-semibold text-xs transition-all"
                  />
                </div>
                <p className="text-[10px] text-purple-600 font-bold flex items-center gap-1 pl-1">
                  <Sparkles className="w-3 h-3 text-purple-500 flex-shrink-0" />
                  <span>建議加上稱謂更獨特喔！（例如：大叔小明、二姑小美）</span>
                </p>
              </div>

              {/* 3. 金額選擇 */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  3. 下注金額 <span className="text-pink-500">*</span>
                </label>

                {/* 快捷金額 */}
                <div className="grid grid-cols-5 gap-1 mb-2 w-full">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt)}
                      className={`py-1.5 px-0.5 rounded-xl text-[11px] font-extrabold transition-all border text-center ${
                        amount === amt
                          ? 'bg-slate-800 text-white border-slate-900 shadow scale-105'
                          : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      ${Number(amt).toLocaleString('en-US')}
                    </button>
                  ))}
                </div>

                {/* + / - 按鈕 */}
                <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 border-2 border-slate-200">
                  <button
                    type="button"
                    onClick={handleDecrease}
                    disabled={amount <= 100}
                    className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl font-black text-xs transition-all ${
                      amount <= 100
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-rose-500 hover:bg-rose-600 text-white shadow active:scale-95'
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>100</span>
                  </button>

                  <div className="text-center px-3">
                    <div className="text-xl font-black text-purple-700">
                      ${Number(amount).toLocaleString('en-US')}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleIncrease}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs transition-all shadow active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>100</span>
                  </button>
                </div>
              </div>

              {/* ⚡ 預估獲勝彩金 */}
              <div className="p-2.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200/80 shadow-xs flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-black text-amber-900 flex items-center gap-1 truncate">
                    <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-400 flex-shrink-0" />
                    <span>若預測【{team === 'prince' ? '👦 王子隊' : '👧 公主隊'}】勝出</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold mt-0.5">
                    投報率 {returnRatePercent >= 0 ? `+${returnRatePercent}%` : `${returnRatePercent}%`} ‧ 預估可拿獎金
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-base font-black text-amber-800">
                    ${Number(estimatedWinPayout).toLocaleString('en-US')}
                  </div>
                </div>
              </div>

              {/* 4. 祝福留言 */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  4. 祝福留言 <span className="text-slate-400 font-normal">(選填)</span>
                </label>
                <div className="relative">
                  <MessageCircleHeart className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="寫下一句給小元寶的溫馨祝福吧 (選填)..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-2xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-slate-800 text-xs transition-all"
                  />
                </div>
              </div>

              {/* 送出按鈕 */}
              <button
                type="submit"
                className={`w-full py-2.5 px-4 rounded-2xl font-black text-sm text-white shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-98 ${
                  team === 'prince'
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-sky-200'
                    : 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-pink-200'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>確認送出下注 (${Number(amount).toLocaleString('en-US')})</span>
              </button>
            </form>
          )}

        </div>
      </div>

      {/* 提示浮窗 */}
      <ToastModal
        isOpen={toast.isOpen}
        type="confirm"
        title={toast.title}
        message={toast.message}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
