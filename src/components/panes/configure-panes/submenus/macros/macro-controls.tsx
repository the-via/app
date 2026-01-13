import {
  faCircle,
  faCompress,
  faExpand,
  faMagicWandSparkles,
  faSave,
  faSquare,
  faStopwatch,
  faTrash,
  faUndo,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  IconButtonContainer,
  IconToggleContainer,
} from 'src/components/inputs/icon-button';
import {IconButtonTooltip} from 'src/components/inputs/tooltip';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const MacroEditControlsContainer = styled.div`
  background: var(--bg_menu);
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
`;
const MacroControlGroupContainer = styled.div`
  border-radius: 2px;
  border: 1px solid var(--border_color_icon);
  display: inline-flex;
  > button:last-child {
    border: none;
  }
`;
const MacroControlGroupDivider = styled.div`
  background: var(--border_color_icon);
  width: 1px;
  height: 80%;
  margin: 0 10px;
`;

export const MacroEditControls: React.FC<{
  isFullscreen: boolean;
  isRecording: boolean;
  optimizeRecording: boolean;
  recordDelays: boolean;
  hasUnsavedChanges?: boolean;
  undoChanges(): void;
  deleteMacro(): void;
  saveChanges(): void;
  toggleOptimizeRecording(): void;
  toggleRecordDelays(): void;
  toggleFullscreen(): void;
  isEmpty?: boolean;
  recordingToggleChange: (a: boolean) => void;
  addText: () => void;
  isDelaySupported: boolean;
}> = ({
  isFullscreen,
  isRecording,
  recordingToggleChange,
  hasUnsavedChanges,
  undoChanges,
  saveChanges,
  recordDelays,
  toggleRecordDelays,
  optimizeRecording,
  toggleOptimizeRecording,
  isEmpty,
  deleteMacro,
  toggleFullscreen,
  isDelaySupported,
}) => {
  const {t} = useTranslation();
  const recordComponent = (
    <IconButtonContainer
      onClick={() => {
        recordingToggleChange(!isRecording);
      }}
      disabled={!isFullscreen}
    >
      <FontAwesomeIcon
        size={'sm'}
        color={'var(--color_label)'}
        icon={isRecording ? faSquare : faCircle}
      />
      <IconButtonTooltip>
        {isFullscreen
          ? isRecording
            ? t('Stop Recording')
            : t('Record Keystrokes')
          : t('Can only record when fullscreen')}
      </IconButtonTooltip>
    </IconButtonContainer>
  );
  return (
    <MacroEditControlsContainer>
      {hasUnsavedChanges ? (
        <>
          {!isRecording ? (
            <>
              <MacroControlGroupContainer>
                <IconButtonContainer
                  disabled={!hasUnsavedChanges || isRecording}
                  onClick={undoChanges}
                >
                  <FontAwesomeIcon
                    size={'sm'}
                    color="var(--color_label)"
                    icon={faUndo}
                  />
                  <IconButtonTooltip>Undo Changes</IconButtonTooltip>
                </IconButtonContainer>
                <IconButtonContainer
                  disabled={!hasUnsavedChanges || isRecording}
                  onClick={() => saveChanges()}
                >
                  <FontAwesomeIcon
                    size={'sm'}
                    color="var(--color_label)"
                    icon={faSave}
                  />
                  <IconButtonTooltip>Save Changes</IconButtonTooltip>
                </IconButtonContainer>
              </MacroControlGroupContainer>
              <MacroControlGroupDivider />
            </>
          ) : null}
        </>
      ) : !isEmpty ? (
        <>
          <MacroControlGroupContainer>
            <IconButtonContainer
              disabled={hasUnsavedChanges || isRecording}
              onClick={deleteMacro}
            >
              <FontAwesomeIcon
                size={'sm'}
                color="var(--color_label)"
                icon={faTrash}
              />
              <IconButtonTooltip>Delete Macro</IconButtonTooltip>
            </IconButtonContainer>
          </MacroControlGroupContainer>
          <MacroControlGroupDivider />
        </>
      ) : (
        <></>
      )}
      <MacroControlGroupContainer>
        {recordComponent}
        {
          <IconButtonContainer onClick={toggleFullscreen}>
            <FontAwesomeIcon
              size={'sm'}
              color="var(--color_label)"
              icon={isFullscreen ? faCompress : faExpand}
            />
            <IconButtonTooltip>
              {isFullscreen ? t('Exit Fullscreen') : t('Fullscreen')}
            </IconButtonTooltip>
          </IconButtonContainer>
        }
      </MacroControlGroupContainer>
      {!isRecording ? (
        <>
          <MacroControlGroupDivider />
          <MacroControlGroupContainer>
            <IconToggleContainer
              $selected={optimizeRecording}
              onClick={toggleOptimizeRecording}
            >
              <FontAwesomeIcon size={'sm'} icon={faMagicWandSparkles} />
              <IconButtonTooltip>
                {!optimizeRecording
                  ? t('Use Smart Optimization')
                  : t('Skip Smart Optimization')}
              </IconButtonTooltip>
            </IconToggleContainer>
            <IconToggleContainer
              disabled={!isDelaySupported}
              $selected={recordDelays}
              onClick={toggleRecordDelays}
            >
              <FontAwesomeIcon
                size={'sm'}
                icon={faStopwatch}
                className={'fa-stack-1x'}
              />
              <IconButtonTooltip>
                {!isDelaySupported
                  ? t('Upgrade firmware to use delays')
                  : !recordDelays
                  ? t('Record Delays')
                  : t('Skip Recording Delays')}
              </IconButtonTooltip>
            </IconToggleContainer>
          </MacroControlGroupContainer>
        </>
      ) : null}
    </MacroEditControlsContainer>
  );
};
