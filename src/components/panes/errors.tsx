import {IconProp} from '@fortawesome/fontawesome-svg-core';
import {
  faCancel,
  faComputer,
  faDownload,
  faKeyboard,
  faWarning,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {PropsWithChildren, useState} from 'react';
import {useDispatch} from 'react-redux';
import {
  AppError,
  clearAppErrors,
  clearKeyboardAPIErrors,
  getAppErrors,
  getKeyboardAPIErrors,
  KeyboardAPIError,
} from 'src/store/errorsSlice';
import {useAppSelector} from 'src/store/hooks';
import {formatNumberAsHex} from 'src/utils/format';
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

const printId = (id: number) => formatNumberAsHex(id, 4);
const printBytes = (bytes: number[]) => bytes.join(' ');

const ErrorList: React.FC<
  PropsWithChildren<{
    clear: () => void;
    save: () => void;
    hasErrors: boolean;
  }>
> = (props) => {
  const {clear, save, hasErrors} = props;
  return (
    <>
      <IconButtonGroupContainer style={{margin: '10px 15px'}}>
        <IconButtonContainer onClick={clear} disabled={!hasErrors}>
          <FontAwesomeIcon
            size={'sm'}
            color="var(--color_label)"
            icon={faCancel}
          />
          <IconButtonTooltip>Clear</IconButtonTooltip>
        </IconButtonContainer>
        <IconButtonContainer onClick={save} disabled={!hasErrors}>
          <FontAwesomeIcon
            size={'sm'}
            color="var(--color_label)"
            icon={faDownload}
          />
          <IconButtonTooltip>Download</IconButtonTooltip>
        </IconButtonContainer>
      </IconButtonGroupContainer>
      {props.children}
    </>
  );
};

const AppErrors: React.FC<{}> = ({}) => {
  const errors = useAppSelector(getAppErrors);
  const dispatch = useDispatch();
  return (
    <ErrorList
      clear={() => dispatch(clearAppErrors())}
      save={() => saveAppErrors(errors)}
      hasErrors={!!errors.length}
    >
      {errors.map(({timestamp, productName, productId, vendorId, error}) => (
        <Container key={timestamp}>
          {timestamp}
          <ul>
            <li>Error: {error}</li>
            <li>Device: {productName}</li>
            <li>Vid: {printId(vendorId)}</li>
            <li>Pid: {printId(productId)}</li>
          </ul>
        </Container>
      ))}
    </ErrorList>
  );
};

const KeyboardAPIErrors: React.FC<{}> = ({}) => {
  const errors = useAppSelector(getKeyboardAPIErrors);
  const dispatch = useDispatch();
  return (
    <ErrorList
      clear={() => dispatch(clearKeyboardAPIErrors())}
      save={() => saveKeyboardAPIErrors(errors)}
      hasErrors={!!errors.length}
    >
      {errors.map(
        ({
          timestamp,
          commandName,
          commandBytes,
          responseBytes,
          vendorId,
          productId,
        }) => (
          <Container key={timestamp}>
            {timestamp}
            <ul>
              <li>Vid: {printId(vendorId)}</li>
              <li>Pid: {printId(productId)}</li>
              <li>Command name: {commandName}</li>
              <li>Command: {printBytes(commandBytes)}</li>
              <li>Response: {printBytes(responseBytes)}</li>
            </ul>
          </Container>
        ),
      )}
    </ErrorList>
  );
};

async function saveErrors<T>(
  errors: T[],
  headers: Array<keyof T>,
  fileName: string,
  printRow: (error: T) => string,
) {
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: `${fileName}.csv`,
    });
    const csvHeaders = [headers.join(', ')];
    const data = errors.map(printRow);
    const csv = csvHeaders.concat(...data).join('\n');
    const blob = new Blob([csv], {type: 'text/csv'});
    const writeable = await handle.createWritable();
    await writeable.write(blob);
    await writeable.close();
  } catch (err) {
    console.log('User cancelled save errors request');
  }
}

const saveKeyboardAPIErrors = async (errors: KeyboardAPIError[]) =>
  saveErrors(
    errors,
    [
      'timestamp',
      'vendorId',
      'productId',
      'commandName',
      'commandBytes',
      'responseBytes',
    ],
    'VIA-keyboard-API-errors',
    ({
      timestamp,
      vendorId,
      productId,
      commandName,
      commandBytes,
      responseBytes,
    }) =>
      `${timestamp}, ${printId(vendorId)}, ${printId(
        productId,
      )}, ${commandName}, ${printBytes(commandBytes)}, ${printBytes(
        responseBytes,
      )}`,
  );

const saveAppErrors = async (errors: AppError[]) =>
  saveErrors(
    errors,
    ['timestamp', 'productName', 'vendorId', 'productId', 'error'],
    'VIA-app-errors',
    ({timestamp, productName, vendorId, productId, error}) =>
      `${timestamp}, ${productName}, ${printId(vendorId)}, ${printId(
        productId,
      )}, ${error}`,
  );

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
