import { useEffect } from 'react';
import { getBasicKeyToByte, getSelectedKeyDefinitions } from 'src/store/definitionsSlice';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getSelectedKey, updateKey as updateKeyAction, updateSelectedKey } from 'src/store/keymapSlice';
import { getDisableFastRemap, getDisableRecordKeyboard } from 'src/store/settingsSlice';
import { getByteForCode } from 'src/utils/key';
import { mapEvtToKeycode } from 'src/utils/key-event';
import { getNextKey } from 'src/utils/keyboard-rendering';

export const useKeyboardRecord = () => {
  const dispatch = useAppDispatch();
  const selectedKey = useAppSelector(getSelectedKey);
  const {basicKeyToByte} = useAppSelector(getBasicKeyToByte);
  const disableFastRemap = useAppSelector(getDisableFastRemap);
  const selectedKeyDefinitions = useAppSelector(getSelectedKeyDefinitions);
  const disableRecordKeyboard = useAppSelector(getDisableRecordKeyboard);

  const updateKey = (value: number) => {
    if (selectedKey !== null) {

      dispatch(updateKeyAction(selectedKey, value));
      dispatch(
        updateSelectedKey(
          disableFastRemap || !selectedKeyDefinitions
            ? null
            : getNextKey(selectedKey, selectedKeyDefinitions),
        ),
      );
    }
  };

  useEffect(() => {
    if (disableRecordKeyboard) {
      return;
    }
    const updateWithKb = (e: KeyboardEvent) => {
      const code = mapEvtToKeycode(e);

      if (selectedKey === null || !code) {
        return;
      }

      const index = getByteForCode(code, basicKeyToByte);

      if (index !== 0) {
        updateKey(index);
      }
    };

    document.addEventListener('keydown', updateWithKb);
    return () => {
      document.removeEventListener('keydown', updateWithKb);
    };
  }, [selectedKey]);

};
