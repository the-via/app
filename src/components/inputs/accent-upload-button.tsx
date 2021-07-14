import * as React from 'react';
import {AccentButton} from './accent-button';
type Props = {onLoad: (file: File) => void; children: string};

export function AccentUploadButton(props: Props) {
  const input: React.MutableRefObject<HTMLInputElement> = React.useRef();
  function onChange(e: any) {
    props.onLoad(e.target.files[0] as File);
    input.current.value = null;
  }
  return (
    <AccentButton onClick={() => input.current && input.current.click()}>
      {props.children}
      <input
        ref={input}
        type="file"
        accept="application/json"
        style={{display: 'none'}}
        onChange={onChange}
      />
    </AccentButton>
  );
}
