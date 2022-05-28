import React from 'react';
import type {IKeycode} from 'src/utils/key';
import {OutlineButtonSecondary} from 'src/components/controls/OutlineButton';
import cntl from 'cntl';

interface Props {
  keycode: IKeycode;
}

const labelClassName = cntl`
  group-hover:-translate-y-full
  h-full
  transition-button
`;

export default function Keycode(props: Props) {
  const {keycode} = props;

  return (
    <OutlineButtonSecondary className="!p-0 group whitespace-pre-wrap text-sm 2xl:text-base">
      <div className={labelClassName}>
        <div className="flex items-center justify-center h-full px-4 py-2">
          {keycode.name}
        </div>
        <div className="text-sm flex items-center justify-center h-full px-2 py-2">
          <span className="break-all">{keycode.code}</span>
        </div>
      </div>
    </OutlineButtonSecondary>
  );
}
