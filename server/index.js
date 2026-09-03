import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const CLOUD_STORAGE_URL = 'https://api.restful-api.dev/objects/ff808181a0662e5201a0663b9da7000c';

const defaultState = {
  bets: [],
  config: {
    cutoffDate: '2026-09-05T17:00:00+08:00',
    revealDate: '2026-09-05T17:30:00+08:00',
    revealedResult: null
  }
};

function normalizeBetTeam(bet) {
  if (!bet) return bet;
  const t = String(bet.team || '').toLowerCase().trim();
  if (t.includes('princess') || t.includes('girl') || t.includes('公主')) {
    bet.team = 'princess';
  } else {
    bet.team = 'prince';
  }
  return bet;
}

function deduplicateBets(betsArray) {
  if (!Array.isArray(betsArray)) return [];
  const seenIds = new Set();
  const result = [];

  for (const b of betsArray) {
    if (!b || !b.id) continue;
    const cleanBet = normalizeBetTeam(b);
    if (!seenIds.has(cleanBet.id)) {
      seenIds.add(cleanBet.id);
      result.push(cleanBet);
    }
  }
  return result;
}

// 雲端數據庫讀取
async function fetchStateFromCloud() {
  try {
    const response = await fetch(CLOUD_STORAGE_URL);
    if (response.ok) {
      const json = await response.json();
      if (json && json.data) {
        if (Array.isArray(json.data.bets)) {
          json.data.bets = deduplicateBets(json.data.bets);
        }
        return json.data;
      }
    }
  } catch (err) {
    console.error('Failed to load state from cloud snapshot:', err);
  }
  return null;
}

// 雲端快照強效持久化同步
async function syncStateToCloud(state) {
  try {
    await fetch(CLOUD_STORAGE_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'TinyBetState',
        data: state
      })
    });
    console.log('State & Payment status successfully synced to cloud!');
  } catch (err) {
    console.error('Failed to sync state to cloud snapshot:', err);
  }
}

let currentState = defaultState;

const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const persistAndBroadcast = (state) => {
  state.bets = deduplicateBets(state.bets);
  syncStateToCloud(state);
  io.emit('stateUpdate', state);
};

// 伺服器開機：100% 雲端數據庫優先，徹底摒棄伺服器寫死預設值
async function startServer() {
  const cloudData = await fetchStateFromCloud();
  if (cloudData && Array.isArray(cloudData.bets)) {
    currentState = {
      bets: deduplicateBets(cloudData.bets),
      config: {
        ...defaultState.config,
        ...(cloudData.config || {})
      }
    };
    console.log(`Server initialized with ${currentState.bets.length} cloud bets & payment status!`);
  } else {
    currentState = defaultState;
    syncStateToCloud(currentState);
  }

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    currentState.bets = deduplicateBets(currentState.bets);
    socket.emit('stateUpdate', currentState);

    socket.on('addBet', (newBet) => {
      const cleanBet = normalizeBetTeam(newBet);
      // 新增下注若同 ID 則不重複新增
      const existing = currentState.bets.find(b => b.id === cleanBet.id);
      if (!existing) {
        currentState.bets = deduplicateBets([cleanBet, ...currentState.bets]);
        persistAndBroadcast(currentState);
      }
    });

    socket.on('cancelBet', ({ betId }) => {
      const betIndex = currentState.bets.findIndex(b => b.id === betId);
      if (betIndex !== -1 && !currentState.bets[betIndex].isPaid) {
        currentState.bets.splice(betIndex, 1);
        persistAndBroadcast(currentState);
      }
    });

    socket.on('adminTogglePayment', ({ betId, isPaid, password }) => {
      if (password !== '17218') return;
      const bet = currentState.bets.find(b => b.id === betId);
      if (bet) {
        bet.isPaid = Boolean(isPaid);
        console.log(`Payment status toggled for ${bet.name} -> ${bet.isPaid ? 'PAID' : 'UNPAID'}`);
        persistAndBroadcast(currentState);
      }
    });

    socket.on('adminDeleteBet', ({ betId, password }) => {
      if (password !== '17218') return;
      currentState.bets = currentState.bets.filter(b => b.id !== betId);
      persistAndBroadcast(currentState);
    });

    socket.on('adminSetCutoff', ({ cutoffDate, password }) => {
      if (password !== '17218') return;
      currentState.config.cutoffDate = cutoffDate;
      persistAndBroadcast(currentState);
    });

    socket.on('adminSetRevealDate', ({ revealDate, password }) => {
      if (password !== '17218') return;
      currentState.config.revealDate = revealDate;
      persistAndBroadcast(currentState);
    });

    socket.on('adminSetReveal', ({ result, password }) => {
      if (password !== '17218') return;
      currentState.config.revealedResult = result;
      persistAndBroadcast(currentState);
    });

    socket.on('adminResetReveal', ({ password }) => {
      if (password !== '17218') return;
      currentState.config.revealedResult = null;
      persistAndBroadcast(currentState);
    });

    socket.on('adminResetAll', ({ password }) => {
      if (password !== '17218') return;
      currentState.bets = [];
      currentState.config.revealedResult = null;
      persistAndBroadcast(currentState);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  const PORT = process.env.PORT || 3001;
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
