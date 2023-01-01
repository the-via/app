import {PresentationControls} from '@react-three/drei';
import {ThreeEvent} from '@react-three/fiber';
import {VIADefinitionV2, VIADefinitionV3, VIAKey} from '@the-via/reader';
import React, {useMemo} from 'react';
import {shallowEqual} from 'react-redux';
import {TestKeyState} from 'src/types/types';
import {
  calculateKeyboardFrameDimensions,
  CSSVarObject,
} from 'src/utils/keyboard-rendering';
import {Case} from './case';
import {KeyGroup} from './key-group';
import {DisplayMode} from './keycap';
import {MatrixLines} from './matrix-lines';
type KeyboardCanvasContent = {
  selectable: boolean;
  matrixKeycodes: number[];
  keys: (VIAKey & {ei?: number})[];
  definition: VIADefinitionV2 | VIADefinitionV3;
  pressedKeys?: TestKeyState[];
  mode: DisplayMode;
  showMatrix?: boolean;
  selectedKey?: number;
  keyColors?: number[][];
  shouldHide?: boolean;
  onKeycapPointerDown?: (e: ThreeEvent<MouseEvent>, idx: number) => void;
  onKeycapPointerOver?: (e: ThreeEvent<MouseEvent>, idx: number) => void;
};
export const KeyboardCanvas: React.FC<
  KeyboardCanvasContent & {
    containerDimensions: DOMRect;
  }
> = (props) => {
  const {containerDimensions, shouldHide, ...otherProps} = props;
  const {width, height} = useMemo(
    () => calculateKeyboardFrameDimensions(otherProps.keys),
    [otherProps.keys],
  );
  const ratio =
    Math.min(
      Math.min(
        1,
        containerDimensions &&
          containerDimensions.width /
            ((CSSVarObject.keyWidth + CSSVarObject.keyXSpacing) * width -
              CSSVarObject.keyXSpacing +
              70),
      ),
      500 /
        ((CSSVarObject.keyHeight + CSSVarObject.keyYSpacing) * height -
          CSSVarObject.keyYSpacing +
          70),
    ) || 1;

  return (
    <group
      position={[0, -0.0, -19]}
      scale={0.015 * ratio}
      visible={!shouldHide}
    >
      <KeyboardCanvasContent {...otherProps} width={width} height={height} />
    </group>
  );
};

export const KeyboardCanvasContent: React.VFC<{
  selectable: boolean;
  matrixKeycodes: number[];
  keys: (VIAKey & {ei?: number})[];
  definition: VIADefinitionV2 | VIADefinitionV3;
  pressedKeys?: TestKeyState[];
  mode: DisplayMode;
  showMatrix?: boolean;
  selectedKey?: number;
  width: number;
  height: number;
  keyColors?: number[][];
  onKeycapPointerDown?: (e: ThreeEvent<MouseEvent>, idx: number) => void;
  onKeycapPointerOver?: (e: ThreeEvent<MouseEvent>, idx: number) => void;
}> = React.memo((props) => {
  const {
    matrixKeycodes,
    keys,
    definition,
    pressedKeys,
    mode,
    showMatrix,
    selectable,
    width,
    height,
  } = props;

  return (
    <PresentationControls
      enabled={props.mode !== DisplayMode.ConfigureColors} // the controls can be disabled by setting this to false
      global={true} // Spin globally or by dragging the model
      snap={true} // Snap-back to center (can also be a spring config)
      speed={1} // Speed factor
      zoom={1} // Zoom factor when half the polar-max is reached
      rotation={[0, 0, 0]} // Default rotation
      polar={[-Math.PI / 10, Math.PI / 10]} // Vertical limits
      azimuth={[-Math.PI / 16, Math.PI / 16]} // Horizontal limits
      config={{mass: 1, tension: 170, friction: 26}} // Spring config
    >
      <Case width={width} height={height} />
      <KeyGroup
        {...props}
        keys={keys}
        mode={mode}
        matrixKeycodes={matrixKeycodes}
        selectable={selectable}
        definition={definition}
        pressedKeys={pressedKeys}
      />
      {showMatrix && (
        <MatrixLines
          keys={keys}
          rows={definition.matrix.rows}
          cols={definition.matrix.cols}
          width={width}
          height={height}
        />
      )}
    </PresentationControls>
  );
}, shallowEqual);
