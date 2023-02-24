import {Segment, Segments} from '@react-three/drei';
import {VIAKey} from '@the-via/reader';
import {KeycapMetric} from 'src/utils/keyboard-rendering';
import {generateRowColArray} from '../n-links/matrix-lines';

export const MatrixLines: React.VFC<{
  keys: VIAKey[];
  rows: number;
  cols: number;
  width: number;
  height: number;
}> = ({keys, rows, cols, width, height}) => {
  const [rowColor, colColor] = ['lightpink', 'lightgrey'];
  const {rowKeys, colKeys} = generateRowColArray(keys, rows, cols);
  return (
    <group
      scale={0.35}
      rotation={[Math.PI, 0, 0]}
      position={[
        (-width * KeycapMetric.keyXPos) / 2,
        ((height + 0.4) * KeycapMetric.keyYPos) / 2,
        11,
      ]}
      key={`${rows}-${cols}-${width}-${height}`}
    >
      <Segments lineWidth={1}>
        {rowKeys.flatMap((seg) => {
          const cleanedSegments = seg.filter((x) => x);
          if (cleanedSegments.length >= 2) {
            return cleanedSegments.reduce(
              (prev, next, idx) => {
                if (prev.prev === null) {
                  return {res: [], prev: next};
                }
                return {
                  res: [
                    ...prev.res,
                    <Segment
                      key={`row-${idx}`}
                      start={[prev.prev[0], prev.prev[1], 0]}
                      end={[next[0], next[1], 0]}
                      color={rowColor}
                    />,
                  ],
                  prev: next,
                };
              },
              {res: [], prev: null},
            ).res;
          }
          return [];
        })}
        {colKeys.flatMap((seg) => {
          const cleanedSegments = seg.filter((x) => x);
          if (cleanedSegments.length >= 2) {
            return cleanedSegments.reduce(
              (prev, next, idx) => {
                if (prev.prev === null) {
                  return {res: [], prev: next};
                }
                return {
                  res: [
                    ...prev.res,
                    <Segment
                      key={`col-${idx}`}
                      start={[prev.prev[0], prev.prev[1], 0]}
                      end={[next[0], next[1], 0]}
                      color={colColor}
                    />,
                  ],
                  prev: next,
                };
              },
              {res: [], prev: null},
            ).res;
          }
          return [];
        })}
      </Segments>
    </group>
  );
};
