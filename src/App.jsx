import React, { useState } from 'react';
import Header from './components/Header';
import Countdown from './components/Countdown';
import RatioBar from './components/RatioBar';
import BetSplitList from './components/BetSplitList';
import BetFormModal from './components/BetFormModal';
import AdminModal from './components/AdminModal';
import RevealModal from './components/RevealModal';
import { useGenderBetStore } from './lib/store';
import { PlusCircle } from 'lucide-react';

export default function App() {
  const store = useGenderBetStore();
  const [isBetModalOpen, setIsBetModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isRevealModalClosed, setIsRevealModalClosed] = useState(false);

  const isCutoffPassed = store.config.cutoffDate ? new Date() > new Date(store.config.cutoffDate) : false;
  const isLocked = isCutoffPassed || Boolean(store.config.revealedResult);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-purple-50 to-pink-100 text-slate-800 pb-24 font-sans selection:bg-pink-300">
      
      {/* 手機優先最大寬度卡片容器 */}
      <main className="w-full max-w-md mx-auto px-3 space-y-3.5 box-border">
        {/* 1. Header 區塊 */}
        <Header
          isConnected={store.isConnected}
          onOpenAdmin={() => setIsAdminModalOpen(true)}
        />

        {/* 2. 倒數計時卡片 */}
        <Countdown cutoffDate={store.config.cutoffDate} />

        {/* 3. 對決金額與比例對決條 */}
        <RatioBar
          princeTotal={store.princeTotal}
          princessTotal={store.princessTotal}
          grandTotal={store.grandTotal}
          princePercent={store.princePercent}
          princessPercent={store.princessPercent}
          totalBettorsCount={store.totalBettorsCount}
          leader={store.leader}
        />

        {/* 4. 即時對決名單牆 */}
        <BetSplitList
          bets={store.bets}
          myBetIds={store.myBetIds}
          myBetNames={store.myBetNames}
          princeTotal={store.princeTotal}
          princessTotal={store.princessTotal}
          grandTotal={store.grandTotal}
          onCancelBet={store.cancelBet}
        />
      </main>

      {/* 浮動下注按鈕 (右下角 Floating Button) */}
      {!isLocked && (
        <div className="fixed bottom-5 right-5 z-40">
          <button
            onClick={() => setIsBetModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-black text-sm rounded-full shadow-2xl shadow-purple-400/60 transform hover:scale-105 active:scale-95 transition-all border-2 border-white/80"
          >
            <PlusCircle className="w-5 h-5 animate-pulse" />
            <span>我要下注 🎲</span>
          </button>
        </div>
      )}

      {/* 彈窗元件 */}
      <BetFormModal
        isOpen={isBetModalOpen}
        onClose={() => setIsBetModalOpen(false)}
        onPlaceBet={store.placeBet}
        isLocked={isLocked}
        princeTotal={store.princeTotal}
        princessTotal={store.princessTotal}
        grandTotal={store.grandTotal}
        revealedResult={store.config.revealedResult}
      />

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

      {/* 揭曉結果彈窗 (若管理者已設揭曉結果且未手動關閉) */}
      {store.config.revealedResult && !isRevealModalClosed && (
        <RevealModal
          revealedResult={store.config.revealedResult}
          bets={store.bets}
          grandTotal={store.grandTotal}
          onClose={() => setIsRevealModalClosed(true)}
        />
      )}

      {/* 頁尾版權小字 */}
      <footer className="text-center mt-8 text-[11px] text-slate-600 font-semibold">
        小元寶性別趴特別企劃 💕 祝大家玩的開心猜得準確！
      </footer>

    </div>
  );
}
