/**
 * The exact frame data from the flicker-dot snippet (flicker.laurie.fyi).
 * Each frame is a 49-cell (7x7) boolean grid; the spinner cycles through
 * them to animate.
 */
export const FLICKER_GRIDS: boolean[][] = [
  [
    true, false, true, false, true, false, false, false,
    false, false, false, false, false, false, false, false,
    false, false, false, false, false, false, false, false,
    false, false, false, false, false, false, false, false,
    false, false, false, false, false, false, false, false,
    false, false, false, false, false, false, false, false,
    false,
  ],
  [
    true, false, true, true, true, false, false, false,
    false, false, false, true, false, false, false, false,
    false, false, true, false, false, false, false, false,
    true, false, false, false, false, false, false, false,
    false, false, false, false, false, false, false, false,
    false, false, false, false, false, false, false, false,
    false,
  ],
  [
    true, false, true, true, true, false, false, false,
    false, false, false, true, false, false, false, false,
    false, false, true, false, false, false, false, false,
    true, false, false, false, false, false, false, false,
    false, false, false, false, false, false, false, false,
    false, false, false, false, false, false, false, false,
    false,
  ],
  [
    true, false, true, true, true, false, false, false,
    false, false, false, true, false, false, false, false,
    false, false, true, false, false, false, false, false,
    true, true, false, false, false, false, false, false,
    true, false, false, false, false, true, true, true,
    false, false, false, false, false, false, false, false,
    false,
  ],
  [
    true, false, true, true, true, false, false, false,
    false, true, false, true, false, false, false, false,
    false, false, true, false, false, false, false, false,
    true, true, false, false, false, false, false, false,
    true, false, false, false, false, true, true, true,
    false, false, false, false, false, false, false, false,
    false,
  ],
  [
    true, false, true, true, true, false, false, false,
    false, true, false, true, false, false, false, false,
    false, false, true, false, false, false, false, false,
    true, true, false, false, false, false, false, false,
    true, false, false, false, false, true, true, true,
    false, false, false, false, false, false, false, false,
    false,
  ],
];
