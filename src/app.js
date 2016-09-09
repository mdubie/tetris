let activePiece = {};
let nextPiece = {};
let inactiveSquares = {};
let isNewActivePiece = true;
let score = 0;

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 24;
const NEXT_PIECE_WIDTH = 6;
const NEXT_PIECE_HEIGHT = 6;
const POS_TO_PIXEL = 40;
const PIECE_START_X = 5;
const PIECE_START_Y = -2;
const PIECE_START_ORIENTATION = 0;
const GAMEOVER_CEILING = 2;
const GAMESPEED = 1000 / 45;

const pieceGenerator = () => {
  const piece = pieces[Math.floor(Math.random() * pieces.length)];
  const initialState = {
    x: PIECE_START_X,
    y: PIECE_START_Y,
    orientation: PIECE_START_ORIENTATION,
  };

  return Object.assign(
    piece,
    initialState
  );
};

const isMoveValid = (position, x, y) => {
  return position.every(square => {
    const pos = [square[0] + x, square[1] + y];
    return 0 <= pos[0] && pos[0] < BOARD_WIDTH && !inactiveSquares[pos];
  });
};

const moveActivePiece = (key) => {
  let { orientation, position, x, y } = activePiece;

  if (key === 'ArrowLeft') {
    x--;
  } if (key === 'ArrowRight') {
    x++;
  } if (key === 'ArrowUp') {
    orientation = (orientation + 1) % position.length;
  } if (key === 'ArrowDown') {
    orientation = (orientation - 1 + position.length) % position.length;
  }

  if (isMoveValid(position[orientation], x, y)) {
    activePiece.x = x;
    activePiece.orientation = orientation;
  }
};

const isPieceActive = (piece) => {
  const { orientation, position, x, y } = piece;

  return position[orientation].every(square => {
    const pos = [square[0] + x, square[1] + y + 1];
    return !inactiveSquares[pos] && pos[1] !== BOARD_HEIGHT;
  });
};

const mapActivePieceToInactiveSquares = () => {
  const { orientation, position, x, y, colorA, colorB } = activePiece;

  position[orientation].forEach(square => {
    const pos = [square[0] + x, square[1] + y];
    inactiveSquares[pos] = {
      colorA,
      colorB,
    };
  });
};

const updateActivePiece = () => {
  if (isPieceActive(activePiece)) {
    activePiece.y++;
  } else {
    mapActivePieceToInactiveSquares();
    activePiece = nextPiece;
    nextPiece = pieceGenerator();
    score++;
    isNewActivePiece = true;
  }
};

const deleteRow = (j) => {
  for (let i = 0; i < BOARD_WIDTH; i++) {
    delete inactiveSquares[`${i},${j}`];
  }
};

const shiftDownAfterDelete = (j) => {
  for (j--; j > 0; j--) {
    for (let i = 0; i < BOARD_WIDTH; i++) {
      if (inactiveSquares[`${i},${j}`]) {
        inactiveSquares[`${i},${j + 1}`] = inactiveSquares[`${i},${j}`];
        delete inactiveSquares[`${i},${j}`];
      }
    }
  }
};

const checkRowComplete = () => {
  for (let j = BOARD_HEIGHT - 1; j > 0; j--) {
    let i = 0;
    while (inactiveSquares[`${i},${j}`] && i <= BOARD_WIDTH) {
      i++;
      if (i === BOARD_WIDTH) {
        deleteRow(j);
        shiftDownAfterDelete(j);
      }
    }
  }
};

const checkGameOver = () => {
  for (let i = 0; i < BOARD_WIDTH; i++) {
    if (inactiveSquares[`${i},${GAMEOVER_CEILING}`]) {
      inactiveSquares = {};
      score = 0;
    }
  }
};

const drawSquare = (ctx, x, y, colorA, colorB) => {
  ctx.beginPath();
  const grd = ctx.createLinearGradient(
    (x) * POS_TO_PIXEL,
    (y) * POS_TO_PIXEL,
    (x) * POS_TO_PIXEL + POS_TO_PIXEL,
    (y) * POS_TO_PIXEL + POS_TO_PIXEL
  );
  grd.addColorStop(0, colorA);
  grd.addColorStop(1, colorB);
  ctx.fillStyle = grd;
  ctx.lineWidth = '1';
  ctx.strokeStyle = '#000000';
  ctx.rect(
    (x) * POS_TO_PIXEL,
    (y) * POS_TO_PIXEL,
    POS_TO_PIXEL,
    POS_TO_PIXEL
  );
  ctx.fillRect(
    (x) * POS_TO_PIXEL,
    (y) * POS_TO_PIXEL,
    POS_TO_PIXEL,
    POS_TO_PIXEL
  );
  ctx.stroke();
};

const drawCanvas = (ctx, width, height) => {
  ctx.clearRect(0, 0, width * POS_TO_PIXEL, height * POS_TO_PIXEL);
  ctx.beginPath();
  const grd = ctx.createLinearGradient(
    0,
    0,
    0,
    height * POS_TO_PIXEL
  );
  grd.addColorStop(0, '#FFFFFF');
  grd.addColorStop(1, '#D3D3D3');
  ctx.fillStyle = grd;
  ctx.fillRect(
    0,
    0,
    width * POS_TO_PIXEL,
    height * POS_TO_PIXEL
  );
  ctx.stroke();
};

const renderBoard = (ctx) => {
  const { position, orientation, colorA, colorB, x, y } = activePiece;
  drawCanvas(ctx, BOARD_WIDTH, BOARD_HEIGHT);
  position[orientation].forEach(square => {
    const [i, j] = square;
    drawSquare(ctx, x + i, y + j, colorA, colorB);
  });
  for (const key in inactiveSquares) {
    if (inactiveSquares.hasOwnProperty(key)) {
      const [i, j] = key.split(',').map(num => Number(num));
      const { colorA, colorB } = inactiveSquares[key];
      drawSquare(ctx, i, j, colorA, colorB);
    }
  }
};

const renderNextPiece = (ctxNext) => {
  const { position, orientation, colorA, colorB } = nextPiece;
  drawCanvas(ctxNext, NEXT_PIECE_WIDTH, NEXT_PIECE_HEIGHT);
  position[orientation].forEach(square => {
    const [i, j] = square;
    drawSquare(ctxNext, i + 3, j + 2, colorA, colorB);
  });
};

const renderScoreBoard = () => {
  document.getElementById('score').innerHTML = score;
};

const renderGame = (ctx, ctxNext) => {
  renderBoard(ctx);
  renderNextPiece(ctxNext);
  renderScoreBoard();
  window.requestAnimationFrame(() => {
    renderGame(ctx, ctxNext);
  });
};

document.addEventListener('DOMContentLoaded', () => {
  const ctx = document.getElementById('myCanvas').getContext('2d');
  const ctxNext = document.getElementById('nextPieceCanvas').getContext('2d');
  activePiece = pieceGenerator();
  nextPiece = pieceGenerator();
  renderGame(ctx, ctxNext);

  window.setInterval(() => {
    updateActivePiece();
    checkRowComplete();
    checkGameOver();
  }, GAMESPEED);
});
