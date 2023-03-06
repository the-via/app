import {faKeyboard} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  clearKeyboardAPIErrors,
  getKeyboardAPIErrors,
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

const KeyboardAPIErrors = () => {
  const keyboardAPIErrors = useAppSelector(getKeyboardAPIErrors);
  return keyboardAPIErrors.map(
    ({message, stack, commandBytes, responseBytes, device}) => (
      <Container>
        <h3>{message}</h3>
        <div>{stack}</div>
        <dl>
          <dt>Command bytes</dt>
          <dd>{commandBytes.join(' ')}</dd>
          <dt>Response bytes</dt>
          <dd>{responseBytes.join(' ')}</dd>
        </dl>
        <h4>Device details</h4>
        <dl>
          <dt>Path</dt>
          <dd>{device.path}</dd>
          <dt>VendorId</dt>
          <dd>
            0x
            {device.vendorId.toString(16).padStart(8, '0').toUpperCase()}
          </dd>
          <dt>ProductId</dt>
          <dd>
            0x
            {device.productId.toString(16).padStart(8, '0').toUpperCase()}
          </dd>
        </dl>
      </Container>
    ),
  );
};

export const Errors = () => {
  const dispatch = useAppDispatch();
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
          <AccentButton onClick={() => dispatch(clearKeyboardAPIErrors())}>
            Clear errors
          </AccentButton>
          {KeyboardAPIErrors()}
        </SpanOverflowCell>
      </Grid>
    </Pane>
  );
};
