import React from 'react';
import type {IKeycode} from 'src/utils/key';
import Keycode from './Keycode';

interface Props {
  activeSearch?: string;
  children?: React.ReactNode;
  keycodes: IKeycode[];
}

function matchString(a: string, b: string): boolean {
  return a.toLowerCase().includes(b.toLowerCase());
}

export default function KeycodeCategory(props: Props) {
  const {activeSearch, children, keycodes} = props;

  const Keycodes = React.useMemo(() => {
    return keycodes.map((keycode) => {
      let matches = true;

      if (activeSearch) {
        matches = matchString(keycode.name, activeSearch);
      }

      if (!matches) {
        return null;
      }

      return <Keycode key={keycode.code} keycode={keycode} />;
    }).filter(Boolean);
  }, [activeSearch, keycodes]);

  if (Keycodes.length === 0) {
    return null;
  }

  return (
    <div>
      {children}
      <div className="grid grid-cols-4 gap-5 auto-rows-[4rem]">{Keycodes}</div>
    </div>
  );
}
