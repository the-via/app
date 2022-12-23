import {KeyColorType, VIAKey} from '@the-via/reader';
import React from 'react';
import {useMemo} from 'react';
import {shallowEqual} from 'react-redux';
import {
  getBasicKeyToByte,
  getSelectedDefinition,
  getSelectedKeyDefinitions,
} from 'src/store/definitionsSlice';
import {useAppSelector} from 'src/store/hooks';
import * as THREE from 'three';
import {
  calculateKeyboardFrameDimensions,
  calculatePointPosition,
  getColors,
  getTextureColors,
} from '../positioned-keyboard';
import {CSSVarObject, KeycapMetric} from './keyboard';

function makePlateShape(
  {width, height}: {width: number; height: number},
  keys: {position: number[]; rotation: number[]; scale: number[]}[],
) {
  const shape = new THREE.Shape();

  let sizeX = width;
  let sizeY = height;
  let radius = 0.1;

  let halfX = sizeX * 0.5 - radius;
  let halfY = sizeY * 0.5 - radius;
  let baseAngle = Math.PI * 0.5;
  shape.absarc(
    halfX,
    halfY,
    radius,
    baseAngle * 0,
    baseAngle * 0 + baseAngle,
    false,
  );
  shape.absarc(
    -halfX,
    halfY,
    radius,
    baseAngle * 1,
    baseAngle * 1 + baseAngle,
    false,
  );
  shape.absarc(
    -halfX,
    -halfY,
    radius,
    baseAngle * 2,
    baseAngle * 2 + baseAngle,
    false,
  );
  shape.absarc(
    halfX,
    -halfY,
    radius,
    baseAngle * 3,
    baseAngle * 3 + baseAngle,
    false,
  );
  const {x: minX, y: maxY} = keys.reduce(
    ({x, y}, {position}) => {
      return {x: Math.min(position[0], x), y: Math.max(position[1], y)};
    },
    {x: Infinity, y: -Infinity},
  );
  const {x: maxX, y: minY} = keys.reduce(
    ({x, y}, {position}) => {
      return {x: Math.max(position[0], x), y: Math.min(position[1], y)};
    },
    {x: 6, y: -6},
  );
  const positionWidth = maxX - minX;
  const positionHeight = maxY - minY;

  const holes = keys.map(({position, scale, rotation}) => {
    const path = new THREE.Path();
    const angle = rotation[2];
    const [keyWidth, keyHeight] = [0.9 * scale[0], 0.9 * scale[1]];
    const [x, y] = [
      (position[0] * halfX * 2 * 0.95) / positionWidth - 0.1,
      (position[1] * halfY * 2 * 0.85) / positionHeight + 0.2,
    ];

    const ctrx =
      x + (keyWidth / 2) * Math.cos(angle) - (keyHeight / 2) * Math.sin(angle);
    const ctry =
      y + (keyWidth / 2) * Math.sin(angle) + (keyHeight / 2) * Math.cos(angle);
    const ctlx =
      x - (keyWidth / 2) * Math.cos(angle) - (keyHeight / 2) * Math.sin(angle);
    const ctly =
      y - (keyWidth / 2) * Math.sin(angle) + (keyHeight / 2) * Math.cos(angle);
    const cblx =
      x - (keyWidth / 2) * Math.cos(angle) + (keyHeight / 2) * Math.sin(angle);
    const cbly =
      y - (keyWidth / 2) * Math.sin(angle) - (keyHeight / 2) * Math.cos(angle);
    const cbrx =
      x + (keyWidth / 2) * Math.cos(angle) + (keyHeight / 2) * Math.sin(angle);
    const cbry =
      y + (keyWidth / 2) * Math.sin(angle) - (keyHeight / 2) * Math.cos(angle);

    path.moveTo(-halfX + ctlx, halfY + ctly);
    path.lineTo(-halfX + ctrx, halfY + ctry);
    path.lineTo(-halfX + cbrx, halfY + cbry);
    path.lineTo(-halfX + cblx, halfY + cbly);

    return path;
  });

  shape.holes = holes;
  return shape;
}

