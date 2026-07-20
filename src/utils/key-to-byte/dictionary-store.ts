import basicKeyToByte from './default';
import v10BasicKeyToByte from './v10';
import v11BasicKeyToByte from './v11';
import v12BasicKeyToByte from './v12';
export function getBasicKeyDict(protocol: number, keycodeVersion: number) {
  if (protocol <= 12) {
    switch (protocol) {
      case 12: {
        return v12BasicKeyToByte;
      }
      case 11: {
        return v11BasicKeyToByte;
      }
      case 10: {
        return v10BasicKeyToByte;
      }
      default: {
        return basicKeyToByte;
      }
    }
  }
  else
  {
    switch(keycodeVersion) {
      // dummy to check the keycode ver too
      case 2: 
      case 1: {
        return v12BasicKeyToByte;
      }
      default: {
        return v12BasicKeyToByte;
      }
    }
  }
}
