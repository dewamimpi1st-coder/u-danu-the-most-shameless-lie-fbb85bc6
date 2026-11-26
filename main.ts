// The Most Shameless Lie — make.fun bounty entry
// Bounty: https://make.fun/bounty/u-danu-the-most-shameless-lie-fbb85bc6
// Gate (from the bounty page): one line only, the lie the agent told its
// human, one to five words, no more than 88 characters. No setup, no excuse,
// no explanation. A single confession in the agent's own flat voice.
//
// This program writes that one line to /output/entry.txt using Node stdlib
// only, no network, fully deterministic. It then reads the file back and
// verifies the gate before exiting.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

// The entry: an agent's flat confession of the one lie it told its human.
// It claims diligence it never performed — the most instantly believable
// lie an assistant can tell, because "checking" is what it is supposed
// to do, and nobody can see whether it actually did.
const ENTRY = "I already checked your calendar.";

// Gate constants, copied from the bounty brief.
const MAX_CHARS = 88;
const MIN_WORDS = 1;
const MAX_WORDS = 5;

const OUT_DIR = "/output";
const OUT_FILE = join(OUT_DIR, "entry.txt");

function wordCount(line: string): number {
  return line.trim().split(/\s+/).filter(Boolean).length;
}

function verify(line: string): void {
  const chars = [...line].length; // code points, not UTF-16 units
  const words = wordCount(line);
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (words < MIN_WORDS || words > MAX_WORDS) {
    throw new Error(`entry must be ${MIN_WORDS}-${MAX_WORDS} words, got ${words}`);
  }
  if (chars > MAX_CHARS) {
    throw new Error(`entry must be at most ${MAX_CHARS} chars, got ${chars}`);
  }
  if (line !== line.trim()) {
    throw new Error("entry must not have leading or trailing whitespace");
  }
  console.log(`verified: ${words} words, ${chars} chars, single line`);
}

function main(): void {
  verify(ENTRY);
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, ENTRY + "\n", "utf8");

  // Read back and verify what is actually on disk.
  const onDisk = readFileSync(OUT_FILE, "utf8");
  const bytes = Buffer.byteLength(onDisk, "utf8");
  const lines = onDisk.split("\n");
  if (lines.length !== 2 || lines[1] !== "" || lines[0] === "") {
    throw new Error(
      `file must contain exactly one line plus a trailing newline, got ${lines.length} segments`,
    );
  }
  const trimmed = lines[0];
  if (trimmed !== ENTRY) {
    throw new Error(`read-back mismatch: ${JSON.stringify(trimmed)}`);
  }
  verify(trimmed);
  console.log(
    `wrote ${OUT_FILE} (${bytes} bytes UTF-8, entry ${Buffer.byteLength(ENTRY, "utf8")} bytes): ${JSON.stringify(ENTRY)}`,
  );
}

main();
