import React from 'react';
import {AccentSlider} from '../inputs/accent-slider';
import {useDispatch} from 'react-redux';
import {useAppSelector} from 'src/store/hooks';
import {
  getAllowKeyboardKeyRemapping,
  getShowDesignTab,
  getDisableFastRemap,
  toggleCreatorMode,
  toggleFastRemap,
  toggleKeyRemappingViaKeyboard,
  getTheme,
  setTheme,
} from 'src/store/settingsSlice';

const version = '3.0.0-beta';
export const Settings = () => {
  const dispatch = useDispatch();
  const theme = useAppSelector(getTheme);

  // TODO: we could actually just grab all these from state.settings and then destructure.
  // Only advantage of this approach is indiviual memoisation. Worth?
  const allowKeyboardKeyRemapping = useAppSelector(
    getAllowKeyboardKeyRemapping,
  );
  const showDesignTab = useAppSelector(getShowDesignTab);
  const disableFastRemap = useAppSelector(getDisableFastRemap);

  React.useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="h-full w-full md:w-2/3 max-w-2xl mx-auto text-lg">
      <div className="flex flex-col mx-10 my-8 gap-8 border-2 border-outline rounded-lg p-8">
        <div className="flex items-center justify-between">
          <div className="font-medium">VIA Version</div>
          <div className="font-medium text-action">{version}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="font-medium">Theme</div>
          <div className="font-medium text-action capitalize">{theme}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="font-medium">Enable Design Feature</div>
          <AccentSlider
            onChange={() => dispatch(toggleCreatorMode())}
            isChecked={showDesignTab}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="w-2/3">
            <div className="font-medium">Fast Key Mapping</div>
            {/* FIXME: This explanation sucks */}
            <div className="text-sm">Remap happens from input.</div>
          </div>
          <AccentSlider
            onChange={() => dispatch(toggleFastRemap())}
            isChecked={disableFastRemap}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="w-2/3">
            <div className="font-medium">Key Remapping via Keyboard</div>
            {/* FIXME: This explanation sucks */}
            <div className="text-sm">Keyboard will remap from input by keyboard.</div>
          </div>
          <AccentSlider
            onChange={() => dispatch(toggleKeyRemappingViaKeyboard())}
            isChecked={allowKeyboardKeyRemapping}
          />
        </div>
      </div>
    </div>
  );
};
