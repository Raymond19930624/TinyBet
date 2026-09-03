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

const defaultState = {
  bets: [],
  config: {
    cutoffDate: '2026-09-05T17:00:00+08:00',
    revealDate: '2026-09-05T17:30:00+08:00',
    revealedResult: null
  }
};

function loadState() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading data.json:', err);
  }
  return defaultState;
}

function saveState(state) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving data.json:', err);
  }
}

let currentState = loadState();

const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.emit('stateUpdate', currentState);

  socket.on('addBet', (newBet) => {
    currentState.bets = [newBet, ...currentState.bets];
    saveState(currentState);
    io.emit('stateUpdate', currentState);
  });

  socket.on('cancelBet', ({ betId }) => {
    const betIndex = currentState.bets.findIndex(b => b.id === betId);
    if (betIndex !== -1 && !currentState.bets[betIndex].isPaid) {
      currentState.bets.splice(betIndex, 1);
      saveState(currentState);
      io.emit('stateUpdate', currentState);
    }
  });

  socket.on('adminTogglePayment', ({ betId, isPaid, password }) => {
    if (password !== '17218') return;
    const bet = currentState.bets.find(b => b.id === betId);
    if (bet) {
      bet.isPaid = isPaid;
      saveState(currentState);
      io.emit('stateUpdate', currentState);
    }
  });

  socket.on('adminDeleteBet', ({ betId, password }) => {
    if (password !== '17218') return;
    currentState.bets = currentState.bets.filter(b => b.id !== betId);
    saveState(currentState);
    io.emit('stateUpdate', currentState);
  });

  socket.on('adminSetCutoff', ({ cutoffDate, password }) => {
    if (password !== '17218') return;
    currentState.config.cutoffDate = cutoffDate;
    saveState(currentState);
    io.emit('stateUpdate', currentState);
  });

  socket.on('adminSetReveal', ({ result, password }) => {
    if (password !== '17218') return;
    currentState.config.revealedResult = result;
    saveState(currentState);
    io.emit('stateUpdate', currentState);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
