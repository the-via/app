import {useState} from 'react';
import {faAngleDown} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import {useAppDispatch, useAppSelector} from 'src/store/hooks';
import {
  getHostKeyboardLayout,
  updateHostKeyboardLayout,
} from 'src/store/settingsSlice';
import {keymapExtras} from 'src/utils/keymap-extras';

const Container = styled.div`
  position: absolute;
  right: 220px;
  top: 0px;
  font-size: 18px;
  pointer-events: none;
  font-weight: 400;
`;

const LayoutTitle = styled.label`
  pointer-events: all;
  display: inline-block;
  background: var(--color_accent);
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  font-size: 18px;
  text-transform: uppercase;
  color: var(--color_inside-accent);
  padding: 1px 10px;
  margin-right: 10px;
  border: solid 1px var(--bg_control);
  border-top: none;
  cursor: pointer;
  transition: all 0.1s ease-out;
  white-space: nowrap;
  &:hover {
    filter: brightness(0.7);
  }
`;

const LayoutList = styled.ul<{$show: boolean}>`
  padding: 0;
  border: 1px solid var(--bg_control);
  width: 220px;
  border-radius: 6px;
  background-color: var(--bg_menu);
  margin: 0;
  margin-top: 5px;
  right: 10px;
  position: absolute;
  pointer-events: ${(props) => (props.$show ? 'all' : 'none')};
  transition: all 0.2s ease-out;
  z-index: 11;
  opacity: ${(props) => (props.$show ? 1 : 0)};
  overflow-y: auto;
  max-height: 400px;
  transform: ${(props) => (props.$show ? 0 : `translateY(-5px)`)};
`;

const LayoutButton = styled.button<{$selected?: boolean}>`
  display: block;
  outline: none;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  border: none;
  background: ${(props) =>
    props.$selected ? 'var(--bg_icon-highlighted)' : 'transparent'};
  color: ${(props) =>
    props.$selected
      ? 'var(--color_icon_highlighted)'
      : 'var(--color_label-highlighted)'};
  cursor: pointer;
  text-align: left;
  font-size: 14px;
  padding: 5px 10px;
  &:hover {
    border: none;
    background: ${(props) =>
      props.$selected ? 'var(--bg_icon-highlighted)' : 'var(--bg_control)'};
    color: ${(props) =>
      props.$selected
        ? 'var(--color_control-highlighted)'
        : 'var(--color_label-highlighted)'};
  }
`;

const ClickCover = styled.div`
  position: fixed;
  z-index: 10;
  pointer-events: all;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.4;
  background: rgba(0, 0, 0, 0.75);
`;

const layoutOptions = Object.entries(keymapExtras).map(([key, value]) => ({
  key,
  label: value.label,
}));

export const HostKeyboardLayoutBadge = () => {
  const dispatch = useAppDispatch();
  const hostKeyboardLayout = useAppSelector(getHostKeyboardLayout);
  const [showList, setShowList] = useState(false);

  const currentLabel =
    keymapExtras[hostKeyboardLayout]?.label ?? hostKeyboardLayout;

  return (
    <>
      <Container>
        <LayoutTitle onClick={() => setShowList(!showList)}>
          {currentLabel}
          <FontAwesomeIcon
            icon={faAngleDown}
            style={{
              transform: showList ? 'rotate(180deg)' : '',
              transition: 'transform 0.2s ease-out',
              marginLeft: '5px',
            }}
          />
        </LayoutTitle>
        {showList && <ClickCover onClick={() => setShowList(false)} />}
        <LayoutList $show={showList}>
          {layoutOptions.map(({key, label}) => (
            <LayoutButton
              key={key}
              $selected={key === hostKeyboardLayout}
              onClick={() => {
                dispatch(updateHostKeyboardLayout(key));
                setShowList(false);
              }}
            >
              {label}
            </LayoutButton>
          ))}
        </LayoutList>
      </Container>
    </>
  );
};
