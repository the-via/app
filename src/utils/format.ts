export const formatNumberAsHex = (id: number, byteSize: number) =>
  `0x${id
    .toString(16)
    .padStart(byteSize * 2, '0')
    .toUpperCase()}`;
