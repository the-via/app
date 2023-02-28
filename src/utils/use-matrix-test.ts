import {VIADefinitionV2, VIADefinitionV3} from '@the-via/reader';
import {useDispatch} from 'react-redux';
import {KeyboardAPI, KeyboardValue} from './keyboard-api';
import {useEffect, useRef, useState} from 'react';
import {setTestMatrixEnabled} from 'src/store/settingsSlice';
import {ConnectedDevice, TestKeyState} from 'src/types/types';

const invertTestKeyState = (s: TestKeyState) =>
  s === TestKeyState.KeyDown ? TestKeyState.KeyUp : TestKeyState.KeyDown;

export const useMatrixTest = (
  startTest: boolean,
  api?: KeyboardAPI,
  device?: ConnectedDevice,
  selectedDefinition?: VIADefinitionV2 | VIADefinitionV3,
) => {
  const selectedKeyArr = useState<any>([]);
  const [, setSelectedKeys] = selectedKeyArr;
  const dispatch = useDispatch();
  const shouldContinueRef = useRef(startTest);

  useEffect(() => {
    let flat: number[] = [];
    const stopTicking = () => {
      shouldContinueRef.current = false;
    };

    const startTicking = async (
      api: KeyboardAPI,
      protocol: number,
      selectedDefinition: VIADefinitionV2 | VIADefinitionV3,
      prevFlat: number[],
    ) => {
      if (startTest && api && selectedDefinition) {
        const {cols, rows} = selectedDefinition.matrix;
        const bytesPerRow = Math.ceil(cols / 8);
        const rowsPerQuery = Math.floor(28 / bytesPerRow);
        try {
          let newFlat: number[] = [];

          for (let offset = 0; offset < rows; offset += rowsPerQuery) {
            const querySize = Math.min(
              rows * bytesPerRow - newFlat.length, // bytes remaining
              bytesPerRow * rowsPerQuery, // max bytes per query
            );
            newFlat.push(
              ...((await api.getKeyboardValue(
                KeyboardValue.SWITCH_MATRIX_STATE,
                protocol >= 12 ? [offset] : [],
                querySize,
              )) as number[]),
            );
          }

          const keysChanges = newFlat.some(
            (val, byteIdx) => val ^ (prevFlat[byteIdx] || 0),
          );
          if (!keysChanges) {
            await api.timeout(20);
            if (shouldContinueRef.current) {
              startTicking(api, protocol, selectedDefinition, prevFlat);
            }
            return;
          }
          setSelectedKeys((selectedKeys: any) =>
            newFlat.reduce(
              (res, val, byteIdx) => {
                const xor = val ^ (prevFlat[byteIdx] || 0);
                if (xor === 0) {
                  return res;
                }
                const row = ~~(byteIdx / bytesPerRow);

                const colOffset =
                  8 * (bytesPerRow - 1 - (byteIdx % bytesPerRow));
                return Array(Math.max(0, Math.min(8, cols - colOffset)))
                  .fill(0)
                  .reduce((resres, _, idx) => {
                    const matrixIdx = cols * row + idx + colOffset;
                    resres[matrixIdx] =
                      ((xor >> idx) & 1) === 1
                        ? invertTestKeyState(resres[matrixIdx])
                        : resres[matrixIdx];
                    return resres;
                  }, res);
              },
              Array.isArray(selectedKeys) && selectedKeys.length === rows * cols
                ? [...selectedKeys]
                : Array(rows * cols).fill(TestKeyState.Initial),
            ),
          );
          await api.timeout(20);
          if (shouldContinueRef.current) {
            startTicking(api, protocol, selectedDefinition, newFlat);
          }
        } catch (e) {
          shouldContinueRef.current = false;
          dispatch(setTestMatrixEnabled(false));
        }
      }
    };

    if (startTest && api && device && selectedDefinition) {
      shouldContinueRef.current = true;
      startTicking(api, device.protocol, selectedDefinition, flat);
    }

    return () => {
      stopTicking();
    };
  }, [startTest, selectedDefinition, api]);
  return selectedKeyArr;
};
