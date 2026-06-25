const board = Array(9).fill(null);
let current = 'X';

const cells = [...document.querySelectorAll('[data-cell]')];
const statusEl = document.querySelector('#status');
const resetBtn = document.querySelector('#reset');

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const result = () => {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  return board.every(Boolean) ? { winner: 'draw' } : null;
};

const render = () => {
  cells.forEach((cell, i) => {
    cell.textContent = board[i] ?? '';
    cell.classList.toggle('taken', Boolean(board[i]));
  });
};

const updateStatus = () => {
  const r = result();
  if (!r) {
    statusEl.textContent = `${current}'s turn`;
    return;
  }
  statusEl.textContent = r.winner === 'draw' ? "It's a draw" : `${r.winner} wins!`;
  if (r.line) r.line.forEach((i) => cells[i].classList.add('win'));
};

const play = (i) => {
  if (board[i] || result()) return;
  board[i] = current;
  current = current === 'X' ? 'O' : 'X';
  render();
  updateStatus();
};

const reset = () => {
  board.fill(null);
  current = 'X';
  cells.forEach((cell) => cell.classList.remove('win'));
  render();
  updateStatus();
};

cells.forEach((cell, i) => cell.addEventListener('click', () => play(i)));
resetBtn.addEventListener('click', reset);
updateStatus();
