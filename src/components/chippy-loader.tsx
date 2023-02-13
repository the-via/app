import styled from 'styled-components';
import svgSrc from 'assets/images/squarey.svg';
import imgSrc from 'assets/images/chippy_600.png';
import {Theme} from 'src/utils/themes';

const defaultChippy = {
  width: 300,
  height: 300,
  src: imgSrc,
};

const LoaderContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CircleContainer = styled.div<{
  containerHeight: number;
  containerWidth: number;
  progress: number | null;
}>`
  border-radius: 50%;
  background-color: var(--bg_icon);
  height: ${(props) => props.containerHeight}px;
  width: ${(props) => props.containerWidth}px;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;

  animation-duration: 1.5s;
  animation-name: roll;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  animation-timing-function: ease-in-out;

  &::after {
    height: ${(props) => props.containerHeight}px;
    width: ${(props) => props.containerWidth}px;
    position: absolute;
    content: '';
    background-color: var(--color_accent);
    top: ${(props) => props.containerHeight + 1}px;
    left: 0;
    right: 0;
    transition: transform 0.4s ease-out;
    transform: translate3d(
      0,
      ${(props) => -(props.progress || 0) * props.containerHeight}px,
      0
    );
  }
`;

type Props = {
  progress: number | null;
  width?: number;
  height?: number;
  theme: Theme;
};
import * as React from 'react';

