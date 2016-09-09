const AGENT_SPEED = 1000 / 45;
let target = {};

const pointParamsToPoints = (params) => {
  const pointValues = {
    touchingBelow: 100,
    touchingAdjacent: 25,
    columnsDeep: 3,
  };

  return params.touchingBelow * pointValues.touchingBelow
    + params.touchingAdjacent * pointValues.touchingAdjacent
    + params.columnsDeep * pointValues.columnsDeep;
};

const pieceLocationToPointParams = (pointParams, square, index, targetPiece) => {
  if (square[1] + 1 === 24) {
    pointParams.touchingBelow++;
  }

  if (inactiveSquares[`${square[0]},${square[1] + 1}`]) {
    pointParams.touchingBelow++;
  }

  for (let k = 0; k < targetPiece.length; k++) {
    const refSquare = targetPiece[k];
    if (square[0] === refSquare[0] && square[1] + 1 === refSquare[1]) {
      pointParams.touchingBelow++;
    }
  }

  if (inactiveSquares[`${square[0] + 1},${square[1]}`]) {
    pointParams.touchingAdjacent++;
  }

  if (inactiveSquares[`${square[0] - 1},${square[1]}`]) {
    pointParams.touchingAdjacent++;
  }

  if (square[0] === 0 || square[0] === BOARD_WIDTH - 1) {
    pointParams.touchingAdjacent++;
  }

  pointParams.columnsDeep += square[1];

  return pointParams;
};

const selectNextLocation = () => {
  let maxPoints = 0;
  let targetOrientation = {};

  for (let i = -2; i <= BOARD_WIDTH + 1; i++) {
    const { position, y } = activePiece;

    for (let o = 0; o < position.length; o++) {
      if (isMoveValid(position[o], i, y)) {
        const prospectivePiece = {
          orientation: o,
          position,
          x: i,
          y,
        };

        while (isPieceActive(prospectivePiece)) {
          prospectivePiece.y++;
        }

        const targetPiece = prospectivePiece.position[prospectivePiece.orientation].map(square => {
          return [square[0] + i, square[1] + prospectivePiece.y];
        });

        const pointParamsInit = {
          touchingBelow: 0,
          touchingAdjacent: 0,
          columnsDeep: 0,
        };

        const pointParams = targetPiece.reduce(pieceLocationToPointParams, pointParamsInit);

        const points = pointParamsToPoints(pointParams);

        if (points > maxPoints) {
          maxPoints = points;
          targetOrientation = prospectivePiece;
        }
      }
    }
  }
  return targetOrientation;
};

const moveTowardsNextLocation = () => {
  if (activePiece.orientation !== target.orientation) {
    moveActivePiece('ArrowUp');
  } else {
    if (activePiece.x > target.x) {
      moveActivePiece('ArrowLeft');
    }

    if (activePiece.x < target.x) {
      moveActivePiece('ArrowRight');
    }
  }
};

window.setInterval(() => {
  if (isNewActivePiece) {
    isNewActivePiece = false;
    target = selectNextLocation();
  } else {
    moveTowardsNextLocation();
  }
}, AGENT_SPEED);
