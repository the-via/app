import {useSpring} from '@react-spring/three';
import {PerspectiveCamera, useProgress} from '@react-three/drei';
import {useFrame, useThree} from '@react-three/fiber';
import {VIAKey} from '@the-via/reader';
import React from 'react';

export const Camera = () => {
  const {progress} = useProgress();
  const camera = useThree((state) => state.camera);
  const startX = 10;
  const endX = 7;
  const glow = useSpring({
    config: {duration: 800},
    from: {x: startX},
  });

  React.useEffect(() => {
    if (progress === 100) {
      console.log('lets animate');
      glow.x.start(endX);
    }
  }, [progress]);

  React.useEffect(() => {
    console.log('mounting');
    return () => {
      console.log('unmounting');
    };
  }, []);
  useFrame(() => {
    if (glow.x.isAnimating) {
      camera.position.setZ(glow.x.get());
      camera.position.setY(0.4 * Math.pow(glow.x.get() - endX, 1));
      camera.updateProjectionMatrix();
    }
    if (camera.zoom !== 5.5 * 0.8) {
      camera.zoom = 5.5 * 0.8;
      camera.updateProjectionMatrix();
    }
  });
  return <PerspectiveCamera makeDefault fov={25}></PerspectiveCamera>;
};
