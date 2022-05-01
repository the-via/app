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
} from 'src/store/settingsSlice';

const version = '3.0.0-beta';
export const Settings = () => {
  const dispatch = useDispatch();

  // TODO: we could actually just grab all these from state.settings and then destructure.
  // Only advantage of this approach is indiviual memoisation. Worth?
  const allowKeyboardKeyRemapping = useAppSelector(
    getAllowKeyboardKeyRemapping,
  );
  const showDesignTab = useAppSelector(getShowDesignTab);
  const disableFastRemap = useAppSelector(getDisableFastRemap);

  return (
    <div className="h-full max-w-xl p-4 text-lg">
      <div className="flex flex-col mx-10 gap-8">
        <div className="flex items-center justify-between">
          <div className="font-medium">VIA Version</div>
          <div className="font-medium text-action">{version}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="font-medium">Show Design tab</div>
          <AccentSlider
            onChange={() => dispatch(toggleCreatorMode())}
            isChecked={showDesignTab}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="font-medium">Fast Key Mapping</div>
          <AccentSlider
            onChange={() => dispatch(toggleFastRemap())}
            isChecked={disableFastRemap}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="font-medium">Allow remapping via keyboard</div>
          <AccentSlider
            onChange={() => dispatch(toggleKeyRemappingViaKeyboard())}
            isChecked={allowKeyboardKeyRemapping}
          />
        </div>
      </div>
    </div>
  );
};
