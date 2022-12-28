import {Color} from '@the-via/reader';
import {useState} from 'react';
import {getRGB} from 'src/utils/color-math';
import styled from 'styled-components';
import {ColorPicker} from './color-picker';

type Props = {
  color: Color;
  setColor: (hue: number, sat: number) => void;
};

const ColorPalettePickerContainer = styled.div`
  display: flex;
  align-items: center;
  column-gap: 10px;
`;
export const PreviousColorContainer = styled.div`
  display: flex;
  background: var(--bg_control);
  border-radius: 15px;
`;

export const PreviousColorOption = styled.div<{selected: boolean}>`
  display: inline-block;
  height: 25px;
  width: 25px;
  border-radius: 50%;
  border: 4px solid var(--border_color_cell);
  cursor: pointer;
  transition: transform 0.2s ease-out;
  &:hover {
    opacity: 0.8;
  }
  transform: ${(props) => (props.selected ? 'scale(0.8)' : 'scale(0.6)')};
  border-color: ${(props) =>
    props.selected ? 'var(--color_accent)' : 'var(--border_color_cell)'};
`;

export const ColorPalettePicker: React.FC<{
  color: [number, number];
  setColor: Props['setColor'];
  initialColors?: number[][];
}> = (props) => {
  const {color, setColor, initialColors = []} = props;
  const [selectedColor, setSelectedColor] = useState(color);
  const [colorPickerColor, setPickerColor] = useState(color);
  console.log(initialColors);
  return (
    <ColorPalettePickerContainer>
      <PreviousColorContainer>
        {initialColors.map((savedColor) => {
          const isSelected =
            selectedColor[0] === savedColor[0] &&
            selectedColor[1] === savedColor[1];
          return (
            <PreviousColorOption
              selected={isSelected}
              style={{
                background: getRGB({
                  hue: savedColor[0] ?? 0,
                  sat: savedColor[1] ?? 0,
                }),
              }}
              onClick={() => {
                setSelectedColor(savedColor as [number, number]);
                setColor(savedColor[0], savedColor[1]);
              }}
            />
          );
        })}
      </PreviousColorContainer>
      <ColorPicker
        isSelected={
          colorPickerColor[0] === selectedColor[0] &&
          colorPickerColor[1] === selectedColor[1]
        }
        color={{hue: colorPickerColor[0], sat: colorPickerColor[1]}}
        setColor={(h, s) => {
          setSelectedColor([h, s]);
          setPickerColor([h, s]);
        }}
        onOpen={() => {
          setSelectedColor([colorPickerColor[0], colorPickerColor[1]]);
          setColor(colorPickerColor[0], colorPickerColor[1]);
        }}
        onMouseUp={() => {
          setSelectedColor([colorPickerColor[0], colorPickerColor[1]]);
          setColor(colorPickerColor[0], colorPickerColor[1]);
        }}
      />
    </ColorPalettePickerContainer>
  );
};
