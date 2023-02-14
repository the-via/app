import {PresentationControls, useGLTF} from '@react-three/drei';
import React, {useRef} from 'react';
import cubeySrc from 'assets/models/cubey.glb';
import {useFrame} from '@react-three/fiber';
import {shallowEqual} from 'react-redux';
import {Color, Mesh, MeshBasicMaterial, MeshStandardMaterial} from 'three';
import {Theme} from 'src/utils/themes';
import {getDarkenedColor} from 'src/utils/color-math';

export const LoaderCubey: React.FC<{theme: Theme; visible: boolean}> =
  React.memo(({visible, theme}) => {
    const cubeyGLTF = useGLTF(cubeySrc);
    const spinnerRef = useRef<any>();
    const yInit = !visible ? 10 : -0.3;

    const darkAccent = getDarkenedColor(theme.accent.c, 0.8);
    const colorMap = {
      'upper-body': new Color(theme.mod.c),
      'lower-body': new Color(theme.mod.t),
      accent: new Color(darkAccent),
      bowtie: new Color(darkAccent),
    };

    cubeyGLTF.scene.children.forEach((child) => {
      const bodyPart = child.name.split('_')[0] as keyof typeof colorMap;
      const color = colorMap[bodyPart];
      // This is a hack and the .gltf should be updated
      if (bodyPart === 'upper-body') {
        ((child as Mesh).material as MeshStandardMaterial).roughness = 0.7;
      }
      if (color) {
        ((child as Mesh).material as MeshBasicMaterial).color = color;
      }
    });

    useFrame(({clock}) => {
      if (visible) {
        spinnerRef.current.rotation.z =
          Math.sin(clock.elapsedTime) * (Math.PI / 40);
        spinnerRef.current.rotation.y =
          Math.PI + Math.sin(0.6 * clock.elapsedTime) * (Math.PI / 16);
        spinnerRef.current.position.y =
          yInit + 0.2 * Math.sin(clock.elapsedTime);
      }
    });

    return (
      <>
        <group scale={0.6} position={[0, yInit, -19]}>
          <PresentationControls
            enabled={true} // the controls can be disabled by setting this to false
            global={true} // Spin globally or by dragging the model
            snap={true} // Snap-back to center (can also be a spring config)
            speed={1} // Speed factor
            zoom={1} // Zoom factor when half the polar-max is reached
            rotation={[0, 0, 0]} // Default rotation
            polar={[-Math.PI / 3, Math.PI / 3]} // Vertical limits
            config={{mass: 2, tension: 200, friction: 14}} // Spring config
          >
            <group ref={spinnerRef}>
              <primitive object={cubeyGLTF.scene} />
            </group>
          </PresentationControls>
        </group>
      </>
    );
  }, shallowEqual);
