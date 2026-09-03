import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const LOCAL_STORAGE_KEY = 'yuanbao_gender_bet_data_v1';
const MY_BETS_KEY = 'yuanbao_my_bet_ids_v1';
const MY_NAMES_KEY = 'yuanbao_my_bet_names_v1';

const defaultData = {
  bets: [],
  config: {
    cutoffDate: '2026-09-05T17:00:00+08:00',
    revealDate: '2026-09-05T17:30:00+08:00',
    revealedResult: null
  }
};

const bc = typeof window !== 'undefined' && 'BroadcastChannel' in window ? new BroadcastChannel('yuanbao_gender_reveal') : null;
let socket = null;

export function useGenderBetStore() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.bets && parsed.bets.length > 0 && parsed.bets.some(b => b.id && b.id.startsWith('demo-bet'))) {
          return defaultData;
        }
        return parsed;
      }
      return defaultData;
    } catch {
      return defaultData;
    }
  });

  const [myBetIds, setMyBetIds] = useState(() => {
    try {
      const saved = localStorage.getItem(MY_BETS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [myBetNames, setMyBetNames] = useState(() => {
    try {
      const saved = localStorage.getItem(MY_NAMES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isConnected, setIsConnected] = useState(false);

  const updateLocalState = (newState) => {
    setData(newState);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
      if (bc) {
        bc.postMessage(newState);
      }
    } catch (e) {
      console.error('Failed to update local storage', e);
    }
  };

  const addMyBetRecord = (id, name) => {
    const cleanName = name.trim();
    const nextIds = [...myBetIds, id];
    const nextNames = myBetNames.includes(cleanName) ? myBetNames : [...myBetNames, cleanName];

    setMyBetIds(nextIds);
    setMyBetNames(nextNames);

    try {
      localStorage.setItem(MY_BETS_KEY, JSON.stringify(nextIds));
      localStorage.setItem(MY_NAMES_KEY, JSON.stringify(nextNames));
    } catch (e) {
      console.error('Failed to save my bet keys', e);
    }
  };

  const removeMyBetRecord = (id, name) => {
    const nextIds = myBetIds.filter(item => item !== id);
    setMyBetIds(nextIds);
    try {
      localStorage.setItem(MY_BETS_KEY, JSON.stringify(nextIds));
    } catch (e) {
      console.error('Failed to update my bet keys', e);
    }
  };

  useEffect(() => {
    if (bc) {
      bc.onmessage = (event) => {
        if (event.data) {
          setData(event.data);
        }
      };
    }

    const serverUrl = window.location.port === '3000' ? 'http://localhost:3001' : window.location.origin;
    socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 3000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('stateUpdate', (serverState) => {
      if (serverState) {
        setData(serverState);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serverState));
      }
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const placeBet = ({ name, team, amount, note }) => {
    const betId = 'bet_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const cleanName = name.trim();
    const newBet = {
      id: betId,
      name: cleanName,
      team,
      amount: Number(amount),
      note: note.trim(),
      isPaid: false,
      createdAt: new Date().toISOString()
    };

    addMyBetRecord(betId, cleanName);

    if (isConnected && socket) {
      socket.emit('addBet', newBet);
    } else {
      const nextData = {
        ...data,
        bets: [newBet, ...data.bets]
      };
      updateLocalState(nextData);
    }
  };

  const cancelBet = (betId) => {
    const target = data.bets.find(b => b.id === betId);
    if (!target) return;
    if (target.isPaid) {
      return false;
    }

    if (isConnected && socket) {
      socket.emit('cancelBet', { betId });
    } else {
      const nextBets = data.bets.filter(b => b.id !== betId);
      const nextData = { ...data, bets: nextBets };
      updateLocalState(nextData);
    }
    removeMyBetRecord(betId, target.name);
    return true;
  };

  const adminTogglePayment = (betId, isPaid, password) => {
    if (password !== '17218') return false;

    if (isConnected && socket) {
      socket.emit('adminTogglePayment', { betId, isPaid, password });
    } else {
      const nextBets = data.bets.map(b => b.id === betId ? { ...b, isPaid } : b);
      updateLocalState({ ...data, bets: nextBets });
    }
    return true;
  };

  const adminDeleteBet = (betId, password) => {
    if (password !== '17218') return false;

    if (isConnected && socket) {
      socket.emit('adminDeleteBet', { betId, password });
    } else {
      const nextBets = data.bets.filter(b => b.id !== betId);
      updateLocalState({ ...data, bets: nextBets });
    }
    return true;
  };

  const adminSetCutoff = (cutoffDate, password) => {
    if (password !== '17218') return false;

    if (isConnected && socket) {
      socket.emit('adminSetCutoff', { cutoffDate, password });
    } else {
      const nextConfig = { ...data.config, cutoffDate };
      updateLocalState({ ...data, config: nextConfig });
    }
    return true;
  };

  const adminSetRevealDate = (revealDate, password) => {
    if (password !== '17218') return false;

    if (isConnected && socket) {
      socket.emit('adminSetRevealDate', { revealDate, password });
    } else {
      const nextConfig = { ...data.config, revealDate };
      updateLocalState({ ...data, config: nextConfig });
    }
    return true;
  };

  const adminSetReveal = (result, password) => {
    if (password !== '17218') return false;

    if (isConnected && socket) {
      socket.emit('adminSetReveal', { result, password });
    } else {
      const nextConfig = { ...data.config, revealedResult: result };
      updateLocalState({ ...data, config: nextConfig });
    }
    return true;
  };

  const adminResetAll = (password) => {
    if (password !== '17218') return false;

    if (isConnected && socket) {
      socket.emit('adminResetAll', { password });
    } else {
      const nextData = {
        ...data,
        bets: [],
        config: {
          ...data.config,
          revealedResult: null
        }
      };
      updateLocalState(nextData);
    }
    return true;
  };

  const bets = data.bets || [];
  const princeBets = bets.filter(b => b.team === 'prince');
  const princessBets = bets.filter(b => b.team === 'princess');

  const princeTotal = princeBets.reduce((sum, b) => sum + b.amount, 0);
  const princessTotal = princessBets.reduce((sum, b) => sum + b.amount, 0);
  const grandTotal = princeTotal + princessTotal;

  const princePercent = grandTotal > 0 ? Math.round((princeTotal / grandTotal) * 100) : 50;
  const princessPercent = grandTotal > 0 ? 100 - princePercent : 50;

  const totalBettorsCount = bets.length;

  let leader = 'equal';
  if (princeTotal > princessTotal) leader = 'prince';
  else if (princessTotal > princeTotal) leader = 'princess';

  return {
    bets,
    config: data.config,
    myBetIds,
    myBetNames,
    isConnected,
    princeTotal,
    princessTotal,
    grandTotal,
    princePercent,
    princessPercent,
    totalBettorsCount,
    leader,
    placeBet,
    cancelBet,
    adminTogglePayment,
    adminDeleteBet,
    adminSetCutoff,
    adminSetRevealDate,
    adminSetReveal,
    adminResetAll
  };
}
