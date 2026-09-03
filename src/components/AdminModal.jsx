import React, { useState } from 'react';
import { ShieldCheck, Download, Trash2, Calendar, Lock, CheckCircle2, X, RefreshCw, AlertTriangle, Sparkles, Copy, RotateCcw } from 'lucide-react';
import { exportBetsToCsv } from '../lib/exportCsv';
import ToastModal from './ToastModal';

export default function AdminModal({
  isOpen,
  onClose,
  bets,
  config,
  onTogglePayment,
  onDeleteBet,
  onSetCutoff,
  onSetRevealDate,
  onSetReveal,
  onResetReveal,
  onResetAll,
  onTestPushNotification,
  onTestRevealEffect
}) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminAuthPassword, setAdminAuthPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [easterEggDialog, setEasterEggDialog] = useState(false);

  // 時間選擇器浮窗 (模式: 'cutoff' | 'reveal' | null)
  const [pickerMode, setPickerMode] = useState(null);
  const [tempDate, setTempDate] = useState('');

  // 多重防呆重置全站 Modal 狀態
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState('');

  // 🌟 專屬防呆重置性別揭曉 Modal 狀態 (保留下注資料)
  const [isResetRevealModalOpen, setIsResetRevealModalOpen] = useState(false);
  const [resetRevealConfirmInput, setResetRevealConfirmInput] = useState('');

  // 通用 Toast 浮窗
  const [toast, setToast] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === '17218') {
      setIsAuthenticated(true);
      setAdminAuthPassword('17218');
      setPasswordError('');
    } else if (password === '19881102') {
      setEasterEggDialog(true);
      setPassword('');
    } else {
      setPasswordError('密碼錯誤！請重新輸入喔！');
    }
  };

  const activeAuthPassword = adminAuthPassword || '17218';

  const handleSetShortcut = (shortcutType) => {
    let dateStr = '';
    if (shortcutType === '5_1700') {
      dateStr = '2026-09-05T17:00:00+08:00';
    } else if (shortcutType === '5_1730') {
      dateStr = '2026-09-05T17:30:00+08:00';
    }

    if (dateStr) {
      if (pickerMode === 'cutoff') {
        onSetCutoff(dateStr, activeAuthPassword);
        setToast({ isOpen: true, title: '時間已更新', message: '下注截止時間已成功調整！', type: 'success' });
      } else if (pickerMode === 'reveal') {
        onSetRevealDate(dateStr, activeAuthPassword);
        setToast({ isOpen: true, title: '時間已更新', message: '性別揭曉時間已成功調整！', type: 'success' });
      }
      setPickerMode(null);
    }
  };

  const handleSetCustomDate = () => {
    if (!tempDate) return;
    const formatted = new Date(tempDate).toISOString();

    if (pickerMode === 'cutoff') {
      onSetCutoff(formatted, activeAuthPassword);
      setToast({ isOpen: true, title: '時間已更新', message: '自訂截止時間已成功更新！', type: 'success' });
    } else if (pickerMode === 'reveal') {
      onSetRevealDate(formatted, activeAuthPassword);
      setToast({ isOpen: true, title: '時間已更新', message: '自訂揭曉時間已成功更新！', type: 'success' });
    }
    setPickerMode(null);
  };

  const handleExportCsv = () => {
    exportBetsToCsv(bets, (title, message, type) => {
      setToast({ isOpen: true, title, message, type });
    });
  };

  const handleTriggerDeleteBet = (bet) => {
    setToast({
      isOpen: true,
      title: '刪除下注確認',
      message: `確定要刪除「${bet.name}」這筆 $${Number(bet.amount).toLocaleString('en-US')} 的下注嗎？`,
      type: 'confirm',
      onConfirm: () => {
        onDeleteBet(bet.id, activeAuthPassword);
      }
    });
  };

  const handleTriggerReveal = (teamResult, teamName) => {
    setToast({
      isOpen: true,
      title: '設定揭曉結果',
      message: `確定要設定最終勝出者為【${teamName}】嗎？設定後將鎖定投注並展現勝出恭喜畫面！`,
      type: 'confirm',
      onConfirm: () => {
        onSetReveal(teamResult, activeAuthPassword);
        onClose();
      }
    });
  };

  // 執行重置性別揭曉 (防呆)
  const handleExecuteResetReveal = () => {
    if (resetRevealConfirmInput.trim() !== '重置揭曉') return;

    if (onResetReveal) {
      onResetReveal(activeAuthPassword);
    }
    setIsResetRevealModalOpen(false);
    setResetRevealConfirmInput('');
    setToast({
      isOpen: true,
      title: '揭曉狀態已重置',
      message: '性別揭曉狀態已成功還原為未揭曉！【下注資料 100% 完整保留】！',
      type: 'success'
    });
  };

  // 執行重置全站下注 (防呆)
  const handleExecuteResetAll = () => {
    if (resetConfirmInput.trim() !== '重置') return;

    onResetAll(activeAuthPassword);
    setIsResetModalOpen(false);
    setResetConfirmInput('');
    setToast({
      isOpen: true,
      title: '全站已重置',
      message: '全場下注資料與揭曉狀態已成功重置歸零！',
      type: 'success'
    });
  };

  const handleCopyAndFillResetText = () => {
    setResetConfirmInput('重置');
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText('重置');
      }
    } catch {}
  };

  const handleCopyAndFillResetRevealText = () => {
    setResetRevealConfirmInput('重置揭曉');
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText('重置揭曉');
      }
    } catch {}
  };

  const formatDisplayTime = (isoString) => {
    if (!isoString) return '未設定';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch {
      return isoString;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border-2 border-white relative max-h-[90vh] flex flex-col overflow-hidden">
          
          {/* 關閉按鈕 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* 標題 */}
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <div className="p-2 bg-slate-800 text-amber-400 rounded-2xl shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">管理者控制中心 🔐</h2>
              <p className="text-xs text-slate-500">性別趴主辦人專用控制台</p>
            </div>
          </div>

          {!isAuthenticated ? (
            /* 登入表單 */
            <form onSubmit={handleLogin} className="space-y-4 py-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  請輸入管理者密碼
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="提示：19881102"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-slate-200 focus:border-slate-800 focus:ring-2 focus:ring-slate-100 outline-none text-slate-800 font-black text-sm transition-all"
                  />
                </div>
                {passwordError && (
                  <p className="text-xs text-rose-500 font-bold mt-1.5 pl-1">{passwordError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-black text-sm rounded-2xl shadow-lg transition-all active:scale-98"
              >
                解鎖控制台 🔓
              </button>
            </form>
          ) : (
            /* 已登入控制面板 */
            <div className="flex-1 overflow-y-auto no-scrollbar pr-1 space-y-4">
              
              {/* 1. 時間管理區 */}
              <div className="space-y-2">
                {/* 1-1 下注截止時間 */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      <span>截止時間:</span>
                      <span className="font-black text-slate-900">{formatDisplayTime(config.cutoffDate)}</span>
                    </div>
                    <button
                      onClick={() => setPickerMode('cutoff')}
                      className="px-2.5 py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-black rounded-xl transition-all shadow-xs"
                    >
                      調整截止時間
                    </button>
                  </div>
                </div>

                {/* 1-2 性別揭曉時間 */}
                <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-200/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>揭曉時間:</span>
                      <span className="font-black text-purple-950">{formatDisplayTime(config.revealDate)}</span>
                    </div>
                    <button
                      onClick={() => setPickerMode('reveal')}
                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-xl transition-all shadow-xs"
                    >
                      調整揭曉時間
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. 揭曉結果設定 ＆ 獨立重置揭曉按鈕 (防呆) */}
              <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/80 space-y-2.5">
                <label className="block text-xs font-black text-amber-900 uppercase tracking-wider">
                  🎉 性別揭曉結果 (目前: {config.revealedResult === 'prince' ? '👦 王子隊' : config.revealedResult === 'princess' ? '👧 公主隊' : '未揭曉'})
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleTriggerReveal('prince', '👦 王子隊')}
                    className={`py-2 px-3 rounded-xl font-black text-xs transition-all border ${
                      config.revealedResult === 'prince'
                        ? 'bg-sky-500 text-white border-sky-600 shadow'
                        : 'bg-white text-sky-700 border-sky-200 hover:bg-sky-50'
                    }`}
                  >
                    👦 王子隊
                  </button>

                  <button
                    onClick={() => handleTriggerReveal('princess', '👧 公主隊')}
                    className={`py-2 px-3 rounded-xl font-black text-xs transition-all border ${
                      config.revealedResult === 'princess'
                        ? 'bg-pink-500 text-white border-pink-600 shadow'
                        : 'bg-white text-pink-700 border-pink-200 hover:bg-pink-50'
                    }`}
                  >
                    👧 公主隊
                  </button>
                </div>

                {/* 🔄 獨立重置性別揭曉按鈕 (只重置揭曉，100% 保留下注) */}
                {config.revealedResult && (
                  <button
                    onClick={() => {
                      setResetRevealConfirmInput('');
                      setIsResetRevealModalOpen(true);
                    }}
                    className="w-full py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1 active:scale-98"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-800" />
                    <span>重置性別揭曉 (100% 保留下注資料)</span>
                  </button>
                )}
              </div>

              {/* 3. 匯出 Excel 報表 */}
              <div>
                <button
                  onClick={handleExportCsv}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>匯出下注報表 (CSV/Excel)</span>
                </button>
              </div>

              {/* 4. 下注清單管理與勾選付款 */}
              <div>
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  全場下注勾選付款與管理 ({bets.length}筆)
                </h3>

                {bets.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400 font-medium">
                    目前尚無下注資料
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar pr-1">
                    {bets.map((bet) => (
                      <div
                        key={bet.id}
                        className="p-2.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-xs">{bet.team === 'prince' ? '👦' : '👧'}</span>
                            <span className="font-bold text-xs text-slate-800 truncate">{bet.name}</span>
                            <span className="font-black text-xs text-slate-900">${Number(bet.amount).toLocaleString('en-US')}</span>
                          </div>
                          {bet.note && <p className="text-[10px] text-slate-400 truncate">「{bet.note}」</p>}
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          {/* 付款切換 */}
                          <button
                            onClick={() => onTogglePayment(bet.id, !bet.isPaid, activeAuthPassword)}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition-all border ${
                              bet.isPaid
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                          >
                            {bet.isPaid ? '已收錢 ✅' : '未收錢 ⏳'}
                          </button>

                          {/* 刪除下注 */}
                          <button
                            onClick={() => handleTriggerDeleteBet(bet)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                            title="刪除此下注"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. 🚨 多重防呆一鍵重置全站區域 */}
              <div className="pt-3 border-t border-slate-200">
                <button
                  onClick={() => {
                    setResetConfirmInput('');
                    setIsResetModalOpen(true);
                  }}
                  className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-200 font-black text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5 active:scale-98 shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-rose-600" />
                  <span>一鍵重置全站下注與揭曉 (多重防呆)</span>
                </button>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* 獨立跳出式「時間選擇器浮窗」 */}
      {pickerMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border-2 border-white relative box-border">
            <button
              onClick={() => setPickerMode(null)}
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-800 mb-1 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>{pickerMode === 'cutoff' ? '調整下注截止時間' : '調整性別揭曉時間'}</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {pickerMode === 'cutoff' ? '設定後時間一到自動停止下注' : '設定性別趴現場的公佈揭曉時間'}
            </p>

            {/* 快捷點擊 */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => handleSetShortcut('5_1700')}
                className="py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-extrabold text-xs rounded-2xl transition-all text-center"
              >
                2026/09/05 17:00
              </button>
              <button
                onClick={() => handleSetShortcut('5_1730')}
                className="py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-extrabold text-xs rounded-2xl transition-all text-center"
              >
                2026/09/05 17:30
              </button>
            </div>

            {/* 自訂時間 */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <label className="block text-xs font-black text-slate-700">自訂精確時間:</label>
              <input
                type="datetime-local"
                value={tempDate}
                onChange={(e) => setTempDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleSetCustomDate}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs rounded-2xl shadow-md transition-all"
              >
                確認更新時間
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔄 專屬防呆「重置性別揭曉」確認彈窗 (100% 保留下注資料) */}
      {isResetRevealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border-2 border-amber-200 relative box-border">
            <button
              onClick={() => setIsResetRevealModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3 text-amber-600">
              <RotateCcw className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
              <h3 className="text-base font-black text-slate-800">重置性別揭曉確認 (防呆)</h3>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 font-bold mb-4 space-y-1">
              <p>⚠️ 此操作僅會將揭曉狀態還原為『未揭曉』，並重新開放倒數與下注。</p>
              <p className="text-emerald-700 font-black">✅ 全場所有親友的下注紀錄與付款狀態【100% 完整保留】！</p>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-700">
                  請點擊
                  <button
                    type="button"
                    onClick={handleCopyAndFillResetRevealText}
                    className="inline-flex items-center gap-0.5 mx-1 px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-black rounded-lg transition-all active:scale-95 cursor-pointer text-xs"
                    title="點擊自動帶入"
                  >
                    <Copy className="w-3 h-3" />
                    <span>【重置揭曉】</span>
                  </button>
                  確認：
                </label>
              </div>

              <input
                type="text"
                placeholder="請點擊上方『重置揭曉』鍵帶入"
                value={resetRevealConfirmInput}
                onChange={(e) => setResetRevealConfirmInput(e.target.value)}
                className="w-full px-3 py-2 border-2 border-slate-200 focus:border-amber-500 rounded-2xl text-xs font-black text-slate-800 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsResetRevealModalOpen(false)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-2xl transition-all"
              >
                取消保留
              </button>
              <button
                onClick={handleExecuteResetReveal}
                disabled={resetRevealConfirmInput.trim() !== '重置揭曉'}
                className={`py-2.5 font-black text-xs rounded-2xl shadow-md transition-all ${
                  resetRevealConfirmInput.trim() === '重置揭曉'
                    ? 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer scale-102'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                確認重置揭曉 🔄
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🚨 獨立跳出式「多重防呆重置全站確認彈窗」 */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border-2 border-rose-100 relative box-border">
            <button
              onClick={() => setIsResetModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
              <h3 className="text-base font-black text-slate-800">危險！多重防呆重置全站</h3>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 font-bold mb-4 space-y-1">
              <p>⚠️ 此操作將全數清空全場所有的下注紀錄，並還原揭曉狀態為未揭曉！</p>
              <p className="text-rose-600 font-black">❌ 此動作無法復原！</p>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-700">
                  請輸入或點擊
                  <button
                    type="button"
                    onClick={handleCopyAndFillResetText}
                    className="inline-flex items-center gap-0.5 mx-1 px-2 py-0.5 bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-300 font-black rounded-lg transition-all active:scale-95 cursor-pointer text-xs"
                    title="點擊自動複製並帶入"
                  >
                    <Copy className="w-3 h-3" />
                    <span>【重置】</span>
                  </button>
                  確認：
                </label>
              </div>

              <input
                type="text"
                placeholder="請輸入或點擊上方『重置』鍵帶入"
                value={resetConfirmInput}
                onChange={(e) => setResetConfirmInput(e.target.value)}
                className="w-full px-3 py-2 border-2 border-slate-200 focus:border-rose-500 rounded-2xl text-xs font-black text-slate-800 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-2xl transition-all"
              >
                取消保留
              </button>
              <button
                onClick={handleExecuteResetAll}
                disabled={resetConfirmInput.trim() !== '重置'}
                className={`py-2.5 font-black text-xs rounded-2xl shadow-md transition-all ${
                  resetConfirmInput.trim() === '重置'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer scale-102'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                確認全站重置 🚨
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 超嗆超幽默彩蛋彈窗 */}
      {easterEggDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xs w-full p-5 shadow-2xl border-2 border-rose-300 text-center">
            <span className="text-5xl mb-2 block animate-bounce">🤡</span>
            <h3 className="text-base font-black text-slate-900 mb-1">哈哈哈抓到了！你還真信提示啊？</h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed font-semibold">
              這個密碼是專門釣你們這種想亂搞的小聰明的 😜！<br/>
              想要後台控制權？乖乖去找元寶媽跪求真實密碼啦！
            </p>
            <button
              onClick={() => setEasterEggDialog(false)}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-black rounded-xl text-xs shadow-md active:scale-95 transition-all"
            >
              可惡 被嗆到了 哈哈 🤪
            </button>
          </div>
        </div>
      )}

      {/* 通用 Toast 浮窗 */}
      <ToastModal
        isOpen={toast.isOpen}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onConfirm={toast.onConfirm}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
