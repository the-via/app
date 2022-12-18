import {KeyColorType} from '@the-via/reader';
import React from 'react';
import {useMemo} from 'react';
import {shallowEqual} from 'react-redux';
import * as THREE from 'three';
import {getColors} from '../positioned-keyboard';

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
        (19.05 * (props.width + depthOffset)) / 2,
        heightOffset / 2,
        (-1 - 0.1) * 19.05,
      ]}
      scale={19.05}
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
    </group>
  );
};
