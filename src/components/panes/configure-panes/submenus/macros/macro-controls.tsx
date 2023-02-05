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
import {IconButtonTooltip} from 'src/components/inputs/tooltip';
import styled from 'styled-components';

export const IconButton = styled.button`
  appearance: none;
  width: 40px;
  position: relative;
  display: inline-block;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 10px 10px;
  line-height: initial;
  font-size: initial;
  color: ${(props) =>
    props.disabled ? 'var(--bg_control)' : 'var(--color_accent)'};
  border-color: ${(props) =>
    props.disabled ? 'var(--bg_control)' : 'var(--color_accent)'};
  &:disabled {
    cursor: not-allowed;
    border-right: 1px solid var(--border_color_icon);
    cursor: not-allowed;
    background: var(--bg_menu);
  }
  &:hover {
    color: ${(props) =>
      props.disabled ? 'var(--bg_control)' : 'var(--color_inside-accent)'};
    border-color: ${(props) =>
      props.disabled ? 'var(--bg_control)' : 'var(--color_accent)'};
    border-right: 1px solid var(--border_color_icon);
    background-color: ${(props) =>
      props.disabled ? 'var(--bg_menu)' : 'var(--color_accent)'};
  }

  svg {
    color: ${(props) =>
      props.disabled ? 'var(--bg_control)' : 'var(--color_accent)'};
  }
  &:hover {
    svg {
      color: ${(props) =>
        props.disabled ? 'var(--bg_control)' : 'var(--color_inside-accent)'};
    }

    color: var(--color_label-highlighted);
    & .tooltip {
      transform: scale(1) translateX(0px);
      opacity: 1;
    }
  }
  .tooltip {
    transform: translateX(-5px) scale(0.6);
    opacity: 0;
  }
`;

export const IconButtonContainer = styled(IconButton)`
  cursor: pointer;
  background: var(--bg_control);
  border-right: 1px solid var(--border_color_icon);
`;

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
  revertChanges(): void;
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
  revertChanges,
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
                onClick={revertChanges}
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
