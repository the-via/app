import React from 'react';
import {AccentButton} from './accent-button';
type Props = {
  onLoad: (file: File) => void;
  inputRef?: React.MutableRefObject<HTMLInputElement | undefined>;
  children: string;
};

export function AccentUploadButton(props: Props) {
  const input = props.inputRef || React.useRef<HTMLInputElement>();
  function onChange(e: any) {
    props.onLoad(e.target.files[0] as File);
    (input.current as any).value = null;
  }
  return (
    <AccentButton onClick={() => input.current && input.current.click()}>
      {props.children}
      <input
        ref={input as any}
        type="file"
        accept="application/json"
        style={{display: 'none'}}
        onChange={onChange}
      />
    </AccentButton>
  );
}
