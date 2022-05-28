/**
 * Native color picker using <input type="color" />
 */

import React from 'react';
import Color from 'color';
import cntl from 'cntl';
import { getRGBPrime } from 'src/utils/color-math';

type HTMLColorProps = Omit<React.HTMLProps<HTMLInputElement>, 'onChange'>;

interface ColorInputProps extends HTMLColorProps {
  onChange: (hue: number, saturation: number) => void;
  hue: number;
  sat: number;
}

const labelClassName = cntl`
  bg-transparent
  border-2
  border-outline
  cursor-pointer
  h-8
  hover:border-action
  p-0
  rounded-md
  transition-button
  w-8
`;

function convertToRgb(hue: number, sat: number): number[] {
  hue = Math.round(360 * hue) / 255;
  sat = sat / 255;

  const c = sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = 1 - c;

  const [r, g, b] = getRGBPrime(hue, c, x).map((n) =>
    Math.round(255 * (m + n)),
  );

  return [r, g, b];
}

export default function ColorInput(props: ColorInputProps) {
  const {className, hue, onChange, sat} = props;
  const [r, g, b] = convertToRgb(hue, sat);
  const hex = Color({r, g, b}).hex();

  return (
    <label
      className={`${labelClassName} ${className}`}
      style={{
        backgroundColor: hex,
      }}
    >
      <input
        className="invisible"
        onChange={(e) => {
          let [h, s] = Color(e.target.value).hsl().array();
          // h = Math.round(255 * (hue / 360));
          h = Math.round(255 * (hue / 360));
          s = Math.round(255 * (sat / 100));

          onChange?.(h, s);
        }}
        type="color"
        defaultValue={hex}
      />
    </label>
  );
}
