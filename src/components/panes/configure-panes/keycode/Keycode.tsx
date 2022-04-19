import React from 'react';
import type {IKeycode} from 'src/utils/key';
import {OutlineButtonSecondary} from 'src/components/controls/OutlineButton';

interface Props {
  keycode: IKeycode;
}

export default function Keycode(props: Props) {
  const {keycode} = props;

  return <OutlineButtonSecondary>{keycode.name}</OutlineButtonSecondary>;
}
