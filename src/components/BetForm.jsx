import React, { useState } from 'react';
import { Send, HeartHandshake, AlertCircle, CheckCircle2, User, MessageCircleHeart, Plus, Minus } from 'lucide-react';

export default function BetForm({ onPlaceBet, isLocked, cutoffDateStr, revealedResult }) {
  const [name, setName] = useState('');
  const [team, setTeam] = useState('prince'); // 'prince' | 'princess'
  const [amount, setAmount] = useState(100);
  const [note, setNote] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const quickAmounts = [100, 200, 300, 500, 1000];

  // 增加金額 (+100)
  const handleIncrease = () => {
    setAmount(prev => prev + 100);
  };

  // 減少金額 (-100, 最少 100)
  const handleDecrease = () => {
    setAmount(prev => (prev > 100 ? prev - 100 : 100));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLocked) {
      alert('目前投注已截止或已揭曉結果，無法再下注囉！');
      return;
    }

    if (!name.trim()) {
      alert('請輸入您的姓名喔！');
      return;
    }

    if (amount < 100 || amount % 100 !== 0) {
      alert('下注金額必須是 100 圓的倍數！');
      return;
    }

    onPlaceBet({
      name,
      team,
      amount,
      note
    });

    setIsSuccess(true);
    setNote('');
    setTimeout(() => setIsSuccess(false), 4000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 mb-6">
      <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-xl border-2 border-white relative overflow-hidden">
        
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gradient-to-tr from-pink-400 to-purple-500 text-white rounded-2xl shadow-md">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">我要下注猜猜看 🎲</h2>
            <p className="text-xs text-slate-500">免登入！100圓為一單位，透過按鈕調整金額</p>
          </div>
        </div>

        {isLocked ? (
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
            <h3 className="text-lg font-black text-amber-900 mb-1">
              {revealedResult ? '🎉 結果已揭曉，停止下注' : '⏰ 下注時間已截止'}
            </h3>
            <p className="text-sm text-amber-700 font-medium">
              感謝大家的參與！請至下方查看最新下注動態與最終揭曉名單！
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 成功下注提示 */}
            {isSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-sm font-bold animate-bounce">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>下注成功！請記得將賭金【付給寶媽】確認完成喔！</span>
              </div>
            )}

            {/* 1. 選擇陣容 */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                1. 選擇你預測的性別 (Team) <span className="text-pink-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* 王子 */}
                <button
                  type="button"
                  onClick={() => setTeam('prince')}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all ${
                    team === 'prince'
                      ? 'bg-sky-500 text-white border-sky-600 shadow-md shadow-sky-200 scale-[1.02]'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-sky-50'
                  }`}
                >
                  <span className="text-2xl">👦</span>
                  <div className="text-left">
                    <div className="font-extrabold text-sm">王子隊 (男寶)</div>
                    <div className={`text-[11px] ${team === 'prince' ? 'text-sky-100' : 'text-slate-500'}`}>帥氣率性小男寶</div>
                  </div>
                </button>

                {/* 公主 */}
                <button
                  type="button"
                  onClick={() => setTeam('princess')}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all ${
                    team === 'princess'
                      ? 'bg-pink-500 text-white border-pink-600 shadow-md shadow-pink-200 scale-[1.02]'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-pink-50'
                  }`}
                >
                  <span className="text-2xl">👧</span>
                  <div className="text-left">
                    <div className="font-extrabold text-sm">公主隊 (女寶)</div>
                    <div className={`text-[11px] ${team === 'princess' ? 'text-pink-100' : 'text-slate-500'}`}>貼心可愛小公主</div>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. 下注人姓名 */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                2. 下注人姓名 (Name) <span className="text-pink-500">*</span>
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="請輸入您的姓名或綽號 (例如: 小王叔叔)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-slate-800 font-semibold text-sm transition-all"
                />
              </div>
            </div>

            {/* 3. 防呆金額選擇加減按鈕區 */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                3. 下注金額 (加減按鈕調整 ‧ 100圓為單位) <span className="text-pink-500">*</span>
              </label>

              {/* 快捷金額選擇按鈕 */}
              <div className="flex flex-wrap gap-2 mb-3">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                      amount === amt
                        ? 'bg-slate-800 text-white border-slate-900 shadow-md scale-105'
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    ${amt} 圓
                  </button>
                ))}
              </div>

              {/* + / - 防呆按鈕大控制列 */}
              <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 border-2 border-slate-200 shadow-inner">
                {/* 減按鈕 */}
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={amount <= 100}
                  className={`flex items-center gap-1 px-4 py-3 rounded-xl font-black text-sm transition-all ${
                    amount <= 100
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-rose-500 hover:bg-rose-600 text-white shadow-md active:scale-95'
                  }`}
                >
                  <Minus className="w-4 h-4 stroke-[3]" />
                  <span>-100</span>
                </button>

                {/* 當前金額卡片 */}
                <div className="text-center px-4">
                  <div className="text-[10px] text-slate-400 font-bold">下注金額</div>
                  <div className="text-3xl font-black text-purple-700 tracking-tight">
                    ${amount} <span className="text-xs font-bold text-slate-500">圓</span>
                  </div>
                </div>

                {/* 加按鈕 */}
                <button
                  type="button"
                  onClick={handleIncrease}
                  className="flex items-center gap-1 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm transition-all shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+100</span>
                </button>
              </div>
            </div>

            {/* 4. 祝福留言 (選填) */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                4. 給寶媽與小元寶的祝福留言 <span className="text-slate-400 font-normal">(選填)</span>
              </label>
              <div className="relative">
                <MessageCircleHeart className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <textarea
                  rows="2"
                  placeholder="寫下一句給小元寶的溫馨祝福吧 (可不填)..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-slate-800 text-sm transition-all resize-none"
                />
              </div>
            </div>

            {/* 送出按鈕 */}
            <button
              type="submit"
              className={`w-full py-3.5 px-6 rounded-2xl font-black text-base text-white shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 ${
                team === 'prince'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-sky-200'
                  : 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-pink-200'
              }`}
            >
              <Send className="w-5 h-5" />
              <span>確認送出下注 (${amount} 圓)</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
