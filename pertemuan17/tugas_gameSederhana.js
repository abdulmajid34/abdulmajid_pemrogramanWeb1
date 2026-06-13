/**
 * REVERSI GLOW - GAME CONTROLLER (ES6 CLASSES)
 * Pemrograman Web 1 - Pertemuan 17
 */

// Konstanta arah untuk pencarian kepingan yang berdekatan (8 arah)
const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [ 0, -1],          [ 0, 1],
  [ 1, -1], [ 1, 0], [ 1, 1]
];

// Matriks bobot posisi papan untuk AI Hard (Heuristik)
const BOARD_WEIGHTS = [
  [ 100, -20,  10,   5,   5,  10, -20, 100],
  [-20, -50,  -2,  -2,  -2,  -2, -50, -20],
  [  10,  -2,   5,   1,   1,   5,  -2,  10],
  [   5,  -2,   1,   1,   1,   1,  -2,   5],
  [   5,  -2,   1,   1,   1,   1,  -2,   5],
  [  10,  -2,   5,   1,   1,   5,  -2,  10],
  [-20, -50,  -2,  -2,  -2,  -2, -50, -20],
  [ 100, -20,  10,   5,   5,  10, -20, 100]
];

// ==========================================
// 1. SOUND CONTROLLER (Web Audio API Synth)
// ==========================================
class SoundController {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    // Lazy initialization untuk AudioContext
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.06);
    
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  playFlip() {
    if (!this.enabled) return;
    this.init();
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.12);
    
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playWin() {
    if (!this.enabled) return;
    this.init();
    
    const now = this.ctx.currentTime;
    // Nada ceria chord mayor: C4, E4, G4, C5
    const notes = [261.63, 329.63, 392.00, 523.25];
    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + index * 0.1);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + index * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.6);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now + index * 0.1);
      osc.stop(now + index * 0.1 + 0.6);
    });
  }

  playLose() {
    if (!this.enabled) return;
    this.init();
    
    const now = this.ctx.currentTime;
    // Nada sedih chord minor menurun: G4, Eb4, C4, G3
    const notes = [392.00, 311.13, 261.63, 196.00];
    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + index * 0.15);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + index * 0.15 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.15 + 0.8);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now + index * 0.15);
      osc.stop(now + index * 0.15 + 0.8);
    });
  }
}

// ==========================================
// 2. REVERSI BOARD (Core Logical State)
// ==========================================
class ReversiBoard {
  constructor() {
    this.grid = Array(8).fill(null).map(() => Array(8).fill(null));
    this.initBoard();
  }