const SvgComponent: React.FC<any & {theme: Theme}> = (props) => {
  const {theme} = props;
  const colorMap = {
    'upper-body': theme.alpha.c,
    'lower-body': theme.mod.c,
    accent: theme.accent.c,
    bowtie: theme.accent.c,
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 587.68 461" {...props}>
      <defs>
        <style>
          {
            '.cls-1,.cls-5,.cls-6{fill-rule:evenodd}.cls-6,.cls-8{stroke:#000;stroke-miterlimit:10;stroke-width:4px}.cls-7{fill:#cb9688}.cls-5{fill:#fdfefe}.cls-6,.cls-8{fill:#dcdbdb}'
          }
        </style>
      </defs>
      <g id="Layer_2" data-name="Layer 2">
        <g id="Feet">
          <path
            className="cls-1"
            d="M166.29 360a50.5 50.5 0 1 1-50.5 50.5 50.5 50.5 0 0 1 50.5-50.5ZM417.29 360a50.5 50.5 0 1 1-50.5 50.5 50.5 50.5 0 0 1 50.5-50.5Z"
            style={{
              strokeWidth: 2,
              stroke: '#fff',
            }}
          />
        </g>
        <g id="Body">
          <path
            d="M23.79 2h540a15 15 0 0 1 15 15v379a15 15 0 0 1-15 15h-540a15 15 0 0 1-15-15V17a15 15 0 0 1 15-15Z"
            style={{
              strokeWidth: 2,
              stroke: '#fff',
              strokeMiterlimit: 10,
              fill: colorMap['upper-body'],
              fillRule: 'evenodd',
            }}
          />
          <path
            d="M9.29 286.77h570v111.46a15 15 0 0 1-15 15h-540a15 15 0 0 1-15-15Z"
            style={{
              fill: colorMap['lower-body'],
              strokeWidth: 2,
              stroke: '#fff',
              strokeMiterlimit: 10,
              fillRule: 'evenodd',
            }}
          />
        </g>
        <path
          d="M224.79 194s32.82 19 65 19c32.81 0 65-19 65-19"
          style={{
            strokeLinecap: 'round',
            strokeWidth: 5,
            stroke: '#000',
            strokeMiterlimit: 10,
            fillRule: 'evenodd',
            fill: 'none',
          }}
          id="Smile"
        />
        <g id="Eyes">
          <path
            className="cls-1"
            d="M408.79 66.25c26 0 47 25.91 47 57.87s-21 57.88-47 57.88-47-25.91-47-57.88 21.04-57.87 47-57.87ZM171.79 66.25c26 0 47 25.91 47 57.87s-21 57.88-47 57.88-47-25.91-47-57.88 21.04-57.87 47-57.87Z"
          />
          <path
            className="cls-5"
            d="M414.29 143a7.5 7.5 0 1 1-7.5 7.5 7.5 7.5 0 0 1 7.5-7.5ZM409.79 93a17 17 0 1 1-17 17 17 17 0 0 1 17-17ZM176.29 143a7.5 7.5 0 1 1-7.5 7.5 7.5 7.5 0 0 1 7.5-7.5ZM171.79 93a17 17 0 1 1-17 17 17 17 0 0 1 17-17Z"
          />
        </g>
        <g id="Pins">
          <path
            className="cls-6"
            d="M12.31 207h17.17c5.7 0 10.31 6.72 10.31 15v32c0 8.28-4.61 15-10.31 15H12.31C6.61 269 2 262.28 2 254v-32c0-8.28 4.61-15 10.31-15ZM12.31 123h17.17c5.7 0 10.31 6.72 10.31 15v32c0 8.28-4.61 15-10.31 15H12.31C6.61 185 2 178.28 2 170v-32c0-8.28 4.61-15 10.31-15ZM12.31 37h17.17c5.7 0 10.31 6.72 10.31 15v32c0 8.28-4.61 15-10.31 15H12.31C6.61 99 2 92.28 2 84V52c0-8.28 4.61-15 10.31-15ZM558.2 207h17.18c5.69 0 10.3 6.72 10.3 15v32c0 8.28-4.61 15-10.3 15H558.2c-5.69 0-10.31-6.72-10.31-15v-32c0-8.28 4.62-15 10.31-15ZM558.2 123h17.18c5.69 0 10.3 6.72 10.3 15v32c0 8.28-4.61 15-10.3 15H558.2c-5.69 0-10.31-6.72-10.31-15v-32c0-8.28 4.62-15 10.31-15ZM558.2 37h17.18c5.69 0 10.3 6.72 10.3 15v32c0 8.28-4.61 15-10.3 15H558.2c-5.69 0-10.31-6.72-10.31-15V52c0-8.28 4.62-15 10.31-15Z"
            style={{
              strokeWidth: 2,
              stroke: '#fff',
              fill: colorMap['accent'],
            }}
          />
        </g>
        <g id="Cheeks">
          <g id="Layer_8" data-name="Layer 8">
            <ellipse
              className="cls-7"
              cx={126.98}
              cy={207.18}
              rx={12.65}
              ry={28.67}
              transform="rotate(-60 126.975 207.173)"
              style={{fill: colorMap['lower-body']}}
            />
            <ellipse
              className="cls-7"
              cx={456.98}
              cy={207.18}
              rx={28.67}
              ry={12.65}
              transform="rotate(-30 456.989 207.17)"
              style={{fill: colorMap['lower-body']}}
            />
          </g>
        </g>
        <g id="Bowties">
          <path
            className="cls-8"
            d="m287.79 286 72-33v66ZM287.79 286l-72 33v-66Z"
            style={{
              strokeWidth: 2,
              stroke: '#fff',
              fill: colorMap['bowtie'],
            }}
          />
        </g>
      </g>
    </svg>
  );
};

export default function ChippyLoader(props: Props) {
  const width = props.width || defaultChippy.width;
  const height = props.width || defaultChippy.height;
  const containerPadding = width * 0.25;
  const [containerHeight, containerWidth] = [
    height + containerPadding * 2,
    width + containerPadding * 2,
  ];
  return (
    <LoaderContainer {...{containerHeight, containerWidth}}>
      <CircleContainer
        progress={props.progress}
        {...{containerHeight, containerWidth}}
      >
        <div
          style={{
            zIndex: 1,
            width: width,
          }}
        >
          <SvgComponent theme={props.theme} />
        </div>
      </CircleContainer>
    </LoaderContainer>
  );
}
