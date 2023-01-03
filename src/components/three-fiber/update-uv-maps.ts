import {useGLTF} from '@react-three/drei';
import {useEffect} from 'react';
import {Box3, BufferAttribute, BufferGeometry} from 'three';
import glbSrc from 'assets/models/keyboard_components.glb';

export const UpdateUVMaps = () => {
  const keycapNodes = useGLTF(glbSrc, true).nodes;
  useEffect(() => {
    // updating uv maps
    // let's assume of now we want to contain uvs in the bottom 1/3
    Object.values(keycapNodes).forEach((mesh) => {
      if ((mesh as THREE.Group).isGroup) {
        return;
      }
      const u100 = mesh as THREE.Mesh;
      // 1U scale to texture unit
      const size1u = 1 / 2.6;
      const geometry100u = u100.geometry as BufferGeometry;
      const {min, max} = geometry100u!.boundingBox as Box3;
      const maxRangeY = max.y - min.y;
      // 1U in mm (which is also mesh units)
      const unitScale = 19.05;
      // This is the offset between the cherry grid corner and a keycap corner in mm
      // (which is also mesh units).
      // A 1U keycap is actually 18.16mm, 1U is 19.05mm
      // thus the offset is ( 19.05 - 18.16 ) / 2 = 0.445
      // This gap is constant for all keycap sizes.
      // Aligning the UV coordinates relative to the cherry grid corner makes
      // the math easier later on when using dimensions in cherry units i.e. U
      const offsetToCorner = 0.445;
      const pos100u = u100.geometry.attributes.position as BufferAttribute;
      if (!u100.geometry.attributes.uv) {
        u100.geometry.setAttribute(
          'uv',
          new BufferAttribute(new Float32Array(pos100u.count * 2), 2, false),
        );
      }
      const uv100u = u100.geometry.attributes.uv as BufferAttribute;

      const newUv = new Float32Array(uv100u.count * 2);
      for (let i = 0; i < u100.geometry.attributes.uv.count; i++) {
        // update uvs
        newUv[2 * i] = (size1u * (pos100u.array[i * 3] - min.x + offsetToCorner)) / unitScale;
        newUv[2 * i + 1] =
          (size1u * (pos100u.array[i * 3 + 1] - min.y + offsetToCorner)) / unitScale;
      }
      uv100u.copyArray(newUv);
      geometry100u.center();
      uv100u.needsUpdate = true;
    });
  }, [keycapNodes]);
  return null;
};
