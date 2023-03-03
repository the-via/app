// We get 32-bits to play with
type Choice = number;
type NumChoices = number;
type LayoutOption = [Choice, NumChoices];
const maxBitSize = 5;

export const packBits = (nums: LayoutOption[]) =>
  nums.reduce(
    (p, [choice, numChoices]) => (p << minBitSize(numChoices)) | choice,
    0,
  ) >>> 0;

export const numIntoBytes = (num32: number) =>
  [num32 >> 24, num32 >> 16, num32 >> 8, num32].map((num) => num & 0xff);

export const bytesIntoNum = (bytesArr: number[]) =>
  ((bytesArr[0] << 24) |
    (bytesArr[1] << 16) |
    (bytesArr[2] << 8) |
    bytesArr[3]) >>>
  0;

export const unpackBits = (choiceBits: number, nums: NumChoices[]): number[] =>
  nums.reverse().reduce(
    ({res, bits}, numChoices) => ({
      bits: bits >> minBitSize(numChoices),
      res: [bits & ((1 << minBitSize(numChoices)) - 1), ...res],
    }),
    {bits: choiceBits, res: []} as {bits: number; res: number[]},
  ).res;

const minBitSize = (num: number) =>
  1 +
  Array(maxBitSize)
    .fill(0)
    .findIndex((_, idx) => 2 << idx >= num);
