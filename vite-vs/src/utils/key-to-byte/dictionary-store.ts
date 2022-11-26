import basicKeyToByte from './default';
import v11BasicKeyToByte from './v11';
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
