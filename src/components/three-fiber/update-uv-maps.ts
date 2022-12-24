import {useGLTF} from '@react-three/drei';
import {useEffect} from 'react';
import {Box3, BufferAttribute, BufferGeometry} from 'three';

export const UpdateUVMaps = () => {
  const keycapNodes = useGLTF('/fonts/blenderspacecap.glb', true).nodes;
  useEffect(() => {
    // updating uv maps
    // let's assume of now we want to contain uvs in the bottom 1/3
    Object.values(keycapNodes).forEach((mesh) => {
      if ((mesh as THREE.Group).isGroup) {
        return;
      }
      const u100 = mesh as THREE.Mesh;
      const size1u = 1 / 2.6;
      const geometry100u = u100.geometry as BufferGeometry;
      const {min, max} = geometry100u!.boundingBox as Box3;
      const maxRange = max.y - min.y;
      const uv100u = u100.geometry.attributes.uv as BufferAttribute;
      const pos100u = u100.geometry.attributes.position as BufferAttribute;
      const newUv = new Float32Array(uv100u.count * 2);
      for (let i = 0; i < u100.geometry.attributes.uv.count; i++) {
        // update uvs
        newUv[2 * i] = (size1u * (pos100u.array[i * 3] - min.x)) / maxRange;
        newUv[2 * i + 1] =
          (size1u * (pos100u.array[i * 3 + 1] - min.y)) / maxRange;
      }
      uv100u.copyArray(newUv);
      geometry100u.center();
      uv100u.needsUpdate = true;
    });
  }, [keycapNodes]);
  return null;
};
