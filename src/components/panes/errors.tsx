import {
  faCancel,
  faDownload,
  faKeyboard,
  faSave,
  faWarning,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {render} from 'react-dom';
import {
  clearKeyboardAPIErrors,
  getKeyboardAPIErrors,
  KeyboardAPIError,
} from 'src/store/errorsSlice';
import {useAppDispatch, useAppSelector} from 'src/store/hooks';
import styled from 'styled-components';
import {Link, useLocation} from 'wouter';
import {AccentButton} from '../inputs/accent-button';
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

const renderKeyboardAPIErrors = (errors: KeyboardAPIError[]) => {
  return errors.map(
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
  );
};

const saveKeyboardAPIErrors = async (errors: KeyboardAPIError[]) => {
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: 'VIA-keyboard-API-errors.csv',
      types: [
        {
          accept: {'text/csv': ['.csv']},
          description: 'CSV file',
        },
      ],
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
const IconButtonGroupContainer = styled.div`
  border-radius: 2px;
  border: 1px solid var(--border_color_icon);
  display: inline-flex;
  > button:last-child {
    border: none;
  }
`;

export const Errors = () => {
  const dispatch = useAppDispatch();
  const keyboardAPIErrors = useAppSelector(getKeyboardAPIErrors);

  return (
    <Pane>
      <Grid style={{overflow: 'hidden'}}>
        <MenuCell style={{pointerEvents: 'all', borderTop: 'none'}}>
          <MenuContainer>
            <Row $selected={true}>
              <IconContainer>
                <FontAwesomeIcon icon={faKeyboard} />
                <MenuTooltip>Keyboard API</MenuTooltip>
              </IconContainer>
            </Row>
          </MenuContainer>
        </MenuCell>
        <SpanOverflowCell style={{flex: 1, borderWidth: 0}}>
          <IconButtonGroupContainer style={{margin: '10px 15px'}}>
            <IconButtonContainer
              onClick={() => dispatch(clearKeyboardAPIErrors())}
            >
              <FontAwesomeIcon
                size={'sm'}
                color="var(--color_label)"
                icon={faCancel}
              />
              <IconButtonTooltip>Clear</IconButtonTooltip>
            </IconButtonContainer>
            <IconButtonContainer
              onClick={() => saveKeyboardAPIErrors(keyboardAPIErrors)}
            >
              <FontAwesomeIcon
                size={'sm'}
                color="var(--color_label)"
                icon={faDownload}
              />
              <IconButtonTooltip>Download</IconButtonTooltip>
            </IconButtonContainer>
          </IconButtonGroupContainer>
          {renderKeyboardAPIErrors(keyboardAPIErrors)}
        </SpanOverflowCell>
      </Grid>
    </Pane>
  );
};

export const ErrorLink = () => {
  const keyboardAPIErrors = useAppSelector(getKeyboardAPIErrors);
  const [location] = useLocation();
  const isSelectedRoute = location === '/errors';
  if (keyboardAPIErrors.length) {
    return (
      <Link to="/errors">
        <CategoryIconContainer $selected={isSelectedRoute}>
          <FontAwesomeIcon
            size={'xl'}
            icon={ErrorsPaneConfig.icon}
            color={isSelectedRoute ? 'inherit' : 'gold'}
          />
          <CategoryMenuTooltip>
            {keyboardAPIErrors.length} error
            {keyboardAPIErrors.length ? 's' : ''}
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
