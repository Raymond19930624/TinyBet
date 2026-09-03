import React, { useState } from 'react';
import { Shield, Key, X, Download, Trash2, Clock, Award, Check, Square, AlertTriangle, Laugh, CalendarCheck, Zap, Edit3 } from 'lucide-react';
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
  onSetReveal
}) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showTrollModal, setShowTrollModal] = useState(false);

  const [isCutoffPickerOpen, setIsCutoffPickerOpen] = useState(false);

  const [modalDialog, setModalDialog] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: '確認',
    onConfirmAction: null
  });

  const [cutoffDate, setCutoffDate] = useState(() => {
    if (config?.cutoffDate) {
      const d = new Date(config.cutoffDate);
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }
    return '2026-09-05';
  });

  const [cutoffHour, setCutoffHour] = useState(() => {
    if (config?.cutoffDate) {
      const d = new Date(config.cutoffDate);
      return String(d.getHours()).padStart(2, '0');
    }
    return '17';
  });

  const [cutoffMinute, setCutoffMinute] = useState(() => {
    if (config?.cutoffDate) {
      const d = new Date(config.cutoffDate);
      return String(d.getMinutes()).padStart(2, '0');
    }
    return '00';
  });

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    const cleanPwd = password.trim();

    if (cleanPwd === '19881102') {
      setShowTrollModal(true);
      setErrorMsg('');
      return;
    }

    if (cleanPwd === '17218') {
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('密碼錯誤！請重新輸入');
    }
  };

  const handleSaveCutoff = () => {
    if (!cutoffDate) return;
    const isoString = new Date(`${cutoffDate}T${cutoffHour}:${cutoffMinute}:00`).toISOString();
    const ok = onSetCutoff(isoString, password);
    if (ok !== false) {
      setIsCutoffPickerOpen(false);
      setModalDialog({
        isOpen: true,
        type: 'success',
        title: '時間已更新',
        message: `下注截止時間已成功設定為：\n${cutoffDate} ${cutoffHour}:${cutoffMinute}`,
        confirmText: '好的',
        onConfirmAction: null
      });
    }
  };

  const setQuickPreset = (dateStr, hourStr, minStr) => {
    setCutoffDate(dateStr);
    setCutoffHour(hourStr);
    setCutoffMinute(minStr);
  };

  const handleTriggerSetReveal = (result) => {
    const title = result === 'prince' ? '王子隊' : '公主隊';
    setModalDialog({
      isOpen: true,
      type: 'confirm',
      title: '揭曉結果確認',
      message: `確定要將揭曉結果設定為【${title}】勝出嗎？\n這將停止所有人下注並顯示得獎名單！`,
      confirmText: '確定揭曉',
      onConfirmAction: () => onSetReveal(result, password)
    });
  };

  const handleTriggerDeleteBet = (b) => {
    setModalDialog({
      isOpen: true,
      type: 'confirm',
      title: '刪除下注確認',
      message: `管理者確定要刪除「${b.name}」這筆 $${Number(b.amount).toLocaleString('en-US')} 的下注記錄嗎？`,
      confirmText: '確定刪除',
      onConfirmAction: () => onDeleteBet(b.id, password)
    });
  };

  const formatCurrentCutoff = (isoString) => {
    if (!isoString) return '未設定';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const hoursList = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutesList = ['00', '15', '30', '45'];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
        
        {/* 🤪 嗆人搞笑彈窗 */}
        {showTrollModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-bounceIn">
            <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center shadow-2xl border-4 border-rose-400 relative">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">
                🤪
              </div>
              
              <h3 className="text-xl font-black text-rose-600 mb-2 flex items-center justify-center gap-1">
                <Laugh className="w-6 h-6 animate-spin" />
                <span>哈哈被抓包了吧！</span>
              </h3>

              <p className="text-sm font-bold text-slate-700 leading-relaxed mb-5">
                密碼提示寫什麼你就真的照填什麼喔？真的太天真囉～傻瓜！😜😜
              </p>

              <button
                onClick={() => {
                  setShowTrollModal(false);
                  setPassword('');
                }}
                className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-black text-sm rounded-2xl shadow-lg transition-all active:scale-95"
              >
                我知道錯了，重新輸入 🙈
              </button>
            </div>
          </div>
        )}

        {/* 🕒 下注截止時間調整浮窗 */}
        {isCutoffPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-xs w-full p-5 shadow-2xl border-2 border-blue-100 relative">
              <button
                onClick={() => setIsCutoffPickerOpen(false)}
                className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-black text-slate-800 text-sm mb-1 flex items-center gap-1.5 text-blue-900">
                <Clock className="w-4 h-4 text-blue-600" />
                調整下注截止時間
              </h3>
              <p className="text-[10px] text-slate-500 mb-3">設定後前台將依此時間自動倒數與截止</p>

              {/* 快捷按鈕 */}
              <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5">
                  <Zap className="w-3 h-3 text-amber-500" /> 快捷:
                </span>
                <button
                  onClick={() => setQuickPreset('2026-09-05', '17', '00')}
                  className="px-2 py-1 bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold rounded-lg hover:bg-blue-100 transition-all"
                >
                  9/5 17:00
                </button>
                <button
                  onClick={() => setQuickPreset('2026-09-05', '17', '30')}
                  className="px-2 py-1 bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold rounded-lg hover:bg-blue-100 transition-all"
                >
                  9/5 17:30
                </button>
              </div>

              {/* 選單 */}
              <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 mb-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">
                    日期 (YYYY-MM-DD)
                  </label>
                  <input
                    type="date"
                    value={cutoffDate}
                    onChange={(e) => setCutoffDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs font-black text-slate-800 outline-none bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      小時 (24H)
                    </label>
                    <select
                      value={cutoffHour}
                      onChange={(e) => setCutoffHour(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-black text-slate-800 bg-white outline-none"
                    >
                      {hoursList.map(h => (
                        <option key={h} value={h}>{h} 時</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      分鐘
                    </label>
                    <select
                      value={cutoffMinute}
                      onChange={(e) => setCutoffMinute(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-black text-slate-800 bg-white outline-none"
                    >
                      {minutesList.map(m => (
                        <option key={m} value={m}>{m} 分</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 動作按鈕 */}
              <div className="flex gap-2">
                <button
                  onClick={() => setIsCutoffPickerOpen(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveCutoff}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1 active:scale-95"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>確認更新</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 主管理者視窗 */}
        <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-100 relative max-h-[90vh] flex flex-col">
          
          {/* 頂部 Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-800 text-amber-400 rounded-xl">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-800">管理者後台控制中心</h2>
                <p className="text-[10px] text-slate-500">權限驗證</p>
              </div>
            </div>

            <button
              onClick={() => {
                setIsAuthenticated(false);
                setPassword('');
                setErrorMsg('');
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 密碼驗證畫面 */}
          {!isAuthenticated ? (
            <form onSubmit={handleLogin} className="py-6 text-center space-y-3 max-w-xs mx-auto">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-1 shadow-inner">
                <Key className="w-7 h-7" />
              </div>

              <h3 className="text-base font-black text-slate-800">請輸入管理者密碼</h3>
              <p className="text-xs text-slate-400 font-bold">提示：19881102</p>

              {errorMsg && (
                <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <input
                type="password"
                placeholder="請輸入密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-center px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-slate-800 focus:ring-2 focus:ring-slate-100 text-base font-black tracking-widest outline-none"
                autoFocus
              />

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-2xl transition-all shadow active:scale-95"
              >
                進入管理後台
              </button>
            </form>
          ) : (
            /* 管理者操作面板 */
            <div className="flex-1 overflow-y-auto pr-1 space-y-3.5">
              
              {/* 匯出 CSV */}
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between gap-2">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-xs">匯出名單 CSV 檔</h4>
                  <p className="text-[10px] text-slate-500">姓名、金額、付款與留言</p>
                </div>

                <button
                  onClick={() => exportBetsToCsv(bets, '小元寶性別趴下注名單.csv', (msg) => {
                    setModalDialog({
                      isOpen: true,
                      type: 'warning',
                      title: '無法匯出',
                      message: msg,
                      confirmText: '我知道了',
                      onConfirmAction: null
                    });
                  })}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow transition-all flex items-center gap-1 active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>匯出 CSV</span>
                </button>
              </div>

              {/* 🕒 下注截止時間簡潔展示卡片 */}
              <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-2 bg-white text-blue-600 rounded-xl shadow-2xs flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-400 font-bold">下注截止時間</div>
                    <div className="text-xs font-black text-slate-800 truncate">
                      {formatCurrentCutoff(config?.cutoffDate)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsCutoffPickerOpen(true)}
                  className="px-3 py-1.5 bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 font-extrabold text-xs rounded-xl transition-all shadow-2xs flex items-center gap-1 flex-shrink-0 active:scale-95"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>調整時間</span>
                </button>
              </div>

              {/* 設定揭曉結果 (簡潔極簡: [👦 王子隊] vs [👧 公主隊]) */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="font-extrabold text-slate-800 text-xs mb-2 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-pink-600" />
                  設定性別揭曉結果
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleTriggerSetReveal('prince')}
                    className={`py-2 px-3 rounded-2xl font-black text-xs border transition-all flex items-center justify-center gap-1.5 ${
                      config.revealedResult === 'prince'
                        ? 'bg-sky-600 text-white border-sky-700 shadow-md scale-[1.02]'
                        : 'bg-white text-sky-700 border-slate-200 hover:bg-sky-50'
                    }`}
                  >
                    <span>👦</span>
                    <span>王子隊</span>
                  </button>

                  <button
                    onClick={() => handleTriggerSetReveal('princess')}
                    className={`py-2 px-3 rounded-2xl font-black text-xs border transition-all flex items-center justify-center gap-1.5 ${
                      config.revealedResult === 'princess'
                        ? 'bg-pink-600 text-white border-pink-700 shadow-md scale-[1.02]'
                        : 'bg-white text-pink-700 border-slate-200 hover:bg-pink-50'
                    }`}
                  >
                    <span>👧</span>
                    <span>公主隊</span>
                  </button>
                </div>
              </div>

              {/* 下注管理 */}
              <div>
                <h4 className="font-extrabold text-slate-800 text-xs mb-2">
                  下注者點收管理 ({bets.length} 筆)
                </h4>

                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {bets.map((b) => (
                    <div
                      key={b.id}
                      className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => onTogglePayment(b.id, !b.isPaid, password)}
                          className={`p-1 rounded-lg border transition-all ${
                            b.isPaid
                              ? 'bg-emerald-500 text-white border-emerald-600'
                              : 'bg-slate-100 text-slate-400 border-slate-300'
                          }`}
                        >
                          {b.isPaid ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Square className="w-3.5 h-3.5" />}
                        </button>

                        <div>
                          <div className="font-bold text-slate-800 text-xs flex items-center gap-1">
                            <span>{b.name}</span>
                            <span className={`px-1 rounded text-[9px] ${
                              b.team === 'prince' ? 'bg-sky-100 text-sky-800' : 'bg-pink-100 text-pink-800'
                            }`}>
                              {b.team === 'prince' ? '王子' : '公主'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            ${Number(b.amount).toLocaleString('en-US')} ‧ {b.isPaid ? '已付款' : '未付款'}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleTriggerDeleteBet(b)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* 管理者自訂通用提示與確認 Modal */}
      <ToastModal
        isOpen={modalDialog.isOpen}
        type={modalDialog.type}
        title={modalDialog.title}
        message={modalDialog.message}
        confirmText={modalDialog.confirmText}
        onConfirm={() => {
          if (modalDialog.onConfirmAction) modalDialog.onConfirmAction();
          setModalDialog(prev => ({ ...prev, isOpen: false }));
        }}
        onClose={() => setModalDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