  initBoard() {
    // Mengosongkan papan
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        this.grid[r][c] = null;
      }
    }
    // Posisi awal Reversi standar (4 kepingan di tengah)
    this.grid[3][3] = 'W'; // Putih
    this.grid[3][4] = 'B'; // Hitam
    this.grid[4][3] = 'B'; // Hitam
    this.grid[4][4] = 'W'; // Putih
  }

  // Mendapatkan warna lawan
  getOpponentColor(color) {
    return color === 'B' ? 'W' : 'B';
  }

  // Menghitung kepingan lawan mana saja yang bisa dibalik jika pemain meletakkan kepingan di (row, col)
  getFlipsForMove(row, col, color) {
    if (this.grid[row][col] !== null) return [];

    const opponent = this.getOpponentColor(color);
    const flips = [];

    // Cari di semua 8 arah
    for (const [dr, dc] of DIRECTIONS) {
      let r = row + dr;
      let c = col + dc;
      const path = [];

      // Telusuri kepingan lawan berturut-turut
      while (r >= 0 && r < 8 && c >= 0 && c < 8 && this.grid[r][c] === opponent) {
        path.push({ row: r, col: c });
        r += dr;
        c += dc;
      }

      // Jika di ujung jalur kepingan lawan adalah kepingan pemain sendiri, maka valid
      if (path.length > 0 && r >= 0 && r < 8 && c >= 0 && c < 8 && this.grid[r][c] === color) {
        flips.push(...path);
      }
    }

    return flips;
  }

  // Memeriksa apakah suatu langkah legal
  isValidMove(row, col, color) {
    return this.getFlipsForMove(row, col, color).length > 0;
  }

  // Mendapatkan semua langkah valid untuk suatu warna pemain
  getValidMoves(color) {
    const validMoves = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.isValidMove(r, c, color)) {
          validMoves.push({ row: r, col: c });
        }
      }
    }
    return validMoves;
  }

  // Menaruh kepingan dan membalik kepingan lawan
  placeDisc(row, col, color) {
    const flips = this.getFlipsForMove(row, col, color);
    if (flips.length === 0) return null;

    this.grid[row][col] = color;
    for (const cell of flips) {
      this.grid[cell.row][cell.col] = color;
    }
    
    return flips; // Mengembalikan kepingan yang dibalik untuk keperluan visual/animasi
  }

  // Menghitung jumlah kepingan hitam dan putih
  countDiscs() {
    let black = 0;
    let white = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.grid[r][c] === 'B') black++;
        if (this.grid[r][c] === 'W') white++;
      }
    }
    return { B: black, W: white };
  }

  // Game over jika kedua pemain tidak memiliki langkah valid
  isGameOver() {
    return this.getValidMoves('B').length === 0 && this.getValidMoves('W').length === 0;
  }

  // Kloning papan untuk evaluasi simulasi AI
  clone() {
    const newBoard = new ReversiBoard();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        newBoard.grid[r][c] = this.grid[r][c];
      }
    }
    return newBoard;
  }
}

// ==========================================
// 3. PLAYER CLASSES (Class & Inheritance)
// ==========================================

// Abstract Player (Kelas Induk)
class ReversiPlayer {
  constructor(color, name) {
    if (this.constructor === ReversiPlayer) {
      throw new Error("Abstract class ReversiPlayer cannot be instantiated directly.");
    }
    this.color = color; // 'B' (Black) atau 'W' (White)
    this.name = name;
  }

  // Method abstract yang akan diturunkan
  async getMove(board, game) {
    throw new Error("Method 'getMove()' must be implemented by subclasses.");
  }
}

// Human Player (Subclass Pemain Manusia)
class HumanPlayer extends ReversiPlayer {
  constructor(color, name) {
    super(color, name);
  }

  // getMove untuk manusia menunggu input klik di papan permainan
  async getMove(board, game) {
    return new Promise((resolve) => {
      game.pendingMoveResolver = resolve;
    });
  }
}

// AI Player (Subclass Pemain Komputer)
class AIPlayer extends ReversiPlayer {
  constructor(color, name, difficulty = 'medium') {
    super(color, name);
    this.difficulty = difficulty; // 'easy', 'medium', 'hard'
  }

  // AI memutuskan langkah berdasarkan tingkat kesulitan
  async getMove(board, game) {
    // Beri delay buatan agar terasa alami bagi pemain manusia
    await new Promise(resolve => setTimeout(resolve, 800));

    const validMoves = board.getValidMoves(this.color);
    if (validMoves.length === 0) return null;

    switch (this.difficulty) {
      case 'easy':
        return this.getRandomMove(validMoves);
      case 'medium':
        return this.getGreedyMove(board, validMoves);
      case 'hard':
        return this.getBestMinimaxMove(board, validMoves);
      default:
        return this.getRandomMove(validMoves);
    }
  }

  // EASY DIFFICULTY: Langkah Acak
  getRandomMove(validMoves) {
    const randomIndex = Math.floor(Math.random() * validMoves.length);
    return validMoves[randomIndex];
  }

