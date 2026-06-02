import React from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const MODES = {
  ENC_MODE_VOLUME: 0,
  ENC_MODE_MEDIA: 1,
  ENC_MODE_SCROLL: 2,
  ENC_MODE_BRIGHTNESS: 3,
  ENC_MODE_BACKLIGHT: 4,
  ENC_MODE_CUSTOM0: 5,
  ENC_MODE_CUSTOM1: 6,
  ENC_MODE_CUSTOM2: 7,
};

const MODE_LABELS = {
  ENC_MODE_VOLUME: 'Volume',
  ENC_MODE_MEDIA: 'Media',
  ENC_MODE_SCROLL: 'Scroll',
  ENC_MODE_BRIGHTNESS: 'Brightness',
  ENC_MODE_BACKLIGHT: 'Backlight',
  ENC_MODE_CUSTOM0: 'Custom 0',
  ENC_MODE_CUSTOM1: 'Custom 1',
  ENC_MODE_CUSTOM2: 'Custom 2',
};

const CenteredColumnDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ColumnDiv = styled.div`
  display: flex;
  flex-direction: column;
`;

type Props = {
  enabledModes: number;
  onChange: (value: number) => void;
};

export const EncoderModeToggle: React.FC<Props> = ({
  enabledModes,
  onChange,
}) => {
  const {t} = useTranslation();

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const {
      target: {checked: value, name},
    } = event;
    const flagBit = 1 << MODES[name as keyof typeof MODES];
    const newEnabledModes = value
      ? enabledModes | flagBit
      : enabledModes & ~flagBit;
    onChange(newEnabledModes);
  };

  const isChecked = (modeIdx: number): boolean =>
    ((1 << modeIdx) & enabledModes) > 0;

  return (
    <CenteredColumnDiv>
      <h3>{t('Enabled Encoder Modes:')}</h3>
      <p>{t('Only the selected encoder modes will be available on the keyboard')}</p>
      <ColumnDiv>
        {Object.entries(MODES).map(([key, value]) => (
          <label
            key={value}
            htmlFor={MODE_LABELS[key as keyof typeof MODE_LABELS]}
          >
            <input
              name={key}
              id={MODE_LABELS[key as keyof typeof MODE_LABELS]}
              type="checkbox"
              checked={isChecked(value)}
              onChange={handleInputChange}
            />
            {t(MODE_LABELS[key as keyof typeof MODE_LABELS])}
          </label>
        ))}
      </ColumnDiv>
    </CenteredColumnDiv>
  );
};

export default EncoderModeToggle;
