import React from 'react';
import { AlertCircle, CheckCircle2, HelpCircle, Info, X } from 'lucide-react';

export default function ToastModal({
  isOpen,
  type = 'info', // 'info' | 'success' | 'warning' | 'confirm'
  title = '提示訊息',
  message = '',
  confirmText = '確認',
  cancelText = '取消',
  onConfirm,
  onCancel,
  onClose
}) {
  if (!isOpen) return null;

  const isConfirmType = type === 'confirm';

  // 依據型態選擇圖示與顏色
  const renderIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-10 h-10 text-emerald-500" />;
      case 'warning':
        return <AlertCircle className="w-10 h-10 text-amber-500" />;
      case 'confirm':
        return <HelpCircle className="w-10 h-10 text-purple-500" />;
      case 'info':
      default:
        return <Info className="w-10 h-10 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xs w-full p-5 text-center shadow-2xl border-2 border-white relative animate-scaleUp">
        
        {/* 關閉按鈕 */}
        <button
          onClick={onClose || onCancel}
          className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 頂部圖示 */}
        <div className="mb-3 flex justify-center">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
            {renderIcon()}
          </div>
        </div>

        {/* 標題與內容 */}
        <h3 className="text-base font-black text-slate-800 mb-1">
          {title}
        </h3>
        <p className="text-xs text-slate-600 font-medium leading-relaxed mb-5 whitespace-pre-line">
          {message}
        </p>

        {/* 按鈕組 */}
        <div className="flex gap-2">
          {isConfirmType && (
            <button
              onClick={onCancel || onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all active:scale-95"
            >
              {cancelText}
            </button>
          )}

          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              if (onClose) onClose();
            }}
            className={`flex-1 py-2.5 font-black text-xs rounded-xl shadow transition-all active:scale-95 text-white ${
              type === 'warning'
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
                : type === 'confirm'
                ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
                : type === 'success'
                ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
                : 'bg-slate-800 hover:bg-slate-900 shadow-slate-200'
            }`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}
