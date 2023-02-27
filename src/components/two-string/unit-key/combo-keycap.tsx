import {DisplayMode} from 'src/types/keyboard-rendering';
import {getDarkenedColor} from 'src/utils/color-math';
import {CSSVarObject} from 'src/utils/keyboard-rendering';
import styled from 'styled-components';
import {Keycap2DTooltip} from '../../inputs/tooltip';
import {
  CanvasContainer,
  CanvasContainerBG,
  KeycapContainer,
  TestOverlay,
  TooltipContainer,
} from './keycap-base';

export const ComboKeycap = (props: any) => {
  const {
    normalizedRects,
    clipPath,
    overflowsTexture,
    macroData,
    label,
    canvasRef,
    onClick,
    onPointerDown,
    onPointerOver,
    onPointerOut,
    disabled,
    ...otherProps
  } = props;
  const [r1, r2] = normalizedRects;
  return (
    <>
      <KeycapContainer {...otherProps}>
        <ComboKeyBoundingContainer
          $selected={props.selected}
          onClick={onClick}
          onPointerDown={onPointerDown}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
          style={{
            cursor: !disabled ? 'pointer' : 'initial',
            position: 'relative',
            animation: props.disabled
              ? 'initial' // This prevents the hover animation from firing when the keycap can't be interacted with
              : props.selected
              ? '.75s infinite alternate select-glow'
              : '',
            transform: `translateX(${
              (-Math.abs(r1[0] - r2[0]) * CSSVarObject.keyXPos) / 2
            }px) perspective(100px) translateZ(${props.keycapZ}px)`,
            width:
              Math.max(r1[2], r2[2]) * CSSVarObject.keyXPos -
              CSSVarObject.keyXSpacing,
            height:
              Math.max(r1[3], r2[3]) * CSSVarObject.keyYPos -
              CSSVarObject.keyYSpacing,
            clipPath,
          }}
        >
          <ComboKeyRectContainer
            style={{
              position: 'absolute',
              borderRadius: 3,
              background: getDarkenedColor(props.color.c, 0.8),
              transform: `translate(${CSSVarObject.keyXPos * r1[0]}px,${
                CSSVarObject.keyYPos * r1[1]
              }px)`,
              width: r1[2] * CSSVarObject.keyXPos - CSSVarObject.keyXSpacing,
              height: r1[3] * CSSVarObject.keyYPos - CSSVarObject.keyYSpacing,
            }}
          />
          <ComboKeyRectContainer
            style={{
              position: 'absolute',
              borderRadius: 3,
              transform: `translate(${CSSVarObject.keyXPos * r2[0]}px,${
                CSSVarObject.keyYPos * r2[1]
              }px)`,
              background: getDarkenedColor(props.color.c, 0.8),
              width: r2[2] * CSSVarObject.keyXPos - CSSVarObject.keyXSpacing,
              height: r2[3] * CSSVarObject.keyYPos - CSSVarObject.keyYSpacing,
            }}
          />
          <ComboKeyBGContainer
            style={{
              position: 'absolute',
              borderRadius: 3,
              background: getDarkenedColor(props.color.c, 0.8),
              transform: `translate(${CSSVarObject.keyXPos * r1[0] + 1}px,${
                1 + CSSVarObject.keyYPos * r1[1]
              }px)`,
              width:
                r1[2] * CSSVarObject.keyXPos - CSSVarObject.keyXSpacing - 2,
              height:
                r1[3] * CSSVarObject.keyYPos - CSSVarObject.keyYSpacing - 2,
            }}
          />
          <CanvasContainer
            style={{
              borderRadius: 4,
              background: props.color.c,
              position: 'absolute',
              transform: `translate(${
                CSSVarObject.keyXPos * r1[0] + CSSVarObject.faceXPadding[0]
              }px,${
                CSSVarObject.faceYPadding[0] + CSSVarObject.keyYPos * r1[1]
              }px)`,
              width:
                r1[2] * CSSVarObject.keyXPos -
                CSSVarObject.keyXSpacing -
                CSSVarObject.faceXPadding[0] -
                CSSVarObject.faceXPadding[1],
              height:
                r1[3] * CSSVarObject.keyYPos -
                CSSVarObject.keyYSpacing -
                CSSVarObject.faceYPadding[0] -
                CSSVarObject.faceYPadding[1],
            }}
          />
          <CanvasContainer
            style={{
              borderRadius: 4,
              background: props.color.c,
              position: 'absolute',
              transform: `translate(${
                CSSVarObject.keyXPos * r2[0] + CSSVarObject.faceXPadding[0]
              }px,${
                CSSVarObject.faceYPadding[0] + CSSVarObject.keyYPos * r2[1]
              }px)`,
              width:
                r2[2] * CSSVarObject.keyXPos -
                CSSVarObject.keyXSpacing -
                CSSVarObject.faceXPadding[0] -
                CSSVarObject.faceXPadding[1],
              height:
                r2[3] * CSSVarObject.keyYPos -
                CSSVarObject.keyYSpacing -
                CSSVarObject.faceYPadding[0] -
                CSSVarObject.faceYPadding[1],
            }}
          />
          <CanvasContainerBG
            style={{
              borderRadius: 4,
              background: props.color.c,
              position: 'absolute',
              transform: `translate(${
                1 + CSSVarObject.keyXPos * r1[0] + CSSVarObject.faceXPadding[0]
              }px,${
                1 + CSSVarObject.faceYPadding[0] + CSSVarObject.keyYPos * r1[1]
              }px)`,
              width:
                r1[2] * CSSVarObject.keyXPos -
                CSSVarObject.keyXSpacing -
                CSSVarObject.faceXPadding[0] -
                CSSVarObject.faceXPadding[1] -
                2,
              height:
                r1[3] * CSSVarObject.keyYPos -
                CSSVarObject.keyYSpacing -
                CSSVarObject.faceYPadding[0] -
                CSSVarObject.faceYPadding[1] -
                2,
            }}
          >
            <canvas ref={canvasRef} style={{}} />
          </CanvasContainerBG>
          {DisplayMode.Test === props.mode ? (
            <TestOverlay
              style={{
                background: props.keycapColor,
                opacity: props.keycapOpacity,
              }}
            ></TestOverlay>
          ) : null}
        </ComboKeyBoundingContainer>
        {(props.macroData || props.overflowsTexture) && (
          <TooltipContainer $rotate={props.rotation[2]}>
            <Keycap2DTooltip>
              {props.macroData || (props.label && props.label.tooltipLabel)}
            </Keycap2DTooltip>
          </TooltipContainer>
        )}
      </KeycapContainer>
    </>
  );
};

const ComboKeyBoundingContainer = styled.div<{$selected: boolean}>`
  box-sizing: border-box;
  transition: transform 0.2s ease-out;
  animation: ${(p) =>
    p.$selected ? '.75s infinite alternate select-glow' : 'initial'};
  &:hover {
    transform: perspective(100px) translateZ(-5px);
    animation: 0.5s 1 forwards select-glow;
  }
`;

const ComboKeyRectContainer = styled.div<{}>`
  box-sizing: border-box;
  padding: 2px 6px 10px 6px;
  box-shadow: inset -1px -1px 0 rgb(0 0 0 / 20%),
    inset 1px 1px 0 rgb(255 255 255 / 20%);
`;
const ComboKeyBGContainer = styled.div<{}>`
  box-sizing: border-box;
  padding: 3px 7px 10px 6px;
`;
