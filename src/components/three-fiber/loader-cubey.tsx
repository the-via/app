import {PresentationControls, useGLTF} from '@react-three/drei';
import React, {useRef} from 'react';
import cubeySrc from 'assets/models/cubey.glb';
import {useFrame} from '@react-three/fiber';
import {shallowEqual} from 'react-redux';

export const LoaderCubey: React.FC<{color: string; visible: boolean}> =
  React.memo(({visible, color}) => {
    const cubeyGLTF = useGLTF(cubeySrc);
    const spinnerRef = useRef<any>();
    const yInit = !visible ? 10 : -0.6;

    cubeyGLTF.scene.children.forEach((child) => {
      if (child.name === 'body') {
        //        child.material.color = new Color(color);
        console.log(child);
      }
    });

    useFrame(({clock}) => {
      if (visible) {
        spinnerRef.current.rotation.z =
          Math.sin(clock.elapsedTime) * (Math.PI / 40);
        spinnerRef.current.rotation.y =
          Math.PI + Math.sin(0.6 * clock.elapsedTime) * (Math.PI / 16);
        console.log(spinnerRef.current);
        spinnerRef.current.position.y =
          yInit + 0.2 * Math.sin(clock.elapsedTime);
      }
    });

    return (
      <>
        <group ref={spinnerRef} scale={0.6} position={[0, yInit, -19]}>
          <PresentationControls
            enabled={true} // the controls can be disabled by setting this to false
            global={true} // Spin globally or by dragging the model
            snap={true} // Snap-back to center (can also be a spring config)
            speed={1} // Speed factor
            zoom={1} // Zoom factor when half the polar-max is reached
            rotation={[0, 0, 0]} // Default rotation
            polar={[-Math.PI / 4, Math.PI / 4]} // Vertical limits
            azimuth={[-Math.PI / 4, Math.PI / 4]} // Horizontal limits
            config={{mass: 1, tension: 170, friction: 26}} // Spring config
          >
            <primitive object={cubeyGLTF.scene} />
          </PresentationControls>
        </group>
      </>
    );
  }, shallowEqual);