  // MEDIUM DIFFICULTY: Pilih langkah yang paling banyak membalik kepingan lawan (Greedy)
  getGreedyMove(board, validMoves) {
    let bestMove = null;
    let maxFlips = -1;

    for (const move of validMoves) {
      const flips = board.getFlipsForMove(move.row, move.col, this.color).length;
      if (flips > maxFlips) {
        maxFlips = flips;
        bestMove = move;
      }
    }
    return bestMove;
  }

  // HARD DIFFICULTY: Pilih langkah terbaik menggunakan pencarian Minimax (Alpha-Beta Pruning)
  getBestMinimaxMove(board, validMoves) {
    let bestMove = null;
    let bestScore = -Infinity;
    const depth = 4; // Kedalaman pencarian optimal

    for (const move of validMoves) {
      const nextBoard = board.clone();
      nextBoard.placeDisc(move.row, move.col, this.color);
      
      // Hitung evaluasi langkah ini dari sudut pandang AI (isMaximizing = false untuk layer berikutnya)
      const score = this.minimax(nextBoard, depth - 1, -Infinity, Infinity, false);
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    
    return bestMove;
  }

  // Evaluasi keadaan papan (Heuristik)
  evaluateBoard(board) {
    let score = 0;
    const oppColor = this.color === 'B' ? 'W' : 'B';

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board.grid[r][c] === this.color) {
          score += BOARD_WEIGHTS[r][c];
        } else if (board.grid[r][c] === oppColor) {
          score -= BOARD_WEIGHTS[r][c];
        }
      }
    }

    // Heuristik tambahan: Mobilitas (banyaknya langkah legal yang tersisa)
    const myMobility = board.getValidMoves(this.color).length;
    const oppMobility = board.getValidMoves(oppColor).length;
    score += (myMobility - oppMobility) * 15;

    return score;
  }

  // Rekursif Minimax dengan Alpha-Beta Pruning
  minimax(board, depth, alpha, beta, isMaximizing) {
    const oppColor = this.color === 'B' ? 'W' : 'B';
    const activeColor = isMaximizing ? this.color : oppColor;
    
    // Keadaan terminal
    if (depth === 0 || board.isGameOver()) {
      return this.evaluateBoard(board);
    }

    const validMoves = board.getValidMoves(activeColor);

    // Kasus jika pemain aktif tidak punya langkah valid (harus Pass)
    if (validMoves.length === 0) {
      const nextPlayerMoves = board.getValidMoves(activeColor === 'B' ? 'W' : 'B');
      if (nextPlayerMoves.length === 0) {
        // Game Over
        return this.evaluateBoard(board);
      }
      // Pass giliran ke pemain satunya
      return this.minimax(board, depth - 1, alpha, beta, !isMaximizing);
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of validMoves) {
        const nextBoard = board.clone();
        nextBoard.placeDisc(move.row, move.col, this.color);
        const evalVal = this.minimax(nextBoard, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, evalVal);
        alpha = Math.max(alpha, evalVal);
        if (beta <= alpha) break; // Beta cut-off
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of validMoves) {
        const nextBoard = board.clone();
        nextBoard.placeDisc(move.row, move.col, oppColor);
        const evalVal = this.minimax(nextBoard, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, evalVal);
        beta = Math.min(beta, evalVal);
        if (beta <= alpha) break; // Alpha cut-off
      }
      return minEval;
    }
  }
}

// ==========================================
// 4. REVERSI GAME (Central State Coordinator)
// ==========================================
class ReversiGame {
  constructor(ui) {
    this.ui = ui;
    this.board = new ReversiBoard();
    this.player1 = null; // Black
    this.player2 = null; // White
    this.currentPlayer = null;
    
    this.gameMode = 'pvp'; // 'pvp' atau 'pvai'
    this.aiDifficulty = 'medium';
    this.isSuggestionsEnabled = true;
    this.isGameOver = false;

    // Untuk sinkronisasi promise gerakan manusia
    this.pendingMoveResolver = null;
  }

