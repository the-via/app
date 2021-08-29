import React from 'react';
import {anyKeycodeToString} from '../../../utils/advanced-keys';
import {AccentButton} from '../accent-button';
import {KeycodeModal} from '../custom-keycode-modal';
import type {PelpiInput} from './input';

export const PelpiKeycodeInput: React.FC<PelpiInput<{}>> = (props) => {
  const [showModal, setShowModal] = React.useState(false);
  const [, setKeycode] = React.useState<number>();

  // FIXME: Is this even used?
  const onChange = React.useCallback(
    (arg: number) => {
      setKeycode(arg);
      props.setValue(arg);
    },
    [props.setValue],
  );

  React.useEffect(() => {
    setKeycode(props.value);
  }, [props.value]);

  return (
    <>
      <AccentButton onClick={() => setShowModal(true)}>
        {anyKeycodeToString(props.value)}
      </AccentButton>
      {showModal && (
        <KeycodeModal
          defaultValue={props.value}
          onChange={onChange}
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
