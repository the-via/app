import {useFrame} from '@react-three/fiber';
import React from 'react';
import {useRef} from 'react';

const GROUND_HEIGHT = -150; // A Constant to store the ground height of the game.

export const Terrain: React.VFC<{onClick?: () => void}> = React.memo(
  (props) => {
    const [width, height] = [2500, 1000];
    const terrain1 = useRef<THREE.Mesh>(null);
    const terrain2 = useRef<THREE.Mesh>(null);
    const deltaYZ = height * Math.sin(Math.PI / 4);
    const terrainWidthVertices = (width * 64) / 2500;
    const terrainHeightVertices = (height * 16) / 625;
    const deltaD = 0.2;
    const meshColor = '#454040';
    let terrains = [terrain1, terrain2];
    useFrame(() => {
      if (
        terrains[1].current &&
        terrains[1].current?.position.y <= GROUND_HEIGHT
      ) {
        terrains = [terrain2, terrain1];
        (terrains[0].current as any).position.y = GROUND_HEIGHT;
        (terrains[0].current as any).position.z = 0;
        (terrains[1].current as any).position.y =
          GROUND_HEIGHT + height * Math.sin(Math.PI / 4);
        (terrains[1].current as any).position.z =
          -height * Math.sin(Math.PI / 4);
      }
      for (let terrain of terrains) {
        if (terrain && terrain.current && terrain.current.position) {
          terrain.current.position.y -= deltaD;
          terrain.current.position.z += deltaD;
          (terrain.current.material as THREE.Material).opacity =
            1 + 0.5 * Math.sin((terrains[0].current as any).position.y / 12);
        }
      }
    });
    const phase = 0.5;
    return (
      <>
        <mesh
          visible
          position={[0, GROUND_HEIGHT + phase * deltaYZ, phase * -deltaYZ]}
          rotation={[-Math.PI / 4, 0, 0]}
          ref={terrain1}
          onClick={props.onClick}
        >
          <planeGeometry
            attach="geometry"
            args={[width, height, terrainWidthVertices, terrainHeightVertices]}
          />
          <meshStandardMaterial
            attach="material"
            color={meshColor}
            roughness={1}
            metalness={0}
            transparent={true}
            wireframe
          />
        </mesh>
        <mesh
          visible
          onClick={props.onClick}
          position={[
            0,
            GROUND_HEIGHT + (phase + 1) * deltaYZ,
            -deltaYZ * (phase + 1),
          ]}
          rotation={[-Math.PI / 4, 0, 0]}
          ref={terrain2}
        >
          <planeGeometry
            attach="geometry"
            args={[width, height, terrainWidthVertices, terrainHeightVertices]}
          />
          <meshStandardMaterial
            attach="material"
            color={meshColor}
            roughness={1}
            metalness={0}
            transparent={true}
            wireframe
          />
        </mesh>
      </>
    );
  },
  () => true,
);
