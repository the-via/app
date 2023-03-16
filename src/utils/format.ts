export const formatNumberAsHex = (id: number, digits: number) =>
  `0x${id.toString(16).padStart(digits, '0').toUpperCase()}`;