  // Inisialisasi game baru
  setupNewGame(mode, difficulty) {
    this.gameMode = mode;
    this.aiDifficulty = difficulty;
    this.isGameOver = false;
    this.pendingMoveResolver = null;
    
    this.board.initBoard();

    // Buat player berdasarkan mode yang dipilih
    if (this.gameMode === 'pvp') {
      this.player1 = new HumanPlayer('B', 'Pemain 1');
      this.player2 = new HumanPlayer('W', 'Pemain 2');
    } else {
      this.player1 = new HumanPlayer('B', 'Anda');
      const diffLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
      this.player2 = new AIPlayer('W', `Komputer (${diffLabel})`, difficulty);
    }

    this.currentPlayer = this.player1; // Hitam selalu jalan pertama
    
    this.ui.updateScoresAndTurn();
    this.ui.updatePlayerNames();
    this.ui.renderInitialBoard();
    this.ui.highlightValidMoves();
    
    this.playTurnLoop();
  }

  // Reset permainan saat ini dengan mode dan musuh yang sama
  resetGame() {
    this.setupNewGame(this.gameMode, this.aiDifficulty);
  }

  // Loop permainan asinkronus (Event-driven)
  async playTurnLoop() {
    while (!this.isGameOver) {
      // 1. Cek apakah ada langkah valid untuk player saat ini
      const validMoves = this.board.getValidMoves(this.currentPlayer.color);

      if (validMoves.length > 0) {
        // Tampilkan loading jika giliran komputer
        if (this.currentPlayer instanceof AIPlayer) {
          this.ui.setStatusBarText(`${this.currentPlayer.name} sedang berpikir...`);
        } else {
          this.ui.setStatusBarText(`Giliran Anda (${this.currentPlayer.name})`);
        }

        // 2. Tunggu input langkah dari player aktif (bisa klik manusia atau kalkulasi AI)
        const move = await this.currentPlayer.getMove(this.board, this);
        
        // Cek jika game di-reset di tengah jalan
        if (move === null || this.isGameOver) return; 

        // 3. Eksekusi langkah
        const flips = this.board.placeDisc(move.row, move.col, this.currentPlayer.color);
        
        if (flips) {
          // Play click & flip sound
          this.ui.soundController.playClick();
          setTimeout(() => this.ui.soundController.playFlip(), 100);
          
          // Perbarui DOM
          this.ui.updateBoardDOM();
          this.ui.updateScoresAndTurn();
        }
      } else {
        // Jika tidak ada langkah, pass giliran ke pemain berikutnya
        const nextColor = this.board.getOpponentColor(this.currentPlayer.color);
        const nextPlayer = this.getPlayerByColor(nextColor);
        const oppValidMoves = this.board.getValidMoves(nextColor);

        if (oppValidMoves.length > 0) {
          // Giliran dilewati (Pass)
          this.ui.showToast(`${this.currentPlayer.name} tidak memiliki langkah valid. Giliran dilewati (Pass)!`);
          await new Promise(resolve => setTimeout(resolve, 1200));
        } else {
          // Keduanya tidak bisa melangkah -> Game Selesai
          this.isGameOver = true;
          this.handleGameOver();
          return;
        }
      }

      // Cek apakah game over setelah kepingan ditempatkan
      if (this.board.isGameOver()) {
        this.isGameOver = true;
        this.handleGameOver();
        return;
      }

      // 4. Ganti Giliran
      this.currentPlayer = (this.currentPlayer === this.player1) ? this.player2 : this.player1;
      this.ui.updateScoresAndTurn();
      this.ui.highlightValidMoves();
    }
  }

  // Mendapatkan objek player berdasarkan warna kepingan
  getPlayerByColor(color) {
    return this.player1.color === color ? this.player1 : this.player2;
  }

