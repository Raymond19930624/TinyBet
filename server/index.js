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
  bets: [
    {
      id: "bet_1788425403650_9tlm7",
      name: "林佳瑩",
      team: "princess",
      amount: 600,
      note: "無條件支持公主🤩",
      isPaid: false,
      createdAt: "2026-09-03T08:50:03.650Z"
    }
  ],
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

// 雲端唯一權威數據庫 (Cloud Single Source of Truth)
async function fetchStateFromCloud() {
  try {
    const response = await fetch(CLOUD_STORAGE_URL);
    if (response.ok) {
      const json = await response.json();
      if (json && json.data && Array.isArray(json.data.bets) && json.data.bets.length > 0) {
        json.data.bets = json.data.bets.map(normalizeBetTeam);
        console.log(`Successfully fetched ${json.data.bets.length} bets from cloud authoritative storage!`);
        return json.data;
      }
    }
  } catch (err) {
    console.error('Failed to load state from cloud snapshot:', err);
  }
  return null;
}

// 雲端快照同步
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
    console.log('State successfully synced to cloud snapshot persistence!');
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
  syncStateToCloud(state);
  io.emit('stateUpdate', state);
};

// 🌟 核心：開機完成雲端數據加載後，才全自動開啟 Socket 連線監聽
async function startServer() {
  const cloudData = await fetchStateFromCloud();
  if (cloudData && Array.isArray(cloudData.bets) && cloudData.bets.length > 0) {
    currentState = cloudData;
    console.log(`Server initialized with ${currentState.bets.length} cloud bets!`);
  } else {
    // 若雲端為空，確保林佳瑩保底寫入雲端
    syncStateToCloud(currentState);
  }

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    currentState.bets = currentState.bets.map(normalizeBetTeam);
    socket.emit('stateUpdate', currentState);

    socket.on('addBet', (newBet) => {
      const cleanBet = normalizeBetTeam(newBet);
      currentState.bets = [cleanBet, ...currentState.bets];
      persistAndBroadcast(currentState);
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
        bet.isPaid = isPaid;
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
