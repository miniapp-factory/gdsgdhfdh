"use client";

import { useState, useEffect } from "react";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";

const SIZE = 4;
const EMPTY = 0;

function randomTile() {
  return Math.random() < 0.9 ? 2 : 4;
}

function emptyCells(board: number[][]) {
  const cells: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === EMPTY) cells.push([r, c]);
    }
  }
  return cells;
}

function addRandom(board: number[][]) {
  const cells = emptyCells(board);
  if (cells.length === 0) return board;
  const [r, c] = cells[Math.floor(Math.random() * cells.length)];
  const newBoard = board.map(row => [...row]);
  newBoard[r][c] = randomTile();
  return newBoard;
}

function transpose(board: number[][]) {
  return board[0].map((_, i) => board.map(row => row[i]));
}

function reverse(board: number[][]) {
  return board.map(row => [...row].reverse());
}

function compress(board: number[][]) {
  return board.map(row => {
    const newRow = row.filter(v => v !== EMPTY);
    while (newRow.length < SIZE) newRow.push(EMPTY);
    return newRow;
  });
}

function merge(board: number[][]) {
  let score = 0;
  const newBoard = board.map(row => {
    for (let i = 0; i < SIZE - 1; i++) {
      if (row[i] !== EMPTY && row[i] === row[i + 1]) {
        row[i] *= 2;
        row[i + 1] = EMPTY;
        score += row[i];
      }
    }
    return row;
  });
  return { board: newBoard, score };
}

function move(board: number[][], dir: "up" | "down" | "left" | "right") {
  let newBoard = board;
  if (dir === "up") newBoard = transpose(newBoard);
  if (dir === "down") newBoard = reverse(transpose(newBoard));
  if (dir === "right") newBoard = reverse(newBoard);

  newBoard = compress(newBoard);
  const { board: merged, score } = merge(newBoard);
  newBoard = compress(merged);

  if (dir === "up") newBoard = transpose(newBoard);
  if (dir === "down") newBoard = transpose(reverse(newBoard));
  if (dir === "right") newBoard = reverse(newBoard);

  return { board: newBoard, score };
}

export function Game2048() {
  const [board, setBoard] = useState<number[][]>(Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY)));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    let b = addRandom(addRandom(board));
    setBoard(b);
  }, []);

  const handleMove = (dir: "up" | "down" | "left" | "right") => {
    if (gameOver) return;
    const { board: newBoard, score: delta } = move(board, dir);
    if (JSON.stringify(newBoard) === JSON.stringify(board)) return;
    setBoard(newBoard);
    setScore(score + delta);
    const after = addRandom(newBoard);
    setBoard(after);
    if (isGameOver(after)) setGameOver(true);
  };

  const isGameOver = (b: number[][]) => {
    if (emptyCells(b).length > 0) return false;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (c < SIZE - 1 && b[r][c] === b[r][c + 1]) return false;
        if (r < SIZE - 1 && b[r][c] === b[r + 1][c]) return false;
      }
    }
    return true;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-4 gap-2">
        {board.flat().map((v, i) => (
          <div
            key={i}
            className="flex h-16 w-16 items-center justify-center rounded-md border bg-muted text-2xl font-bold"
          >
            {v !== EMPTY ? v : null}
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-2">
          <button onClick={() => handleMove("up")} className="p-2 rounded-md bg-primary text-primary-foreground">
            ↑
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleMove("left")} className="p-2 rounded-md bg-primary text-primary-foreground">
            ←
          </button>
          <button onClick={() => handleMove("down")} className="p-2 rounded-md bg-primary text-primary-foreground">
            ↓
          </button>
          <button onClick={() => handleMove("right")} className="p-2 rounded-md bg-primary text-primary-foreground">
            →
          </button>
        </div>
      </div>
      <div className="text-xl">Score: {score}</div>
      {gameOver && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-lg font-semibold">Game Over!</span>
          <Share text={`I scored ${score} in 2048! ${url}`} />
        </div>
      )}
    </div>
  );
}
