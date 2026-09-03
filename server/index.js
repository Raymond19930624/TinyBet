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

const DATA_FILE = path.join(__dirname, 'data.json');
const CLOUD_STORAGE_URL = 'https://api.restful-api.dev/objects/ff808181a0662e5201a0663b9da7000c';

const masterBets = [
  {
    id: 'bet_1788428604000_ssam1',
    name: '素韶阿嬤',
    team: 'princess',
    amount: 500,
    note: '男生女生一樣好，阿嬤2邊都下注',
    isPaid: true,
    createdAt: '2026-09-03T09:43:24.000Z'
  },
  {
    id: 'bet_1788427853888_l0jzt',
    name: '王奕惟元寶爸',
    team: 'prince',
    amount: 500,
    note: '最好大家都選女的，我一人獨得😆😆😆',
    isPaid: true,
    createdAt: '2026-09-03T09:30:53.888Z'
  },
  {
    id: 'bet_1788426928000_jhy02',
    name: '佳慧姨',
    team: 'princess',
    amount: 600,
    note: '小元寶，乖乖健康長大！王子公主阿姨都愛❤️',
    isPaid: true,
    createdAt: '2026-09-03T09:15:28.000Z'
  },
  {
    id: 'bet_1788426779000_ypm01',
    name: '林以平元寶媽',
    team: 'princess',
    amount: 500,
    note: '元寶乖乖～希望你健康長大我們一起欺負爸爸',
    isPaid: true,
    createdAt: '2026-09-03T09:12:59.000Z'
  },
  {
    id: 'bet_1788425403650_9tlm7',
    name: '林佳瑩',
    team: 'princess',
    amount: 600,
    note: '無條件支持公主🤩',
    isPaid: true,
    createdAt: '2026-09-03T08:50:03.650Z'
  }
];

const defaultState = {
  bets: masterBets,
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

function loadStateFromDisk() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const state = JSON.parse(raw);
      if (state && Array.isArray(state.bets) && state.bets.length > 0) {
        state.bets = deduplicateBets(state.bets);
        return state;
      }
    }
  } catch (err) {
    console.error('Error reading data.json:', err);
  }
  return defaultState;
}

function saveStateToDisk(state) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving data.json:', err);
  }
}

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
    console.log('State & Master Config successfully synced to cloud storage!');
  } catch (err) {
    console.error('Failed to sync state to cloud snapshot:', err);
  }
}

let currentState = loadStateFromDisk();

const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const persistAndBroadcast = (state) => {
  state.bets = deduplicateBets(state.bets);
  saveStateToDisk(state);
  syncStateToCloud(state);
  io.emit('stateUpdate', state);
};

async function startServer() {
  // 開機優先載入硬碟
  saveStateToDisk(currentState);

  // 從雲端抓取最高權威的「管理者自訂時間 config」與「歷史下注」
  const cloudData = await fetchStateFromCloud();
  if (cloudData) {
    const cloudBets = Array.isArray(cloudData.bets) && cloudData.bets.length > 0 
      ? deduplicateBets([...cloudData.bets, ...currentState.bets])
      : currentState.bets;

    // 🌟 時間設定：優先採用雲端上記錄的管理者自訂時間！
    const masterConfig = {
      ...currentState.config,
      ...(cloudData.config || {})
    };

    currentState = {
      bets: cloudBets,
      config: masterConfig
    };
    saveStateToDisk(currentState);
    console.log(`Server initialized! Time config locked from cloud: Cutoff=${currentState.config.cutoffDate}, Reveal=${currentState.config.revealDate}`);
  } else {
    syncStateToCloud(currentState);
  }

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    currentState.bets = deduplicateBets(currentState.bets);
    socket.emit('stateUpdate', currentState);

    socket.on('addBet', (newBet) => {
      const cleanBet = normalizeBetTeam(newBet);
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
      console.log('Cutoff date updated by admin:', cutoffDate);
      persistAndBroadcast(currentState);
    });

    socket.on('adminSetRevealDate', ({ revealDate, password }) => {
      if (password !== '17218') return;
      currentState.config.revealDate = revealDate;
      console.log('Reveal date updated by admin:', revealDate);
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
