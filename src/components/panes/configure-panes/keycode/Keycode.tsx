import React from 'react';
import type {IKeycode} from 'src/utils/key';

interface Props {
  keycode: IKeycode;
}

export default function Keycode(props: Props) {
  const {keycode} = props;

  return (
    <div className="flex items-center justify-center text-center p-2 border rounded border-dark whitespace-pre-wrap">
      {keycode.name}
    </div>
  );
}
