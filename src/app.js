let activePiece = {};
let inactiveSquares = {};

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 24;
const POS_TO_PIXEL = 50;
const PIECE_START_X = 5;
const PIECE_START_Y = -2;
const PIECE_START_ORIENTATION = 0;
const GAMEOVER_CEILING = 2;
const GAMESPEED = 1000/10;

const pieceGenerator = () => {
  const piece = pieces[Math.floor(Math.random() * pieces.length)]
  const initialState = {
    x: PIECE_START_X,
    y: PIECE_START_Y,
    orientation: PIECE_START_ORIENTATION,
  };
  
  return Object.assign(
    piece,
    initialState
  );
}

const isMoveValid = (position, x, y) => {
  return position.every(square => {
    const pos = [square[0] + x, square[1] + y]
    return 0 <= pos[0] && pos[0] < BOARD_WIDTH && !inactiveSquares[pos];
  }) 
}

const moveActivePiece = function(key){
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

const isPieceActive = () => {
  const { orientation, position, x, y } = activePiece;

  return position[orientation].every(square => {
    const pos = [square[0] + x, square[1] + y + 1]
    return !inactiveSquares[pos] && pos[1] !== BOARD_HEIGHT;
  })
}

const mapActivePieceToInactiveSquares = () => {
  const { orientation, position, x, y, color } = activePiece;

  position[orientation].forEach(square => {
    const pos = [square[0] + x, square[1] + y]
    inactiveSquares[pos] = color;
  })
}

const updateActivePiece = () => {
  let { orientation, position, x, y, color } = activePiece;

  if (isPieceActive()) {
    activePiece.y++;
  } else {
    mapActivePieceToInactiveSquares();
    activePiece = pieceGenerator();
  }
}

const shiftDownAfterDelete = (j) => {
  for (j--; j > 0; j--) {
    for (let i = 0; i < BOARD_WIDTH; i++) {
      if (inactiveSquares[`${i},${j}`]) {
        inactiveSquares[`${i},${j + 1}`] = inactiveSquares[`${i},${j}`];
        delete inactiveSquares[`${i},${j}`]
      }
    }
  }
}

const deleteRow = (j) => {
  for (let i = 0; i < BOARD_WIDTH; i++) {
    delete inactiveSquares[`${i},${j}`];
  }
}

const checkRowComplete = () => {
  for (let j = BOARD_HEIGHT - 1; j > 0; j--) {
    let i = 0;
    while (inactiveSquares[`${i},${j}`] && i < BOARD_WIDTH) {
      i++;
      if (i === BOARD_WIDTH - 1) {
        deleteRow(j);
        shiftDownAfterDelete(j);
      }
    }
  }
}

const checkGameOver = () => {
  for (let i = 0; i < BOARD_WIDTH; i++) {
    if (inactiveSquares[`${i},${GAMEOVER_CEILING}`]) {
      inactiveSquares = {};
    }
  }
}

const drawSquare = (ctx, x, y, color) => {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.fillRect(
    (x) * POS_TO_PIXEL,
    (y) * POS_TO_PIXEL,
    POS_TO_PIXEL,
    POS_TO_PIXEL
  )
  ctx.stroke();
}

const renderGame = (ctx) => {
  ctx.clearRect(0, 0, BOARD_WIDTH * POS_TO_PIXEL, BOARD_HEIGHT * POS_TO_PIXEL)

  const { x, y, color, orientation, position } = activePiece;

  position[orientation].forEach(square => {
    const [i, j] = square;
    drawSquare(ctx, x + i, y + j, color)
  })

  for (let key in inactiveSquares) {
    const [i, j] = key.split(',').map(num => Number(num))
    const color = inactiveSquares[key];
    drawSquare(ctx, i, j, color)
  }

  window.requestAnimationFrame(() => {
    renderGame(ctx)
  })
}

document.addEventListener('DOMContentLoaded', () => {
  const ctx = document.getElementById('myCanvas').getContext('2d');
  activePiece = pieceGenerator();
  renderGame(ctx);

  document.addEventListener('keydown', (event) => {
    moveActivePiece(event.key);
  });

  window.setInterval(() => {
    updateActivePiece();
    checkRowComplete();
    checkGameOver();
  }, GAMESPEED);
});