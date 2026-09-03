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
import { Bell, Sparkles, PartyPopper } from 'lucide-react';

export default function App() {
  const store = useGenderBetStore();
  const [isBetModalOpen, setIsBetModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isRevealModalClosed, setIsRevealModalClosed] = useState(false);
  const [testRevealMode, setTestRevealMode] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');

  // 手機端專屬：頂部強效懸浮廣播 Push Banner
  const [pushBanner, setPushBanner] = useState({ isOpen: false, title: '', message: '' });

  // 下注成功專屬導引 Toast
  const [successToast, setSuccessToast] = useState({ isOpen: false, teamName: '', amount: 0 });

  const prevRevealedResultRef = useRef(store.config.revealedResult);

  // 自動註冊 Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('Service Worker registration failed:', err);
      });
    }

    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleRequestNotificationPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        sendNativeNotification('🔔 推播通知已開啟！', {
          body: '性別大揭曉時，您的手機將第一時間收到即時通知！',
          icon: '/favicon.ico',
          tag: 'welcome-notification',
          renotify: true
        });
        setPushBanner({
          isOpen: true,
          title: '🔔 推播通知已開啟！',
          message: '性別大揭曉時，您的手機將第一時間收到即時推播！'
        });
        setTimeout(() => setPushBanner(prev => ({ ...prev, isOpen: false })), 4000);
      }
    }
  };

  const sendNativeNotification = (title, options) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const enrichedOptions = {
      renotify: true,
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 300],
      ...options
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          registration.showNotification(title, enrichedOptions);
        })
        .catch(() => {
          try {
            new Notification(title, enrichedOptions);
          } catch (e) {
            console.error('Notification fallback failed', e);
          }
        });
    } else {
      try {
        new Notification(title, enrichedOptions);
      } catch (e) {
        console.error('Notification fallback failed', e);
      }
    }
  };

  // 測試推播功能觸發
  const handleTestPushNotification = () => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200]);
      } catch (e) {}
    }

    setPushBanner({
      isOpen: true,
      title: '🔔【測試推播成功】',
      message: '這是一道測試即時推播訊息，代表您的手機推播功能一切正常！'
    });

    sendNativeNotification('🔔【測試推播成功】', {
      body: '這是一道測試即時推播訊息，代表您的手機推播功能一切正常！',
      icon: '/favicon.ico',
      tag: 'test-push-notification',
      renotify: true,
      requireInteraction: true
    });

    setTimeout(() => {
      setPushBanner(prev => ({ ...prev, isOpen: false }));
    }, 4500);
  };

  // 測試揭曉煙火觸發
  const handleTestRevealEffect = () => {
    setTestRevealMode(true);
    setIsRevealModalClosed(false);
  };

  // 監聽真實揭曉瞬間！
  useEffect(() => {
    const prevResult = prevRevealedResultRef.current;
    const currentResult = store.config.revealedResult;

    if (!prevResult && currentResult) {
      const isPrince = currentResult === 'prince';
      const resultText = isPrince ? '👦 帥氣王子寶貝' : '👧 可愛公主寶貝';

      setIsRevealModalClosed(false);

      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([200, 100, 200, 100, 300]);
        } catch (e) {}
      }

      setPushBanner({
        isOpen: true,
        title: '🎉 小元寶性別大揭曉！',
        message: `驚喜揭曉：小元寶是【${resultText}】！恭喜得獎者！`
      });

      sendNativeNotification('🎉 小元寶性別大揭曉！', {
        body: `驚喜揭曉：小元寶是【${resultText}】！恭喜猜中的得獎好朋友！`,
        icon: '/favicon.ico',
        tag: 'gender-reveal-result',
        renotify: true,
        requireInteraction: true,
        vibrate: [200, 100, 200]
      });
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

  const activeRevealResult = store.config.revealedResult || (testRevealMode ? 'prince' : null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-purple-50 to-pink-100 text-slate-800 font-sans selection:bg-pink-300 pb-6 box-border relative">
      
      {/* 📱 手機端專屬：頂部強效懸浮廣播 Push Banner (揭曉瞬間 100% 彈出) */}
      {pushBanner.isOpen && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md p-3.5 bg-gradient-to-r from-purple-700 via-indigo-700 to-pink-700 text-white rounded-3xl shadow-2xl border-2 border-yellow-300 animate-slideDown flex items-start gap-3 box-border">
          <div className="p-2 bg-yellow-400 text-purple-950 rounded-2xl flex-shrink-0 animate-bounce">
            <PartyPopper className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black text-yellow-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
              <span>{pushBanner.title}</span>
            </h4>
            <p className="text-xs font-bold text-white leading-snug mt-0.5">
              {pushBanner.message}
            </p>
          </div>
          <button
            onClick={() => setPushBanner(prev => ({ ...prev, isOpen: false }))}
            className="text-white/80 hover:text-white p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* 手機優先最大寬度卡片容器 */}
      <main className="w-full max-w-md mx-auto px-3 space-y-3.5 box-border">
        
        {/* 1. Header 區塊 */}
        <Header
          isConnected={store.isConnected}
          onOpenAdmin={() => setIsAdminModalOpen(true)}
        />

        {/* 🔔 揭曉即時推播權限開啟卡片 */}
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

        {/* 頁尾版權小字 */}
        <footer className="text-center pt-2 pb-1 text-[11px] text-slate-600 font-semibold">
          小元寶性別趴特別企劃 💕 祝大家玩的開心猜得準確！
        </footer>
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
        onTestPushNotification={handleTestPushNotification}
        onTestRevealEffect={handleTestRevealEffect}
      />

      {/* 揭曉結果彈窗 */}
      {activeRevealResult && !isRevealModalClosed && (
        <RevealModal
          revealedResult={activeRevealResult}
          bets={store.bets}
          grandTotal={store.grandTotal}
          onClose={() => {
            setIsRevealModalClosed(true);
            setTestRevealMode(false);
          }}
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

    </div>
  );
}