function makeShape({width, height}: {width: number; height: number}) {
  const shape = new THREE.Shape();

  let sizeX = width;
  let sizeY = height;
  let radius = 0.1;

  let halfX = sizeX * 0.5 - radius;
  let halfY = sizeY * 0.5 - radius;
  let baseAngle = Math.PI * 0.5;
  let inclineAngle = (Math.PI * 7.5) / 180;
  shape.absarc(
    halfX + Math.atan(inclineAngle) * sizeY,
    halfY,
    radius,
    baseAngle * 0,
    baseAngle * 0 + baseAngle,
    false,
  );
  shape.absarc(
    -halfX,
    halfY,
    radius,
    baseAngle * 1,
    baseAngle * 1 + baseAngle,
    false,
  );
  shape.absarc(
    -halfX,
    -halfY,
    radius,
    baseAngle * 2,
    baseAngle * 2 + baseAngle,
    false,
  );
  shape.absarc(
    halfX,
    -halfY,
    radius,
    baseAngle * 3,
    baseAngle * 3 + baseAngle,
    false,
  );
  return shape;
}
const SimplePlate: React.FC<{width: number; height: number}> = ({
  width,
  height,
}) => {
  const depthOffset = 0.5;
  const heightOffset = 0.5;
  const keys: (VIAKey & {ei?: number})[] = useAppSelector(
    getSelectedKeyDefinitions,
  );
  const definition = useAppSelector(getSelectedDefinition);
  const macros = useAppSelector((state) => state.macros);
  if (!definition) {
    return null;
  }
  const plateShape = makePlateShape(
    {width: width + depthOffset / 4, height: height + heightOffset / 4},
    [],
  );
  const outsideColor = useMemo(
    () => getColors({color: KeyColorType.Accent}).c,
    [],
  );
  const innerColor = '#212020';

  return (
    <group
      position={[0.6, -heightOffset / 8, width / 2 + depthOffset / 2]}
      rotation-z={(-7.5 * Math.PI) / 180}
    >
      <mesh rotation-y={Math.PI / 2} castShadow={true}>
        <extrudeGeometry
          attach="geometry"
          args={[
            plateShape,
            {
              bevelEnabled: true,
              bevelSize: 0.1,
              bevelThickness: 0.1,
              bevelSegments: 10,
              depth: 0.25,
            },
          ]}
        />
        <meshPhongMaterial
          color={innerColor}
          shininess={100}
          reflectivity={1}
          specular={'#161212'}
        />
      </mesh>
    </group>
  );
};
const ComplexPlate = () => {
  const depthOffset = 0.5;
  const matrixKeycodes = [];
  const keys: (VIAKey & {ei?: number})[] = useAppSelector(
    getSelectedKeyDefinitions,
  );
  const definition = useAppSelector(getSelectedDefinition);
  const {basicKeyToByte, byteToKey} = useAppSelector(getBasicKeyToByte);
  const macros = useAppSelector((state) => state.macros);
  if (!definition) {
    return null;
  }
  const {width, height} = calculateKeyboardFrameDimensions(keys);
  const keysKeys = useMemo(() => {
    return {
      indices: keys.map(
        (k, i) => `${definition.vendorProductId}-${i}-${k.w}-${k.h}`,
      ),
      coords: keys.map((k, i) => {
        // x & y are pixel positioned
        const [x, y] = calculatePointPosition(k);
        const r = (k.r * (2 * Math.PI)) / 360;
        // The 1.05mm in-between keycaps but normalized by a keycap width/height
        const normalizedKeyXSpacing =
          KeycapMetric.keyXSpacing / KeycapMetric.keyWidth;
        const normalizedKeyYSpacing =
          KeycapMetric.keyYSpacing / KeycapMetric.keyHeight;
        const normalizedWidth = k.w + (k.w - 1) * normalizedKeyXSpacing;
        const normalizedHeight = k.h + (k.h - 1) * normalizedKeyYSpacing;
        console.log(x / CSSVarObject.keyXSpacing);
        return {
          position: [
            (KeycapMetric.keyXPos * x) / CSSVarObject.keyXPos,
            (-y * KeycapMetric.keyYPos) / CSSVarObject.keyYPos,
            0,
          ],
          rotation: [0, 0, -r],
          scale: [normalizedWidth, normalizedHeight, 1],
          color: getTextureColors(k),
        };
      }),
    };
  }, [definition, keys]);
  const plateShape = makePlateShape({width, height}, keysKeys.coords);
  const outsideColor = useMemo(
    () => getColors({color: KeyColorType.Accent}).c,
    [],
  );
  const innerColor = '#212020';

  return (
    <group
      position={[0.6, -depthOffset / 4, width / 2 + depthOffset / 2]}
      rotation-z={(-7.5 * Math.PI) / 180}
    >
      <mesh rotation-y={Math.PI / 2} castShadow={true}>
        <extrudeGeometry
          attach="geometry"
          args={[
            plateShape,
            {
              bevelEnabled: true,
              bevelSize: 0.1,
              bevelThickness: 0.1,
              bevelSegments: 10,
              depth: 0.25,
            },
          ]}
        />
        <meshPhongMaterial
          color={innerColor}
          shininess={100}
          reflectivity={1}
          specular={'#161212'}
        />
      </mesh>
    </group>
  );
};

