import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter';
import {useThree} from '@react-three/fiber';
import {Html} from '@react-three/drei';

export const ExportScene = () => {
  const state = useThree();
  console.log(state);
  const onButtonClick = async () => {
    if (state) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: 'scene',
          types: [{accept: {'application/octet-stream': ['.glb']}}],
        });
        const exporter = new GLTFExporter();
        const result = await new Promise((res) => {
          exporter.parse(
            state.scene.children.slice(-3),
            res,
            (e) => console.error(e),
            {
              onlyVisible: true,
              binary: true,
            },
          );
        });

        const blob = new Blob([result as any], {
          type: 'application/octet-stream',
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } catch (err) {
        console.error(err);
        console.log('User cancelled save file request');
      }
    }
  };

  return (
    <Html>
      <button
        style={{
          position: 'absolute',
          bottom: 0,
          zIndex: 19,
          background: 'blue',
        }}
        onClick={onButtonClick}
      >
        CLICK ME
      </button>
    </Html>
  );
};
