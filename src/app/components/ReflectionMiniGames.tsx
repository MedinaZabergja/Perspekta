import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, MoveLeft, MoveRight, RefreshCw, RotateCw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

type MiniGameId = 'stack' | 'match' | 'merge';
type Coord = { row: number; col: number };

const GAME_DETAILS: Record<
  MiniGameId,
  { title: string; emoji: string; why: string; subtitle: string }
> = {
  stack: {
    title: 'Stack Drop',
    emoji: '🧩',
    subtitle: 'Tetris-like focus game',
    why: 'Fast spatial decisions can interrupt rumination loops and gently shift attention into the present moment.',
  },
  match: {
    title: 'Color Match',
    emoji: '🍬',
    subtitle: 'Candy-style matching game',
    why: 'Matching patterns creates short reward cycles, which can help the brain step out of threat-focused thinking.',
  },
  merge: {
    title: 'Zen Tile Merge',
    emoji: '🔢',
    subtitle: '2048-style calm puzzle',
    why: 'Slow pattern planning and gentle problem-solving can reduce stress by giving your mind a structured, predictable focus.',
  },
};

export default function ReflectionMiniGames() {
  const [selectedGame, setSelectedGame] = useState<MiniGameId>('stack');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="rounded-2xl border border-[#AED7D3]/50 bg-[#e8f7f5]/45 p-5 space-y-4">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full rounded-2xl border border-[#AED7D3]/70 bg-white/80 px-4 py-3 text-left transition-colors hover:bg-white"
        aria-expanded={isOpen}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl text-[#3d3244]">Mini Game Break Zone</h2>
            <p className="text-sm text-[#B5A4AC]">
              Click to {isOpen ? 'hide' : 'open'} 3 calming mini games.
            </p>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-[#B5A4AC] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {isOpen && (
        <>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {(Object.keys(GAME_DETAILS) as MiniGameId[]).map((gameId) => {
              const game = GAME_DETAILS[gameId];
              const selected = selectedGame === gameId;

              return (
                <button
                  key={gameId}
                  onClick={() => setSelectedGame(gameId)}
                  className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                    selected
                      ? 'border-[#F1C6D9] bg-white text-[#3d3244]'
                      : 'border-[#AED7D3]/60 bg-white/70 text-[#B5A4AC] hover:bg-white'
                  }`}
                >
                  <p className="text-base font-medium">
                    {game.emoji} {game.title}
                  </p>
                  <p className="text-xs mt-1">{game.subtitle}</p>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl bg-white p-4 border border-[#F1C6D9]/25">
            {selectedGame === 'stack' && <StackDropGame isActive={isOpen} />}
            {selectedGame === 'match' && <ColorMatchGame />}
            {selectedGame === 'merge' && <TileMergeGame />}
          </div>

          <p className="text-xs text-[#B5A4AC] leading-relaxed">
            Why this game: <span className="text-[#3d3244]">{GAME_DETAILS[selectedGame].why}</span>
          </p>
        </>
      )}
    </section>
  );
}

const STACK_ROWS = 14;
const STACK_COLS = 8;
const STACK_SHAPES: number[][][] = [
  [[1, 1, 1, 1]],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [
    [1, 0],
    [1, 0],
    [1, 1],
  ],
  [
    [0, 1],
    [0, 1],
    [1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
];
const STACK_COLORS = ['#F1C6D9', '#AED7D3', '#C3D162', '#9EC5FE', '#FFC78A', '#C5B3FF', '#FF9E9E'];
type StackCell = string | null;
interface StackPiece {
  shape: number[][];
  row: number;
  col: number;
  color: string;
}
interface StackState {
  board: StackCell[][];
  piece: StackPiece;
  score: number;
  lines: number;
  gameOver: boolean;
  clearingRows: number[];
  postClear: {
    board: StackCell[][];
    piece: StackPiece;
    gameOver: boolean;
  } | null;
  clearPulse: number;
}

const createStackBoard = (): StackCell[][] =>
  Array.from({ length: STACK_ROWS }, () => Array.from({ length: STACK_COLS }, () => null));

const randomFrom = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

const createStackPiece = (): StackPiece => {
  const shape = randomFrom(STACK_SHAPES).map((row) => [...row]);
  return {
    shape,
    row: 0,
    col: Math.floor((STACK_COLS - shape[0].length) / 2),
    color: randomFrom(STACK_COLORS),
  };
};

const rotateShape = (shape: number[][]): number[][] => {
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated: number[][] = Array.from({ length: cols }, () => Array.from({ length: rows }, () => 0));
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      rotated[col][rows - 1 - row] = shape[row][col];
    }
  }
  return rotated;
};

const canPlacePiece = (
  board: StackCell[][],
  piece: StackPiece,
  rowOffset: number,
  colOffset: number,
  nextShape?: number[][]
): boolean => {
  const shape = nextShape ?? piece.shape;
  for (let row = 0; row < shape.length; row += 1) {
    for (let col = 0; col < shape[row].length; col += 1) {
      if (!shape[row][col]) continue;
      const nextRow = piece.row + rowOffset + row;
      const nextCol = piece.col + colOffset + col;
      if (nextCol < 0 || nextCol >= STACK_COLS || nextRow >= STACK_ROWS) return false;
      if (nextRow >= 0 && board[nextRow][nextCol]) return false;
    }
  }
  return true;
};

const lockStackPiece = (board: StackCell[][], piece: StackPiece): StackCell[][] => {
  const nextBoard = board.map((row) => [...row]);
  for (let row = 0; row < piece.shape.length; row += 1) {
    for (let col = 0; col < piece.shape[row].length; col += 1) {
      if (!piece.shape[row][col]) continue;
      const boardRow = piece.row + row;
      const boardCol = piece.col + col;
      if (boardRow >= 0 && boardRow < STACK_ROWS && boardCol >= 0 && boardCol < STACK_COLS) {
        nextBoard[boardRow][boardCol] = piece.color;
      }
    }
  }
  return nextBoard;
};

const clearStackLines = (
  board: StackCell[][]
): { board: StackCell[][]; cleared: number; rowIndices: number[] } => {
  const rowIndices: number[] = [];
  const remainingRows: StackCell[][] = [];

  board.forEach((row, rowIndex) => {
    if (row.every((cell) => cell !== null)) {
      rowIndices.push(rowIndex);
    } else {
      remainingRows.push(row);
    }
  });

  const cleared = rowIndices.length;
  const newRows = Array.from({ length: cleared }, () => Array.from({ length: STACK_COLS }, () => null));
  return { board: [...newRows, ...remainingRows], cleared, rowIndices };
};

const LINE_SCORE = [0, 100, 300, 500, 800];

const createInitialStackState = (): StackState => ({
  board: createStackBoard(),
  piece: createStackPiece(),
  score: 0,
  lines: 0,
  gameOver: false,
  clearingRows: [],
  postClear: null,
  clearPulse: 0,
});

const advanceStackState = (state: StackState): StackState => {
  if (state.gameOver || state.clearingRows.length > 0) return state;
  if (canPlacePiece(state.board, state.piece, 1, 0)) {
    return {
      ...state,
      piece: {
        ...state.piece,
        row: state.piece.row + 1,
      },
    };
  }

  const lockedBoard = lockStackPiece(state.board, state.piece);
  const { board: cleanedBoard, cleared, rowIndices } = clearStackLines(lockedBoard);

  if (cleared > 0) {
    const nextPiece = createStackPiece();
    const gameOver = !canPlacePiece(cleanedBoard, nextPiece, 0, 0);
    return {
      ...state,
      board: lockedBoard,
      score: state.score + LINE_SCORE[cleared],
      lines: state.lines + cleared,
      clearingRows: rowIndices,
      postClear: {
        board: cleanedBoard,
        piece: nextPiece,
        gameOver,
      },
      clearPulse: state.clearPulse + 1,
    };
  }

  const nextPiece = createStackPiece();

  if (!canPlacePiece(cleanedBoard, nextPiece, 0, 0)) {
    return {
      ...state,
      board: cleanedBoard,
      piece: nextPiece,
      gameOver: true,
    };
  }

  return {
    ...state,
    board: cleanedBoard,
    piece: nextPiece,
    score: state.score + LINE_SCORE[cleared],
    lines: state.lines + cleared,
  };
};

const overlayPiece = (board: StackCell[][], piece: StackPiece): StackCell[][] => {
  const nextBoard = board.map((row) => [...row]);
  for (let row = 0; row < piece.shape.length; row += 1) {
    for (let col = 0; col < piece.shape[row].length; col += 1) {
      if (!piece.shape[row][col]) continue;
      const boardRow = piece.row + row;
      const boardCol = piece.col + col;
      if (boardRow >= 0 && boardRow < STACK_ROWS && boardCol >= 0 && boardCol < STACK_COLS) {
        nextBoard[boardRow][boardCol] = piece.color;
      }
    }
  }
  return nextBoard;
};

function StackDropGame({ isActive }: { isActive: boolean }) {
  const [state, setState] = useState<StackState>(() => createInitialStackState());

  const moveHorizontal = useCallback((direction: -1 | 1) => {
    setState((prev) => {
      if (prev.gameOver || prev.clearingRows.length > 0) return prev;
      if (!canPlacePiece(prev.board, prev.piece, 0, direction)) return prev;
      return {
        ...prev,
        piece: {
          ...prev.piece,
          col: prev.piece.col + direction,
        },
      };
    });
  }, []);

  const softDrop = useCallback(() => {
    setState((prev) => advanceStackState(prev));
  }, []);

  const rotate = useCallback(() => {
    setState((prev) => {
      if (prev.gameOver || prev.clearingRows.length > 0) return prev;
      const rotated = rotateShape(prev.piece.shape);
      if (!canPlacePiece(prev.board, prev.piece, 0, 0, rotated)) return prev;
      return {
        ...prev,
        piece: {
          ...prev.piece,
          shape: rotated,
        },
      };
    });
  }, []);

  const restart = useCallback(() => {
    setState(createInitialStackState());
  }, []);

  useEffect(() => {
    if (!isActive || state.gameOver || state.clearingRows.length > 0) return undefined;
    const timer = setInterval(() => {
      setState((prev) => advanceStackState(prev));
    }, 650);
    return () => clearInterval(timer);
  }, [isActive, state.gameOver, state.clearingRows.length]);

  useEffect(() => {
    if (!isActive) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        moveHorizontal(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        moveHorizontal(1);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        softDrop();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        rotate();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isActive, moveHorizontal, rotate, softDrop]);

  useEffect(() => {
    if (!state.clearingRows.length || !state.postClear) return undefined;

    const timer = window.setTimeout(() => {
      setState((prev) => {
        if (!prev.postClear) return prev;
        return {
          ...prev,
          board: prev.postClear.board,
          piece: prev.postClear.piece,
          gameOver: prev.postClear.gameOver,
          clearingRows: [],
          postClear: null,
        };
      });
    }, 180);

    return () => window.clearTimeout(timer);
  }, [state.clearingRows.length, state.postClear]);

  const displayBoard = useMemo(() => overlayPiece(state.board, state.piece), [state.board, state.piece]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <p className="text-[#3d3244]">Score: {state.score}</p>
        <p className="text-[#B5A4AC]">Lines: {state.lines}</p>
      </div>

      <div
        className="mx-auto grid max-w-[18rem] gap-1 rounded-2xl bg-[#f8eef3] p-3"
        style={{ gridTemplateColumns: `repeat(${STACK_COLS}, minmax(0, 1fr))` }}
      >
        {displayBoard.flatMap((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`aspect-square rounded-sm border border-white/40 transition-all ${
                state.clearingRows.includes(rowIndex) && cell ? 'animate-pulse scale-90 opacity-60' : ''
              }`}
              style={{ backgroundColor: cell ?? '#fff8fb' }}
            />
          ))
        )}
      </div>

      <AnimatePresence>
        {state.clearingRows.length > 0 && (
          <motion.p
            key={state.clearPulse}
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-center text-sm text-[#F1C6D9]"
          >
            ✨ Line clear!
          </motion.p>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => moveHorizontal(-1)}
          className="rounded-xl bg-[#e8f7f5] px-3 py-2 text-[#3d3244] hover:bg-[#AED7D3] transition-colors flex items-center justify-center"
          aria-label="Move piece left"
        >
          <MoveLeft className="w-4 h-4" />
        </button>
        <button
          onClick={rotate}
          className="rounded-xl bg-[#e8f7f5] px-3 py-2 text-[#3d3244] hover:bg-[#AED7D3] transition-colors flex items-center justify-center"
          aria-label="Rotate piece"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          onClick={softDrop}
          className="rounded-xl bg-[#e8f7f5] px-3 py-2 text-[#3d3244] hover:bg-[#AED7D3] transition-colors flex items-center justify-center"
          aria-label="Move piece down"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
        <button
          onClick={() => moveHorizontal(1)}
          className="rounded-xl bg-[#e8f7f5] px-3 py-2 text-[#3d3244] hover:bg-[#AED7D3] transition-colors flex items-center justify-center"
          aria-label="Move piece right"
        >
          <MoveRight className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={restart}
        className="w-full rounded-xl bg-[#F1C6D9] px-4 py-2 text-white hover:bg-[#e5b0c7] transition-colors flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Restart
      </button>

      {state.gameOver && (
        <p className="text-center text-sm text-[#B5A4AC]">Game over. Reset whenever you want another round.</p>
      )}
    </div>
  );
}

const MATCH_ROWS = 7;
const MATCH_COLS = 7;
const CANDIES = [
  { emoji: '🍓', color: '#fda4af' },
  { emoji: '🍋', color: '#fde68a' },
  { emoji: '🫐', color: '#bfdbfe' },
  { emoji: '🍇', color: '#ddd6fe' },
  { emoji: '🍏', color: '#bbf7d0' },
  { emoji: '🍊', color: '#fdba74' },
];
type MatchGrid = number[][];
type MatchFallMap = number[][];

interface MatchState {
  grid: MatchGrid;
  score: number;
  moves: number;
  feedback: string;
  eliminating: string[];
  isResolving: boolean;
  fallMap: MatchFallMap;
  fallTick: number;
  successTick: number;
  animationToken: number;
}

const cloneGrid = <T,>(grid: T[][]): T[][] => grid.map((row) => [...row]);
const randomCandyIndex = (): number => Math.floor(Math.random() * CANDIES.length);
const createZeroMatchGrid = (): MatchFallMap =>
  Array.from({ length: MATCH_ROWS }, () => Array.from({ length: MATCH_COLS }, () => 0));

const createMatchGrid = (): MatchGrid => {
  const grid: MatchGrid = Array.from({ length: MATCH_ROWS }, () => Array.from({ length: MATCH_COLS }, () => 0));
  for (let row = 0; row < MATCH_ROWS; row += 1) {
    for (let col = 0; col < MATCH_COLS; col += 1) {
      let nextValue = randomCandyIndex();
      while (
        (col >= 2 && grid[row][col - 1] === nextValue && grid[row][col - 2] === nextValue) ||
        (row >= 2 && grid[row - 1][col] === nextValue && grid[row - 2][col] === nextValue)
      ) {
        nextValue = randomCandyIndex();
      }
      grid[row][col] = nextValue;
    }
  }
  return grid;
};

const getMatchCells = (grid: MatchGrid): Set<string> => {
  const matches = new Set<string>();

  for (let row = 0; row < MATCH_ROWS; row += 1) {
    let streak = 1;
    for (let col = 1; col <= MATCH_COLS; col += 1) {
      const same = col < MATCH_COLS && grid[row][col] === grid[row][col - 1];
      if (same) {
        streak += 1;
      } else {
        if (streak >= 3) {
          for (let index = 0; index < streak; index += 1) {
            matches.add(`${row},${col - 1 - index}`);
          }
        }
        streak = 1;
      }
    }
  }

  for (let col = 0; col < MATCH_COLS; col += 1) {
    let streak = 1;
    for (let row = 1; row <= MATCH_ROWS; row += 1) {
      const same = row < MATCH_ROWS && grid[row][col] === grid[row - 1][col];
      if (same) {
        streak += 1;
      } else {
        if (streak >= 3) {
          for (let index = 0; index < streak; index += 1) {
            matches.add(`${row - 1 - index},${col}`);
          }
        }
        streak = 1;
      }
    }
  }

  return matches;
};

const swapCells = (grid: MatchGrid, first: Coord, second: Coord): MatchGrid => {
  const next = cloneGrid(grid);
  const value = next[first.row][first.col];
  next[first.row][first.col] = next[second.row][second.col];
  next[second.row][second.col] = value;
  return next;
};

const resolveMatchGrid = (
  source: MatchGrid
): { grid: MatchGrid; points: number; cascades: number; fallMap: MatchFallMap } => {
  const grid = cloneGrid(source);
  const fallMap = createZeroMatchGrid();
  let points = 0;
  let cascades = 0;

  while (true) {
    const matches = getMatchCells(grid);
    if (!matches.size) break;
    cascades += 1;
    points += matches.size * 10 * cascades;

    for (const key of matches) {
      const [row, col] = key.split(',').map(Number);
      grid[row][col] = -1;
    }

    for (let col = 0; col < MATCH_COLS; col += 1) {
      const remaining: { value: number; fromRow: number }[] = [];
      for (let row = MATCH_ROWS - 1; row >= 0; row -= 1) {
        if (grid[row][col] !== -1) {
          remaining.push({ value: grid[row][col], fromRow: row });
        }
      }

      let targetRow = MATCH_ROWS - 1;
      remaining.forEach((tile) => {
        grid[targetRow][col] = tile.value;
        fallMap[targetRow][col] = Math.max(fallMap[targetRow][col], targetRow - tile.fromRow);
        targetRow -= 1;
      });

      while (targetRow >= 0) {
        grid[targetRow][col] = randomCandyIndex();
        fallMap[targetRow][col] = Math.max(fallMap[targetRow][col], targetRow + 1);
        targetRow -= 1;
      }
    }
  }

  return { grid, points, cascades, fallMap };
};

const isAdjacent = (first: Coord, second: Coord): boolean =>
  Math.abs(first.row - second.row) + Math.abs(first.col - second.col) === 1;

const resolveSwipeDirection = (
  deltaX: number,
  deltaY: number
): { rowShift: number; colShift: number } | null => {
  if (Math.abs(deltaX) < 14 && Math.abs(deltaY) < 14) return null;
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return { rowShift: 0, colShift: deltaX > 0 ? 1 : -1 };
  }
  return { rowShift: deltaY > 0 ? 1 : -1, colShift: 0 };
};

function ColorMatchGame() {
  const [state, setState] = useState<MatchState>({
    grid: createMatchGrid(),
    score: 0,
    moves: 0,
    feedback: 'Swipe a tile to an adjacent tile.',
    eliminating: [],
    isResolving: false,
    fallMap: createZeroMatchGrid(),
    fallTick: 0,
    successTick: 0,
    animationToken: 0,
  });
  const [dragStart, setDragStart] = useState<{ coord: Coord; x: number; y: number } | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(
    () => () => {
      timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    },
    []
  );

  const attemptSwap = useCallback((start: Coord, end: Coord) => {
    setState((prev) => {
      if (prev.isResolving || !isAdjacent(start, end)) return prev;

      const swapped = swapCells(prev.grid, start, end);
      const possibleMatches = getMatchCells(swapped);
      if (!possibleMatches.size) {
        return {
          ...prev,
          feedback: 'No match yet - try another swipe.',
        };
      }

      const token = prev.animationToken + 1;
      const eliminating = Array.from(possibleMatches);
      const resolved = resolveMatchGrid(swapped);

      const timeoutId = window.setTimeout(() => {
        setState((current) => {
          if (current.animationToken !== token) return current;
          return {
            ...current,
            grid: resolved.grid,
            score: current.score + resolved.points,
            moves: current.moves + 1,
            feedback: resolved.cascades > 1 ? `Combo x${resolved.cascades}!` : 'Sweet match!',
            eliminating: [],
            isResolving: false,
            fallMap: resolved.fallMap,
            fallTick: current.fallTick + 1,
            successTick: current.successTick + 1,
          };
        });
      }, 180);

      timeoutsRef.current.push(timeoutId);

      return {
        ...prev,
        grid: swapped,
        feedback: 'Nice swipe...',
        eliminating,
        isResolving: true,
        animationToken: token,
      };
    });
  }, []);

  const handlePointerDown = (row: number, col: number, event: PointerEvent<HTMLButtonElement>) => {
    setDragStart({ coord: { row, col }, x: event.clientX, y: event.clientY });
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (!dragStart) return;
    const swipe = resolveSwipeDirection(event.clientX - dragStart.x, event.clientY - dragStart.y);
    setDragStart(null);
    if (!swipe) return;

    const target = {
      row: dragStart.coord.row + swipe.rowShift,
      col: dragStart.coord.col + swipe.colShift,
    };
    if (target.row < 0 || target.row >= MATCH_ROWS || target.col < 0 || target.col >= MATCH_COLS) {
      return;
    }
    attemptSwap(dragStart.coord, target);
  };

  const restart = () => {
    timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    timeoutsRef.current = [];
    setDragStart(null);
      setState({
        grid: createMatchGrid(),
        score: 0,
        moves: 0,
        feedback: 'Swipe a tile to an adjacent tile.',
      eliminating: [],
      isResolving: false,
      fallMap: createZeroMatchGrid(),
      fallTick: 0,
      successTick: 0,
      animationToken: 0,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <p className="text-[#3d3244]">Score: {state.score}</p>
        <p className="text-[#B5A4AC]">Moves: {state.moves}</p>
      </div>

      <div className="relative h-5">
        <AnimatePresence>
          {state.successTick > 0 && (
            <motion.p
              key={state.successTick}
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute inset-0 text-center text-sm text-[#F1C6D9]"
            >
              ✨ Sweet success!
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div
        className="mx-auto grid max-w-[20rem] gap-1 rounded-2xl bg-[#fff8fb] p-3 touch-none"
        style={{ gridTemplateColumns: `repeat(${MATCH_COLS}, minmax(0, 1fr))` }}
      >
        {state.grid.flatMap((rowValues, rowIndex) =>
          rowValues.map((value, colIndex) => {
            const cellKey = `${rowIndex},${colIndex}`;
            const isEliminating = state.eliminating.includes(cellKey);
            const fallDistance = state.fallMap[rowIndex][colIndex];
            return (
              <button
                key={cellKey}
                onPointerDown={(event) => handlePointerDown(rowIndex, colIndex, event)}
                onPointerUp={handlePointerUp}
                onPointerCancel={() => setDragStart(null)}
                disabled={state.isResolving}
                className="aspect-square rounded-lg border border-white/50 text-lg overflow-hidden"
              >
                <motion.div
                  key={`${cellKey}-${state.fallTick}`}
                  initial={
                    fallDistance > 0
                      ? { y: -Math.min(56, fallDistance * 18), opacity: 0.4 }
                      : { y: 0, opacity: 1 }
                  }
                  animate={
                    isEliminating
                      ? { scale: 0.25, opacity: 0, rotate: 12 }
                      : { y: 0, opacity: 1, scale: 1, rotate: 0 }
                  }
                  transition={{ duration: isEliminating ? 0.18 : 0.24, ease: 'easeOut' }}
                  className="w-full h-full flex items-center justify-center will-change-transform"
                  style={{ backgroundColor: CANDIES[value].color }}
                >
                  {CANDIES[value].emoji}
                </motion.div>
              </button>
            );
          })
        )}
      </div>

      <button
        onClick={restart}
        className="w-full rounded-xl bg-[#F1C6D9] px-4 py-2 text-white hover:bg-[#e5b0c7] transition-colors flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Restart
      </button>

      <p className="text-center text-sm text-[#B5A4AC] min-h-5">{state.feedback}</p>
    </div>
  );
}

const TILE_SIZE = 4;
type MoveDirection = 'left' | 'right' | 'up' | 'down';
type TileBoard = number[][];

interface TileMergeState {
  board: TileBoard;
  score: number;
  best: number;
  gameOver: boolean;
  message: string;
  isSliding: boolean;
  slideDirection: MoveDirection | null;
  successTick: number;
  pending: {
    board: TileBoard;
    score: number;
    best: number;
    gameOver: boolean;
  } | null;
}

const createTileBoard = (): TileBoard =>
  Array.from({ length: TILE_SIZE }, () => Array.from({ length: TILE_SIZE }, () => 0));

const addRandomTile = (board: TileBoard): TileBoard => {
  const nextBoard = cloneGrid(board);
  const emptyCells: Coord[] = [];

  for (let row = 0; row < TILE_SIZE; row += 1) {
    for (let col = 0; col < TILE_SIZE; col += 1) {
      if (nextBoard[row][col] === 0) {
        emptyCells.push({ row, col });
      }
    }
  }

  if (!emptyCells.length) return nextBoard;

  const randomCell = randomFrom(emptyCells);
  nextBoard[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
  return nextBoard;
};

const createInitialTileState = (): TileMergeState => ({
  board: addRandomTile(addRandomTile(createTileBoard())),
  score: 0,
  best: 0,
  gameOver: false,
  message: 'Use arrow keys or buttons to slide and merge matching numbers.',
  isSliding: false,
  slideDirection: null,
  successTick: 0,
  pending: null,
});

const slideRowLeft = (row: number[]): { row: number[]; gained: number; moved: boolean } => {
  const compacted = row.filter((value) => value !== 0);
  const merged: number[] = [];
  let gained = 0;

  for (let index = 0; index < compacted.length; index += 1) {
    const current = compacted[index];
    const next = compacted[index + 1];
    if (next !== undefined && current === next) {
      const doubled = current * 2;
      merged.push(doubled);
      gained += doubled;
      index += 1;
    } else {
      merged.push(current);
    }
  }

  const nextRow = [...merged, ...Array(TILE_SIZE - merged.length).fill(0)];
  const moved = nextRow.some((value, index) => value !== row[index]);
  return { row: nextRow, gained, moved };
};

const transposeBoard = (board: TileBoard): TileBoard =>
  board[0].map((_, colIndex) => board.map((row) => row[colIndex]));

const reverseRows = (board: TileBoard): TileBoard => board.map((row) => [...row].reverse());

const moveTileBoard = (
  board: TileBoard,
  direction: MoveDirection
): { board: TileBoard; moved: boolean; gained: number } => {
  let prepared = cloneGrid(board);
  let restore = (next: TileBoard): TileBoard => next;

  if (direction === 'right') {
    prepared = reverseRows(prepared);
    restore = (next) => reverseRows(next);
  } else if (direction === 'up') {
    prepared = transposeBoard(prepared);
    restore = (next) => transposeBoard(next);
  } else if (direction === 'down') {
    prepared = reverseRows(transposeBoard(prepared));
    restore = (next) => transposeBoard(reverseRows(next));
  }

  let gained = 0;
  let moved = false;

  const shifted = prepared.map((row) => {
    const result = slideRowLeft(row);
    gained += result.gained;
    if (result.moved) moved = true;
    return result.row;
  });

  return { board: restore(shifted), moved, gained };
};

const hasAvailableMoves = (board: TileBoard): boolean => {
  for (let row = 0; row < TILE_SIZE; row += 1) {
    for (let col = 0; col < TILE_SIZE; col += 1) {
      const current = board[row][col];
      if (current === 0) return true;
      if (col < TILE_SIZE - 1 && current === board[row][col + 1]) return true;
      if (row < TILE_SIZE - 1 && current === board[row + 1][col]) return true;
    }
  }
  return false;
};

const TILE_STYLES: Record<number, { bg: string; text: string }> = {
  2: { bg: '#fef3f2', text: '#5f4a50' },
  4: { bg: '#fde9d4', text: '#5f4a50' },
  8: { bg: '#fcd5ce', text: '#5f4a50' },
  16: { bg: '#bbf7d0', text: '#3d3244' },
  32: { bg: '#bfdbfe', text: '#3d3244' },
  64: { bg: '#ddd6fe', text: '#3d3244' },
  128: { bg: '#f9a8d4', text: '#3d3244' },
  256: { bg: '#fda4af', text: '#3d3244' },
  512: { bg: '#fb7185', text: 'white' },
  1024: { bg: '#f43f5e', text: 'white' },
  2048: { bg: '#e11d48', text: 'white' },
};

const tileStyle = (value: number): { bg: string; text: string } =>
  TILE_STYLES[value] ?? { bg: '#be123c', text: 'white' };

const getSlideOffset = (direction: MoveDirection | null): { x: number; y: number } => {
  if (direction === 'left') return { x: 16, y: 0 };
  if (direction === 'right') return { x: -16, y: 0 };
  if (direction === 'up') return { x: 0, y: 16 };
  if (direction === 'down') return { x: 0, y: -16 };
  return { x: 0, y: 0 };
};

function TileMergeGame() {
  const [state, setState] = useState<TileMergeState>(() => createInitialTileState());

  const handleMove = useCallback((direction: MoveDirection) => {
    setState((prev) => {
      if (prev.gameOver || prev.isSliding) return prev;

      const result = moveTileBoard(prev.board, direction);
      if (!result.moved) {
        return {
          ...prev,
          message: 'No move there.',
        };
      }

      const nextBoard = addRandomTile(result.board);
      const nextScore = prev.score + result.gained;
      const gameOver = !hasAvailableMoves(nextBoard);

      return {
        ...prev,
        message: result.gained > 0 ? 'Nice merge!' : 'Smooth slide.',
        isSliding: true,
        slideDirection: direction,
        successTick: result.gained > 0 ? prev.successTick + 1 : prev.successTick,
        pending: {
          board: nextBoard,
          score: nextScore,
          best: Math.max(prev.best, nextScore),
          gameOver,
        },
      };
    });
  }, []);

  useEffect(() => {
    if (!state.isSliding || !state.pending) return undefined;

    const timer = window.setTimeout(() => {
      setState((prev) => {
        if (!prev.pending) return prev;
        return {
          ...prev,
          board: prev.pending.board,
          score: prev.pending.score,
          best: prev.pending.best,
          gameOver: prev.pending.gameOver,
          isSliding: false,
          slideDirection: null,
          pending: null,
          message: prev.pending.gameOver ? 'Board locked. Restart for a fresh round.' : prev.message,
        };
      });
    }, 140);

    return () => window.clearTimeout(timer);
  }, [state.isSliding, state.pending]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handleMove('left');
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleMove('right');
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        handleMove('up');
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        handleMove('down');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleMove]);

  const restart = () => {
    setState(createInitialTileState());
  };

  const slideOffset = getSlideOffset(state.slideDirection);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <p className="text-[#3d3244]">Score: {state.score}</p>
        <p className="text-[#B5A4AC]">Best: {state.best}</p>
      </div>

      <div className="relative h-5">
        <AnimatePresence>
          {state.successTick > 0 && (
            <motion.p
              key={state.successTick}
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute inset-0 text-center text-sm text-[#F1C6D9]"
            >
              ✨ Merge success!
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div
        className="mx-auto grid max-w-[18rem] gap-2 rounded-2xl bg-[#fff8fb] p-3"
        style={{ gridTemplateColumns: `repeat(${TILE_SIZE}, minmax(0, 1fr))` }}
      >
        {state.board.flatMap((row, rowIndex) =>
          row.map((value, colIndex) => {
            const colors = tileStyle(value);
            return (
              <motion.div
                key={`${rowIndex}-${colIndex}`}
                animate={
                  state.isSliding && value
                    ? { x: slideOffset.x, y: slideOffset.y, scale: 0.96 }
                    : { x: 0, y: 0, scale: 1 }
                }
                transition={{ duration: 0.12, ease: 'easeOut' }}
                className="aspect-square rounded-lg border border-white/60 flex items-center justify-center text-sm sm:text-base font-medium"
                style={{ backgroundColor: value === 0 ? '#fce7f3' : colors.bg, color: colors.text }}
              >
                {value === 0 ? '' : value}
              </motion.div>
            );
          })
        )}
      </div>

      <div className="mx-auto grid w-40 grid-cols-3 gap-2">
        <div />
        <button
          onClick={() => handleMove('up')}
          className="rounded-xl bg-[#e8f7f5] px-3 py-2 text-[#3d3244] hover:bg-[#AED7D3] transition-colors flex items-center justify-center"
          aria-label="Move tiles up"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
        <div />
        <button
          onClick={() => handleMove('left')}
          className="rounded-xl bg-[#e8f7f5] px-3 py-2 text-[#3d3244] hover:bg-[#AED7D3] transition-colors flex items-center justify-center"
          aria-label="Move tiles left"
        >
          <MoveLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleMove('down')}
          className="rounded-xl bg-[#e8f7f5] px-3 py-2 text-[#3d3244] hover:bg-[#AED7D3] transition-colors flex items-center justify-center"
          aria-label="Move tiles down"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleMove('right')}
          className="rounded-xl bg-[#e8f7f5] px-3 py-2 text-[#3d3244] hover:bg-[#AED7D3] transition-colors flex items-center justify-center"
          aria-label="Move tiles right"
        >
          <MoveRight className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={restart}
        className="w-full rounded-xl bg-[#F1C6D9] px-4 py-2 text-white hover:bg-[#e5b0c7] transition-colors flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Restart
      </button>

      <p className="text-center text-sm text-[#B5A4AC] min-h-5">{state.message}</p>
    </div>
  );
}
