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
import ControlSelect from '../controls/ControlSelect';

const THEMES = ['noire', 'olive', 'olivia'];

const ThemeOptions = THEMES.map((theme) => ({
  // FIXME: Need to capitalize each word of multi-word themes
  label: theme.replace(/^\w/, (c) => c.toUpperCase()),
  value: theme,
}));

const version = '3.0.0-alpha';
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
          <ControlSelect
            className="w-1/4"
            defaultValue={theme}
            onChange={(selectedValue) => {
              // This is me being lazy: some components read colors dynamically
              // from document.body and won't be able to read updated colors
              // until the they've triggered.
              document.body.dataset.theme = selectedValue;

              dispatch(setTheme(selectedValue));
            }}
            options={ThemeOptions}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="font-medium">Design Mode</div>
          <AccentSlider
            onChange={() => dispatch(toggleCreatorMode())}
            isChecked={showDesignTab}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="w-2/3">
            <div className="font-medium">Fast Key Mapping</div>
            <div className="text-sm">Auto-selects next key after updating keymap</div>
          </div>
          <AccentSlider
            onChange={() => dispatch(toggleFastRemap())}
            isChecked={disableFastRemap}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="w-2/3">
            <div className="font-medium">Passthrough Key Remapping</div>
            {/* FIXME: This explanation sucks */}
            <div className="text-sm">
              Allow updating keymap with keyboard input
            </div>
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
