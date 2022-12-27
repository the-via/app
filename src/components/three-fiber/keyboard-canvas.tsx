import {PresentationControls} from '@react-three/drei';
import {VIADefinitionV2, VIADefinitionV3, VIAKey} from '@the-via/reader';
import {TestKeyState} from 'src/types/types';
import {
  calculateKeyboardFrameDimensions,
  CSSVarObject,
} from 'src/utils/keyboard-rendering';
import {Case} from './case';
import {KeyGroup} from './key-group';
import {DisplayMode} from './keycap';
import {MatrixLines} from './matrix-lines';

export const KeyboardCanvas: React.VFC<{
  selectable: boolean;
  containerDimensions: DOMRect;
  matrixKeycodes: number[];
  keys: (VIAKey & {ei?: number})[];
  definition: VIADefinitionV2 | VIADefinitionV3;
  pressedKeys?: TestKeyState[];
  mode: DisplayMode;
  showMatrix?: boolean;
  selectedKey?: number;
}> = (props) => {
  const {
    selectable,
    containerDimensions,
    matrixKeycodes,
    keys,
    definition,
    pressedKeys,
    mode,
    showMatrix,
  } = props;

  const containerWidthOffset = DisplayMode.Configure === mode ? -182.5 : 0;

  const {width, height} = calculateKeyboardFrameDimensions(keys);
  const ratio =
    Math.min(
      Math.min(
        1,
        containerDimensions &&
          (containerDimensions.width + containerWidthOffset) /
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
    <>
      <group position={[0, -0.0, -19]} scale={0.015 * ratio}>
        <PresentationControls
          enabled={true} // the controls can be disabled by setting this to false
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
            containerDimensions={containerDimensions}
            keys={keys}
            mode={mode}
            matrixKeycodes={matrixKeycodes}
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
      </group>
    </>
  );
};
