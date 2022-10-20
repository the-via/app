import basicKeyToByte from './default.json5';
import v11BasicKeyToByte from './v11.json5';
export function getBasicKeyDict(version: number) {
  switch (version) {
    case 12: {
      return v11BasicKeyToByte;
    }
    case 11: {
      return v11BasicKeyToByte;
    }
    default: {
      return basicKeyToByte;
    }
  }
}
