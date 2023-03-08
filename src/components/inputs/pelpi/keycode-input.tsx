import React from 'react';
import {getKeycodeDict} from 'src/store/definitionsSlice';
import {useAppSelector} from 'src/store/hooks';
import {anyKeycodeToString} from '../../../utils/advanced-keys';
import {AccentButton} from '../accent-button';
import {KeycodeModal} from '../custom-keycode-modal';
import type {PelpiInput} from './input';

export const PelpiKeycodeInput: React.FC<PelpiInput<{}>> = (props) => {
  const [showModal, setShowModal] = React.useState(false);
  const keycodeDict = useAppSelector(getKeycodeDict);

  return (
    <>
      <AccentButton onClick={() => setShowModal(true)}>
        {anyKeycodeToString(props.value, keycodeDict)}
      </AccentButton>
      {showModal && (
        <KeycodeModal
          defaultValue={props.value}
          onChange={props.setValue}
          onConfirm={(keycode) => {
            props.setValue(keycode);
            setShowModal(false);
          }}
          onExit={() => setShowModal(false)}
        />
      )}
    </>
  );
};