  // Mengakhiri permainan dan memproses pemenang
  handleGameOver() {
    const scores = this.board.countDiscs();
    let winner = null;
    let message = '';

    if (scores.B > scores.W) {
      winner = this.player1;
      message = `${this.player1.name} Menang!`;
    } else if (scores.W > scores.B) {
      winner = this.player2;
      message = `${this.player2.name} Menang!`;
    } else {
      message = "Permainan Seri (Draw)!";
    }

    this.ui.setStatusBarText("Permainan Selesai!");

    // Mainkan efek suara sesuai pemenang
    if (this.gameMode === 'pvai') {
      if (winner && winner instanceof HumanPlayer) {
        this.ui.soundController.playWin();
      } else if (winner && winner instanceof AIPlayer) {
        this.ui.soundController.playLose();
      } else {
        this.ui.soundController.playClick();
      }
    } else {
      this.ui.soundController.playWin();
    }

    setTimeout(() => {
      this.ui.showWinnerModal(message, scores.B, scores.W);
    }, 1000);
  }
}

// ==========================================
// 5. REVERSI UI (DOM & Interaction Binder)
// ==========================================
class ReversiUI {
  constructor() {
    this.soundController = new SoundController();
    this.game = new ReversiGame(this);
    
    // DOM Element Pointers
    this.boardElement = document.getElementById('game-board');
    this.nameBlackElement = document.getElementById('name-black');
    this.nameWhiteElement = document.getElementById('name-white');
    this.scoreBlackElement = document.getElementById('score-black');
    this.scoreWhiteElement = document.getElementById('score-white');
    this.cardBlackElement = document.getElementById('player-black-card');
    this.cardWhiteElement = document.getElementById('player-white-card');
    this.statusBarElement = document.getElementById('status-bar');
    this.currentPlayerTurnText = document.getElementById('current-player-turn');
    
    // Toggles & Buttons
    this.toggleSuggestions = document.getElementById('toggle-suggestions');
    this.toggleSounds = document.getElementById('toggle-sounds');
    this.btnReset = document.getElementById('btn-reset');
    this.btnNewGame = document.getElementById('btn-new-game');
    this.btnStartGame = document.getElementById('btn-start-game');
    this.btnModalNewGame = document.getElementById('btn-modal-new-game');

    // Modals
    this.setupModal = document.getElementById('setup-modal');
    this.winnerModal = document.getElementById('winner-modal');
    this.difficultySelection = document.getElementById('difficulty-selection');
    
    this.cellElements = [];

    this.bindEvents();
    this.showSetupModal();
  }

