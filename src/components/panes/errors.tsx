import {faKeyboard} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {render} from 'react-dom';
import {
  clearKeyboardAPIErrors,
  getKeyboardAPIErrors,
  KeyboardAPIError,
} from 'src/store/errorsSlice';
import {useAppDispatch, useAppSelector} from 'src/store/hooks';
import styled from 'styled-components';
import {AccentButton} from '../inputs/accent-button';
import {MenuTooltip} from '../inputs/tooltip';
import {MenuContainer} from './configure-panes/custom/menu-generator';
import {Grid, MenuCell, Row, IconContainer, SpanOverflowCell} from './grid';
import {Pane} from './pane';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-bottom: 1px solid var(--color_accent);
  user-select: text;
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
          <ButtonContainer>
            <AccentButton onClick={() => dispatch(clearKeyboardAPIErrors())}>
              Clear
            </AccentButton>
            <AccentButton
              onClick={() => saveKeyboardAPIErrors(keyboardAPIErrors)}
            >
              Download
            </AccentButton>
          </ButtonContainer>
          {renderKeyboardAPIErrors(keyboardAPIErrors)}
        </SpanOverflowCell>
      </Grid>
    </Pane>
  );
};
