import { LetterCoord } from "../types";

export const BOARD_COORDS: Record<string, LetterCoord> = {
  // Special Emblems
  "SI": { char: "SÍ", x: 22, y: 18 },
  "YES": { char: "SÍ", x: 22, y: 18 },
  "NO": { char: "NO", x: 78, y: 18 },
  "ADIOS": { char: "ADIÓS", x: 50, y: 86 },
  "GOODBYE": { char: "ADIÓS", x: 50, y: 86 },
  "HOME": { char: "•", x: 50, y: 56 },

  // Top Arc: A - M
  "A": { char: "A", x: 15, y: 46 },
  "B": { char: "B", x: 21, y: 41 },
  "C": { char: "C", x: 27, y: 37 },
  "D": { char: "D", x: 33, y: 34 },
  "E": { char: "E", x: 39, y: 32 },
  "F": { char: "F", x: 45, y: 31 },
  "G": { char: "G", x: 50, y: 31 },
  "H": { char: "H", x: 55, y: 31 },
  "I": { char: "I", x: 61, y: 32 },
  "J": { char: "J", x: 67, y: 34 },
  "K": { char: "K", x: 73, y: 37 },
  "L": { char: "L", x: 79, y: 41 },
  "M": { char: "M", x: 85, y: 46 },

  // Bottom Arc: N - Z
  "N": { char: "N", x: 16, y: 61 },
  "O": { char: "O", x: 22, y: 56 },
  "P": { char: "P", x: 28, y: 52 },
  "Q": { char: "Q", x: 34, y: 49 },
  "R": { char: "R", x: 40, y: 47 },
  "S": { char: "S", x: 46, y: 46 },
  "T": { char: "T", x: 52, y: 46 },
  "U": { char: "U", x: 58, y: 47 },
  "V": { char: "V", x: 64, y: 49 },
  "W": { char: "W", x: 70, y: 52 },
  "X": { char: "X", x: 76, y: 56 },
  "Y": { char: "Y", x: 81, y: 60 },
  "Z": { char: "Z", x: 86, y: 62 },

  // Numbers Row
  "1": { char: "1", x: 20, y: 73 },
  "2": { char: "2", x: 27, y: 73 },
  "3": { char: "3", x: 34, y: 73 },
  "4": { char: "4", x: 41, y: 73 },
  "5": { char: "5", x: 48, y: 73 },
  "6": { char: "6", x: 54, y: 73 },
  "7": { char: "7", x: 61, y: 73 },
  "8": { char: "8", x: 68, y: 73 },
  "9": { char: "9", x: 75, y: 73 },
  "0": { char: "0", x: 81, y: 73 },
};

export function getCoordForChar(c: string): LetterCoord {
  const upper = c.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (BOARD_COORDS[upper]) {
    return BOARD_COORDS[upper];
  }
  if (upper === " ") {
    return BOARD_COORDS["HOME"];
  }
  return BOARD_COORDS["HOME"];
}
