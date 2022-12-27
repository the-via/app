import React from 'react';
import styled from 'styled-components';

const defaultChippy = {
  width: 300,
  height: 300,
  src: '/images/chippy.png',
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

  animation-duration: ${(props) => (props.progress === null ? 1.5 : 0)}s;
  animation-name: bob;
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
        <img
          src={defaultChippy.src}
          style={{
            top: `50%`,
            left: '50%',
            marginTop: `${-width / 2}px`,
            marginLeft: `${-width / 2}px`,
            position: 'absolute',
            zIndex: 1,
            width: width,
          }}
        />
      </CircleContainer>
    </LoaderContainer>
  );
}