  // Menghubungkan event listener ke DOM
  bindEvents() {
    // Game mode change listener (mengontrol tampilan input kesulitan AI)
    document.querySelectorAll('input[name="game-mode"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.value === 'pvai') {
          this.difficultySelection.classList.remove('hidden');
        } else {
          this.difficultySelection.classList.add('hidden');
        }
      });
    });

    // Mulai permainan dari modal setup
    this.btnStartGame.addEventListener('click', () => {
      const mode = document.querySelector('input[name="game-mode"]:checked').value;
      const difficulty = document.querySelector('input[name="ai-difficulty"]:checked').value;
      this.hideModal(this.setupModal);
      this.game.setupNewGame(mode, difficulty);
    });

    // Reset game button
    this.btnReset.addEventListener('click', () => {
      // Batalkan resolve input gerakan sebelumnya jika ada
      if (this.game.pendingMoveResolver) {
        this.game.pendingMoveResolver(null);
      }
      this.game.resetGame();
    });

    // New game button
    this.btnNewGame.addEventListener('click', () => {
      if (this.game.pendingMoveResolver) {
        this.game.pendingMoveResolver(null);
      }
      this.game.isGameOver = true; // Hentikan loop saat ini
      this.showSetupModal();
    });

    // Main lagi button di modal pemenang
    this.btnModalNewGame.addEventListener('click', () => {
      this.hideModal(this.winnerModal);
      this.showSetupModal();
    });

    // Toggle suggestions
    this.toggleSuggestions.addEventListener('change', (e) => {
      this.game.isSuggestionsEnabled = e.target.checked;
      this.highlightValidMoves();
    });

    // Toggle sounds
    this.toggleSounds.addEventListener('change', (e) => {
      this.soundController.enabled = e.target.checked;
    });
  }

  // Modals Controller
  showSetupModal() {
    this.setupModal.classList.remove('hidden');
  }

  showWinnerModal(title, scoreBlack, scoreWhite) {
    document.getElementById('winner-title').textContent = title;
    document.getElementById('winner-score-black').textContent = scoreBlack;
    document.getElementById('winner-score-white').textContent = scoreWhite;
    
    // Info detail pemenang
    const descEl = document.getElementById('winner-desc');
    if (scoreBlack > scoreWhite) {
      descEl.textContent = `Papan didominasi oleh Kepingan Hitam dengan skor ${scoreBlack} vs ${scoreWhite}.`;
    } else if (scoreWhite > scoreBlack) {
      descEl.textContent = `Papan didominasi oleh Kepingan Putih dengan skor ${scoreWhite} vs ${scoreBlack}.`;
    } else {
      descEl.textContent = `Pertandingan yang sangat seimbang berakhir dengan skor seri ${scoreBlack} - ${scoreWhite}.`;
    }

    this.winnerModal.classList.remove('hidden');
  }

  hideModal(modalElement) {
    modalElement.classList.add('hidden');
  }

  // Inisialisasi awal elemen cell papan
  renderInitialBoard() {
    this.boardElement.innerHTML = '';
    this.cellElements = [];

    for (let r = 0; r < 8; r++) {
      const rowCells = [];
      for (let c = 0; c < 8; c++) {
        const cellEl = document.createElement('div');
        cellEl.className = 'board-cell';
        cellEl.dataset.row = r;
        cellEl.dataset.col = c;
        
        // Hubungkan event klik ke method handleCellClick
        cellEl.addEventListener('click', () => this.handleCellClick(r, c));
        
        this.boardElement.appendChild(cellEl);
        rowCells.push(cellEl);
      }
      this.cellElements.push(rowCells);
    }
    this.updateBoardDOM();
  }

  // Memperbarui visual kepingan di papan berdasarkan array state
  updateBoardDOM() {
    const grid = this.game.board.grid;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cellEl = this.cellElements[r][c];
        const cellVal = grid[r][c];
        let discEl = cellEl.querySelector('.disc');

        if (cellVal !== null) {
          if (!discEl) {
            // Buat kepingan baru jika belum ada
            discEl = document.createElement('div');
            discEl.className = `disc ${cellVal === 'B' ? 'black' : 'white'}`;

            const innerEl = document.createElement('div');
            innerEl.className = 'disc-inner';

            const frontEl = document.createElement('div');
            frontEl.className = 'disc-front';

            const backEl = document.createElement('div');
            backEl.className = 'disc-back';

            innerEl.appendChild(frontEl);
            innerEl.appendChild(backEl);
            discEl.appendChild(innerEl);
            cellEl.appendChild(discEl);

            // Animasi pop-in masuk papan
            discEl.style.transform = 'scale(0)';
            discEl.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.25)';
            requestAnimationFrame(() => {
              discEl.style.transform = 'scale(1)';
            });
          } else {
            // Kepingan sudah ada, cek apakah warnanya berubah
            const isCurrentlyBlack = discEl.classList.contains('black');
            if (cellVal === 'B' && !isCurrentlyBlack) {
              discEl.classList.remove('white');
              discEl.classList.add('black');
            } else if (cellVal === 'W' && isCurrentlyBlack) {
              discEl.classList.remove('black');
              discEl.classList.add('white');
            }
          }
        } else {
          // Kosongkan sel jika tidak ada kepingan
          if (discEl) {
            discEl.remove();
          }
        }
      }
    }
  }

  // Menandai langkah valid (Suggestions)
  highlightValidMoves() {
    const validMoves = (this.game.currentPlayer instanceof HumanPlayer && this.game.isSuggestionsEnabled)
      ? this.game.board.getValidMoves(this.game.currentPlayer.color)
      : [];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cellEl = this.cellElements[r][c];
        const isValid = validMoves.some(m => m.row === r && m.col === c);

        if (isValid) {
          cellEl.classList.add('valid-move');
          if (!cellEl.querySelector('.suggestion-dot')) {
            const dot = document.createElement('div');
            dot.className = 'suggestion-dot';
            cellEl.appendChild(dot);
          }
        } else {
          cellEl.classList.remove('valid-move');
          const dot = cellEl.querySelector('.suggestion-dot');
          if (dot) {
            dot.remove();
          }
        }
      }
    }
  }

  // Event handler ketika sel papan diklik oleh manusia
  handleCellClick(row, col) {
    // Pastikan game aktif, giliran manusia, dan sel tersebut legal
    if (this.game.pendingMoveResolver && this.game.currentPlayer instanceof HumanPlayer) {
      if (this.game.board.isValidMove(row, col, this.game.currentPlayer.color)) {
        const resolve = this.game.pendingMoveResolver;
        this.game.pendingMoveResolver = null; // Kunci input lagi
        resolve({ row, col });
      }
    }
  }

  // Memperbarui nama pemain di Scoreboard
  updatePlayerNames() {
    this.nameBlackElement.textContent = this.game.player1.name;
    this.nameWhiteElement.textContent = this.game.player2.name;
  }

  // Memperbarui skor & indikator giliran aktif di Scoreboard
  updateScoresAndTurn() {
    const scores = this.game.board.countDiscs();
    this.scoreBlackElement.textContent = scores.B;
    this.scoreWhiteElement.textContent = scores.W;

    // Tambah efek getar skala pada skor saat berubah
    this.animateScoreChange(this.scoreBlackElement);
    this.animateScoreChange(this.scoreWhiteElement);

    // Tandai kartu pemain aktif
    if (this.game.currentPlayer === this.game.player1) {
      this.cardBlackElement.classList.add('active');
      this.cardWhiteElement.classList.remove('active');
      this.currentPlayerTurnText.textContent = this.game.player1.name;
      this.currentPlayerTurnText.style.color = '#e2e8f0'; // text white/slate
    } else {
      this.cardWhiteElement.classList.add('active');
      this.cardBlackElement.classList.remove('active');
      this.currentPlayerTurnText.textContent = this.game.player2.name;
      this.currentPlayerTurnText.style.color = '#10b981'; // text emerald
    }
  }

  // Efek mikro animasi pada skor
  animateScoreChange(element) {
    element.style.transform = 'scale(1.25)';
    setTimeout(() => {
      element.style.transform = 'scale(1)';
    }, 200);
  }

  // Memperbarui teks pada Status Bar
  setStatusBarText(text) {
    this.statusBarElement.innerHTML = text;
  }

  // Menampilkan Toast message melayang
  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    
    // Inline styling agar tidak bergantung penuh pada CSS jika belum direfresh
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '30px',
      left: '50%',
      transform: 'translate(-50%, 40px)',
      background: 'rgba(16, 185, 129, 0.95)',
      color: '#ffffff',
      padding: '12px 24px',
      borderRadius: '30px',
      fontSize: '0.9rem',
      fontWeight: '600',
      boxShadow: '0 10px 25px rgba(0,0,0,0.5), 0 0 15px rgba(16,185,129,0.3)',
      opacity: '0',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.25)',
      zIndex: '200',
      pointerEvents: 'none'
    });

    document.body.appendChild(toast);
    
    // Slide up + Fade in
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translate(-50%, 0)';
    }, 50);

    // Fade out + Remove
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%, -30px)';
      setTimeout(() => toast.remove(), 400);
    }, 2500);
  }
}

// Inisialisasi program saat DOM siap
window.addEventListener('DOMContentLoaded', () => {
  new ReversiUI();
});
