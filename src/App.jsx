import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Countdown from './components/Countdown';
import RatioBar from './components/RatioBar';
import BetSplitList from './components/BetSplitList';
import BetFormModal from './components/BetFormModal';
import AdminModal from './components/AdminModal';
import RevealModal from './components/RevealModal';
import ToastModal from './components/ToastModal';
import { useGenderBetStore } from './lib/store';
import { Bell, Sparkles } from 'lucide-react';

export default function App() {
  const store = useGenderBetStore();
  const [isBetModalOpen, setIsBetModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isRevealModalClosed, setIsRevealModalClosed] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');

  // 下注成功專屬導引 Toast
  const [successToast, setSuccessToast] = useState({ isOpen: false, teamName: '', amount: 0 });

  const prevRevealedResultRef = useRef(store.config.revealedResult);

  // 監聽權限狀態
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleRequestNotificationPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
    }
  };

  // 🌟 核心：監聽揭曉瞬間！一旦管理者在後台揭曉，全場手機零延遲自動跳出彈窗＋系統層推播通知
  useEffect(() => {
    const prevResult = prevRevealedResultRef.current;
    const currentResult = store.config.revealedResult;

    if (!prevResult && currentResult) {
      // 1. 自動跳出全螢幕爆竹煙火 Modal
      setIsRevealModalClosed(false);

      // 2. 觸發手機/電腦系統層原生推播通知 (若已授權)
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          const isPrince = currentResult === 'prince';
          new Notification('🎉 小元寶性別大揭曉！', {
            body: `驚喜揭曉：小元寶是【${isPrince ? '👦 帥氣王子寶貝' : '👧 可愛公主寶貝'}】！恭喜猜中的得獎好朋友！`,
            icon: '/favicon.ico',
            tag: 'gender-reveal'
          });
        } catch (e) {
          console.error('Notification error:', e);
        }
      }
    }

    prevRevealedResultRef.current = currentResult;
  }, [store.config.revealedResult]);

  const isCutoffPassed = store.config.cutoffDate ? new Date() > new Date(store.config.cutoffDate) : false;
  const isLocked = isCutoffPassed || Boolean(store.config.revealedResult);

  const handlePlaceBet = (betData) => {
    store.placeBet(betData);
    setSuccessToast({
      isOpen: true,
      teamName: betData.team === 'prince' ? '👦 王子隊' : '👧 公主隊',
      amount: betData.amount
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-purple-50 to-pink-100 text-slate-800 pb-24 font-sans selection:bg-pink-300">
      
      {/* 手機優先最大寬度卡片容器 */}
      <main className="w-full max-w-md mx-auto px-3 space-y-3.5 box-border">
        
        {/* 1. Header 區塊 */}
        <Header
          isConnected={store.isConnected}
          onOpenAdmin={() => setIsAdminModalOpen(true)}
        />

        {/* 🔔 揭曉即時推播權限開啟卡片 (當權限尚未同意時顯示) */}
        {notificationPermission === 'default' && 'Notification' in window && (
          <div className="w-full p-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white rounded-2xl shadow-lg border border-purple-300 flex items-center justify-between gap-2 box-border animate-fadeIn">
            <div className="flex items-center gap-2 min-w-0">
              <Bell className="w-4 h-4 text-yellow-300 animate-bounce flex-shrink-0" />
              <span className="text-xs font-bold truncate">開啟揭曉推播！性別公佈即時收到通知 🔔</span>
            </div>
            <button
              onClick={handleRequestNotificationPermission}
              className="px-3 py-1 bg-white text-purple-900 font-black text-xs rounded-xl shadow hover:bg-slate-100 transition-all flex-shrink-0 active:scale-95"
            >
              允許推播
            </button>
          </div>
        )}

        {/* 2. 雙重倒數卡片 / 揭曉結果重播卡片 */}
        <Countdown
          cutoffDate={store.config.cutoffDate}
          revealDate={store.config.revealDate}
          revealedResult={store.config.revealedResult}
          bets={store.bets}
          grandTotal={store.grandTotal}
          onReopenRevealModal={() => setIsRevealModalClosed(false)}
        />

        {/* 3. 對決金額與比例對決條 */}
        <RatioBar
          princeTotal={store.princeTotal}
          princessTotal={store.princessTotal}
          grandTotal={store.grandTotal}
          princePercent={store.princePercent}
          princessPercent={store.princessPercent}
          totalBettorsCount={store.totalBettorsCount}
          leader={store.leader}
          revealedResult={store.config.revealedResult}
        />

        {/* 4. 即時對決名單牆 */}
        <BetSplitList
          bets={store.bets}
          myBetIds={store.myBetIds}
          myBetNames={store.myBetNames}
          princeTotal={store.princeTotal}
          princessTotal={store.princessTotal}
          grandTotal={store.grandTotal}
          revealedResult={store.config.revealedResult}
          onCancelBet={store.cancelBet}
        />
      </main>

      {/* 浮動下注按鈕 (右下角 Floating Button) */}
      {!isLocked && (
        <div className="fixed bottom-5 right-5 z-40">
          <button
            onClick={() => setIsBetModalOpen(true)}
            className="flex items-center gap-1.5 px-5 py-3.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-black text-sm rounded-full shadow-2xl shadow-purple-400/60 transform hover:scale-105 active:scale-95 transition-all border-2 border-white/80"
          >
            <span>我要下注 🎲</span>
          </button>
        </div>
      )}

      {/* 下注表單彈窗 */}
      <BetFormModal
        isOpen={isBetModalOpen}
        onClose={() => setIsBetModalOpen(false)}
        onPlaceBet={handlePlaceBet}
        isLocked={isLocked}
        princeTotal={store.princeTotal}
        princessTotal={store.princessTotal}
        grandTotal={store.grandTotal}
        revealedResult={store.config.revealedResult}
      />

      {/* 管理者控制彈窗 */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        bets={store.bets}
        config={store.config}
        onTogglePayment={store.adminTogglePayment}
        onDeleteBet={store.adminDeleteBet}
        onSetCutoff={store.adminSetCutoff}
        onSetRevealDate={store.adminSetRevealDate}
        onSetReveal={store.adminSetReveal}
        onResetAll={store.adminResetAll}
      />

      {/* 揭曉結果彈窗 (揭曉時全螢幕跳出爆竹煙火) */}
      {store.config.revealedResult && !isRevealModalClosed && (
        <RevealModal
          revealedResult={store.config.revealedResult}
          bets={store.bets}
          grandTotal={store.grandTotal}
          onClose={() => setIsRevealModalClosed(true)}
        />
      )}

      {/* 下注成功專屬提示 ToastModal */}
      <ToastModal
        isOpen={successToast.isOpen}
        type="success"
        title="🎉 下注成功！"
        message={`太棒了！您已成功預測【${successToast.teamName}】$${Number(successToast.amount).toLocaleString('en-US')}！\n\n👩🏻‍🍼 請記得洽【元寶媽】確認付款完成喔！`}
        confirmText="好的，去找元寶媽 💖"
        onClose={() => setSuccessToast(prev => ({ ...prev, isOpen: false }))}
      />

      {/* 頁尾版權小字 */}
      <footer className="text-center mt-8 text-[11px] text-slate-600 font-semibold">
        小元寶性別趴特別企劃 💕 祝大家玩的開心猜得準確！
      </footer>

    </div>
  );
}
