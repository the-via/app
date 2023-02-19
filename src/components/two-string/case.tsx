import {KeyColorType} from '@the-via/reader';
import React from 'react';
import {useMemo} from 'react';
import {shallowEqual} from 'react-redux';
import {useAppSelector} from 'src/store/hooks';
import {getSelectedTheme} from 'src/store/settingsSlice';
import {getDarkenedColor} from 'src/utils/color-math';
import {CSSVarObject} from 'src/utils/keyboard-rendering';
import styled from 'styled-components';

const CaseGroup = styled.div<{}>``;
const OuterCase = styled.div<{
  background: string;
  height: number;
  width: number;
}>`
  background: ${(props) => props.background};
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
`;
const InnerCase = styled.div<{
  background: string;
  height: number;
  width: number;
}>`
  background: ${(props) => props.background};
  top: 0;
  left: 0;
  position: absolute;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
`;

export const CaseInsideBorder = 10;

export const Case = React.memo((props: {width: number; height: number}) => {
  const theme = useAppSelector(getSelectedTheme);
  const outsideColor = useMemo(() => theme[KeyColorType.Accent].c, [theme]);
  const properWidth =
    props.width * CSSVarObject.keyXPos - CSSVarObject.keyXSpacing;
  const properHeight =
    CSSVarObject.keyYPos * props.height - CSSVarObject.keyYSpacing;
  const insideBorder = 10;
  const insideWidth = properWidth + insideBorder * 1;
  const outsideWidth = properWidth + insideBorder * 3;
  const [insideHeight, outsideHeight] = [
    properHeight + insideBorder,
    properHeight + insideBorder * 3,
  ];
  const [stp1, stp2, stp3] = [0.15, 0.25, 0.2].map((num) =>
    getDarkenedColor(outsideColor, num),
  );
  return (
    <CaseGroup>
      <OuterCase
        background={outsideColor}
        width={outsideWidth}
        height={outsideHeight}
        style={{
          borderRadius: 8,
          boxShadow: 'var(--box-shadow-keyboard)',
        }}
      ></OuterCase>
      <InnerCase
        background={`linear-gradient(200deg,${stp1} 40%,${stp2},${stp3} 80%)`}
        width={insideWidth}
        height={insideHeight}
        style={{
          transform: `translate( ${insideWidth - properWidth}px,
           ${insideHeight - properHeight}px)`,
          boxShadow: 'var(--box-shadow-keyboard)',
          borderRadius: 8,
        }}
      ></InnerCase>
    </CaseGroup>
  );
}, shallowEqual);
