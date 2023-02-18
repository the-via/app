import {
  faCircle,
  faCompress,
  faExpand,
  faSave,
  faSquare,
  faTrash,
  faUndo,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {IconButtonContainer} from 'src/components/inputs/icon-button';
import {IconButtonTooltip} from 'src/components/inputs/tooltip';
import styled from 'styled-components';

export const MacroEditControlsContainer = styled.div`
  border-radius: 2px;
  border: 1px solid var(--border_color_icon);
  display: inline-flex;
  > button:last-child {
    border: none;
  }
`;

export const MacroEditControls: React.FC<{
  isFullscreen: boolean;
  isRecording: boolean;
  hasUnsavedChanges?: boolean;
  undoChanges(): void;
  deleteMacro(): void;
  saveChanges(): void;
  toggleFullscreen(): void;
  isEmpty?: boolean;
  recordingToggleChange: (a: boolean) => void;
  addText: () => void;
}> = ({
  isFullscreen,
  isRecording,
  recordingToggleChange,
  hasUnsavedChanges,
  undoChanges,
  saveChanges,
  isEmpty,
  deleteMacro,
  toggleFullscreen,
}) => {
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
            ? 'Stop Recording'
            : 'Record Keystrokes'
          : 'Can only record when fullscreen'}
      </IconButtonTooltip>
    </IconButtonContainer>
  );
  return (
    <MacroEditControlsContainer>
      {hasUnsavedChanges ? (
        <>
          {!isRecording ? (
            <>
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
            </>
          ) : null}
        </>
      ) : !isEmpty ? (
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
      ) : null}
      {recordComponent}
      {
        <IconButtonContainer onClick={toggleFullscreen}>
          <FontAwesomeIcon
            size={'sm'}
            color="var(--color_label)"
            icon={isFullscreen ? faCompress : faExpand}
          />
          <IconButtonTooltip>
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </IconButtonTooltip>
        </IconButtonContainer>
      }
    </MacroEditControlsContainer>
  );
};
