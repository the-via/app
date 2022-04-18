import React from 'react';
import type {IKeycode} from 'src/utils/key';
import cntl from 'cntl';

const keycodeClassName = cntl`
  border
  border-secondary
  hover:border-primary
  flex
  items-center
  justify-center
  p-2
  rounded
  text-center
  text-primary
  whitespace-pre-wrap
`;

interface Props {
  keycode: IKeycode;
}

export default function Keycode(props: Props) {
  const {keycode} = props;

  return (
    <button className={keycodeClassName}>
      {keycode.name}
    </button>
  );
}