const Heart = React.memo(
  (props: {caseWidth: number; caseHeight: number; caseThickness: number}) => {
    const heartShape = new THREE.Shape();

    heartShape.moveTo(25, 25);
    heartShape.bezierCurveTo(25, 25, 20, 0, 0, 0);
    heartShape.bezierCurveTo(-30, 0, -30, 35, -30, 35);
    heartShape.bezierCurveTo(-30, 55, -10, 77, 25, 95);
    heartShape.bezierCurveTo(60, 77, 80, 55, 80, 35);
    heartShape.bezierCurveTo(80, 35, 80, 0, 50, 0);
    heartShape.bezierCurveTo(35, 0, 25, 25, 25, 25);

    const extrudeSettings = {
      depth: 10,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 1,
      bevelThickness: 15,
    };

    return (
      <mesh
        position={[
          props.caseThickness,
          props.caseHeight / 2,
          props.caseWidth / 2,
        ]}
        scale={0.01}
        rotation={[Math.PI / 2, 0, Math.PI / 2]}
      >
        <extrudeGeometry
          attach="geometry"
          args={[heartShape, extrudeSettings]}
        />
        <meshPhongMaterial color={'darkgrey'} transparent={true} opacity={1} />
      </mesh>
    );
  },
  shallowEqual,
);

export const Case = (props: {width: number; height: number}) => {
  const innerColor = '#212020';
  const widthOffset = 0.4;
  const heightOffset = 0.5;
  const depthOffset = 0.5;

  const outsideColor = useMemo(
    () => getColors({color: KeyColorType.Accent}).c,
    [],
  );
  const outsideShape = useMemo(() => {
    return makeShape({
      width: 0.4 + widthOffset,
      height: props.height + heightOffset,
    });
  }, [props.height]);
  const innerShape = useMemo(() => {
    return makeShape({
      width: 0.4,
      height: props.height + heightOffset / 2,
    });
  }, [props.height]);

  return (
    <group
      position={[
        (KeycapMetric.keyXPos * (props.width + depthOffset)) / 2,
        heightOffset / 2,
        (-1 - 0.1) * KeycapMetric.keyXPos,
      ]}
      scale={KeycapMetric.keyXPos}
      rotation={new THREE.Euler(-(Math.PI * 7.5) / 180, -Math.PI / 2, 0)}
    >
      <Heart
        caseWidth={props.width}
        caseHeight={props.height + heightOffset / 2}
        caseThickness={2 * widthOffset}
      />
      <mesh position={[0, -0.1, 0]} castShadow={true}>
        <extrudeGeometry
          attach="geometry"
          args={[
            outsideShape,
            {
              bevelEnabled: true,
              bevelSize: 0.1,
              bevelThickness: 0.1,
              bevelSegments: 10,
              depth: props.width + depthOffset,
            },
          ]}
        />
        <meshPhongMaterial color={outsideColor} />
      </mesh>
      {false ? (
        <SimplePlate width={props.width} height={props.height} />
      ) : (
        <mesh position={[0.3, -0.1, depthOffset / 4]} castShadow={true}>
          <extrudeGeometry
            attach="geometry"
            args={[
              innerShape,
              {
                bevelEnabled: true,
                bevelSize: 0.05,
                bevelThickness: 0.05,
                depth: props.width + depthOffset / 2,
              },
            ]}
          />
          <meshPhongMaterial
            color={innerColor}
            shininess={100}
            reflectivity={1}
            specular={'#161212'}
          />
        </mesh>
      )}
    </group>
  );
};
