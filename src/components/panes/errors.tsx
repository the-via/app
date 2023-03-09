import {IconProp} from '@fortawesome/fontawesome-svg-core';
import {
  faCancel,
  faComputer,
  faDownload,
  faKeyboard,
  faWarning,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {useState} from 'react';
import {useDispatch} from 'react-redux';
import {
  clearAppErrors,
  clearKeyboardAPIErrors,
  getAppErrors,
  getKeyboardAPIErrors,
  KeyboardAPIError,
} from 'src/store/errorsSlice';
import {useAppSelector} from 'src/store/hooks';
import styled from 'styled-components';
import {Link, useLocation} from 'wouter';
import {IconButtonContainer} from '../inputs/icon-button';
import {
  CategoryMenuTooltip,
  IconButtonTooltip,
  MenuTooltip,
} from '../inputs/tooltip';
import {MenuContainer} from './configure-panes/custom/menu-generator';
import {
  Grid,
  MenuCell,
  Row,
  IconContainer,
  SpanOverflowCell,
  CategoryIconContainer,
} from './grid';
import {Pane} from './pane';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  user-select: text;
  border-top: 1px solid var(--color_accent);
  &:last-of-type {
    border-bottom: 1px solid var(--color_accent);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  padding: 1.5rem 3rem;
  gap: 2rem;
`;

const printId = (id: number) =>
  `0x${id.toString(16).padStart(4, '0').toUpperCase()}`;

const printBytes = (bytes: number[]) => bytes.join(' ');

const AppErrors: React.FC<{}> = ({}) => {
  const errors = useAppSelector(getAppErrors);
  const dispatch = useDispatch();
  return (
    <>
      <IconButtonGroupContainer style={{margin: '10px 15px'}}>
        <IconButtonContainer onClick={() => dispatch(clearAppErrors())}>
          <FontAwesomeIcon
            size={'sm'}
            color="var(--color_label)"
            icon={faCancel}
          />
          <IconButtonTooltip>Clear</IconButtonTooltip>
        </IconButtonContainer>
        <IconButtonContainer onClick={() => saveAppErrors(errors)}>
          <FontAwesomeIcon
            size={'sm'}
            color="var(--color_label)"
            icon={faDownload}
          />
          <IconButtonTooltip>Download</IconButtonTooltip>
        </IconButtonContainer>
      </IconButtonGroupContainer>
      {errors.map(([timestamp, {name, message, cause}]) => (
        <Container key={timestamp}>
          {timestamp}
          <ul>
            <li>Name: {name}</li>
            <li>Message: {message}</li>
            <li>Cause: {`${cause}`}</li>
          </ul>
        </Container>
      ))}
    </>
  );
};

const KeyboardAPIErrors: React.FC<{}> = ({}) => {
  const errors = useAppSelector(getKeyboardAPIErrors);
  const dispatch = useDispatch();
  return (
    <>
      <IconButtonGroupContainer style={{margin: '10px 15px'}}>
        <IconButtonContainer onClick={() => dispatch(clearKeyboardAPIErrors())}>
          <FontAwesomeIcon
            size={'sm'}
            color="var(--color_label)"
            icon={faCancel}
          />
          <IconButtonTooltip>Clear</IconButtonTooltip>
        </IconButtonContainer>
        <IconButtonContainer onClick={() => saveKeyboardAPIErrors(errors)}>
          <FontAwesomeIcon
            size={'sm'}
            color="var(--color_label)"
            icon={faDownload}
          />
          <IconButtonTooltip>Download</IconButtonTooltip>
        </IconButtonContainer>
      </IconButtonGroupContainer>
      {errors.map(
        ({timestamp, commandName, commandBytes, responseBytes, device}) => (
          <Container key={timestamp}>
            {timestamp}
            <ul>
              <li>Vid: {printId(device.vendorId)}</li>
              <li>Pid: {printId(device.productId)}</li>
              <li>Command name: {commandName}</li>
              <li>Command: {printBytes(commandBytes)}</li>
              <li>Response: {printBytes(responseBytes)}</li>
            </ul>
          </Container>
        ),
      )}
    </>
  );
};

const saveKeyboardAPIErrors = async (errors: KeyboardAPIError[]) => {
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: 'VIA-keyboard-API-errors.csv',
    });
    const headers = [`timestamp, vid, pid, commandName, command, response`];
    const data = errors.map(
      ({timestamp, commandName, commandBytes, responseBytes, device}) =>
        `${timestamp}, ${printId(device.vendorId)}, ${printId(
          device.productId,
        )}, ${commandName}, ${printBytes(commandBytes)}, ${printBytes(
          responseBytes,
        )}`,
    );
    const csv = headers.concat(...data).join('\n');
    const blob = new Blob([csv], {type: 'text/csv'});
    const writeable = await handle.createWritable();
    await writeable.write(blob);
    await writeable.close();
  } catch (err) {
    console.log('User cancelled save errors request');
  }
};
const saveAppErrors = async (errors: [string, Error][]) => {
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: 'VIA-app-errors.csv',
    });
    const headers = [`timestamp, name, message, cause`];
    const data = errors.map(
      ([timestamp, {name, message, cause}]) =>
        `${timestamp}, ${name}, ${message}, ${cause}`,
    );
    const csv = headers.concat(...data).join('\n');
    const blob = new Blob([csv], {type: 'text/csv'});
    const writeable = await handle.createWritable();
    await writeable.write(blob);
    await writeable.close();
  } catch (err) {
    console.log('User cancelled save errors request');
  }
};
const IconButtonGroupContainer = styled.div`
  border-radius: 2px;
  border: 1px solid var(--border_color_icon);
  display: inline-flex;
  > button:last-child {
    border: none;
  }
`;

enum ErrorPaneMenu {
  KeyboardAPI,
  App,
}

const ErrorPanes: [ErrorPaneMenu, React.FC, IconProp, string][] = [
  [ErrorPaneMenu.KeyboardAPI, KeyboardAPIErrors, faKeyboard, 'Keyboard API'],
  [ErrorPaneMenu.App, AppErrors, faComputer, 'App'],
];

export const Errors = () => {
  const [selectedPane, setSelectedPane] = useState(ErrorPaneMenu.KeyboardAPI);
  const PaneComponent = (ErrorPanes.find(([id]) => selectedPane === id) ||
    ErrorPanes[0])[1];
  return (
    <Pane>
      <Grid style={{overflow: 'hidden'}}>
        <MenuCell style={{pointerEvents: 'all', borderTop: 'none'}}>
          <MenuContainer>
            {ErrorPanes.map(([id, _, Icon, menuName]) => (
              <Row
                $selected={selectedPane === id}
                onClick={() => {
                  setSelectedPane(id);
                }}
              >
                <IconContainer>
                  <FontAwesomeIcon icon={Icon} />
                  <MenuTooltip>{menuName}</MenuTooltip>
                </IconContainer>
              </Row>
            ))}
          </MenuContainer>
        </MenuCell>
        <SpanOverflowCell style={{flex: 1, borderWidth: 0}}>
          <PaneComponent />
        </SpanOverflowCell>
      </Grid>
    </Pane>
  );
};

export const ErrorLink = () => {
  const keyboardAPIErrors = useAppSelector(getKeyboardAPIErrors);
  const appErrors = useAppSelector(getAppErrors);
  const allErrors = [...keyboardAPIErrors, ...appErrors];
  const [location] = useLocation();
  const isSelectedRoute = location === '/errors';
  if (allErrors.length) {
    return (
      <Link to="/errors">
        <CategoryIconContainer $selected={isSelectedRoute}>
          <FontAwesomeIcon
            size={'xl'}
            icon={ErrorsPaneConfig.icon}
            color={isSelectedRoute ? 'inherit' : 'gold'}
          />
          <CategoryMenuTooltip>
            {allErrors.length} error
            {allErrors.length > 1 ? 's' : ''}
          </CategoryMenuTooltip>
        </CategoryIconContainer>
      </Link>
    );
  }

  return null;
};

export const ErrorsPaneConfig = {
  component: Errors,
  path: '/errors',
  icon: faWarning,
  key: 'errors',
  title: 'Errors',
};
