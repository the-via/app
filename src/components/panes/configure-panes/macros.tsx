import {useState, useMemo, FC, useCallback} from 'react';
import styled from 'styled-components';
import {OverflowCell, SubmenuOverflowCell, SubmenuRow} from '../grid';
import {CenterPane} from '../pane';
import {title, component} from '../../icons/adjust';
import {MacroDetailPane} from './submenus/macros/macro-detail';
import {useAppDispatch, useAppSelector} from '../../../store/hooks';
import {getSelectedConnectedDevice} from '../../../store/devicesSlice';
import {
  getExpressions,
  getMacroCount,
  saveMacros,
} from '../../../store/macrosSlice';

const MacroPane = styled(CenterPane)`
  height: 100%;
  background: var(--color_dark_grey);
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 12px;
  padding-top: 0;
`;

const MenuContainer = styled.div`
  padding: 15px 10px 20px 10px;
`;

export const Pane: FC = () => {
  const dispatch = useAppDispatch();
  const selectedDevice = useAppSelector(getSelectedConnectedDevice);
  const macroExpressions = useAppSelector(getExpressions);
  const macroCount = useAppSelector(getMacroCount);

  const [selectedMacro, setSelectedMacro] = useState(0);

  const saveMacro = useCallback(
    async (macro: string) => {
      if (!selectedDevice) {
        return;
      }

      const newMacros = macroExpressions.map((oldMacro, i) =>
        i === selectedMacro ? macro : oldMacro,
      );

      dispatch(saveMacros(selectedDevice, newMacros));
    },
    [macroExpressions, saveMacros, dispatch, selectedDevice, selectedMacro],
  );

  const macroMenus = useMemo(
    () =>
      Array(macroCount)
        .fill(0)
        .map((_, idx) => idx)
        .map((idx) => (
          <SubmenuRow
            $selected={selectedMacro === idx}
            onClick={() => setSelectedMacro(idx)}
            key={idx}
            style={{borderWidth: 0, textAlign: 'center'}}
          >
            {`M${idx}`}
          </SubmenuRow>
        )),
    [selectedMacro, macroCount],
  );

  if (!selectedDevice) {
    return null;
  }
  return (
    <>
      <SubmenuOverflowCell>
        <MenuContainer>{macroMenus}</MenuContainer>
      </SubmenuOverflowCell>
      <OverflowCell>
        <MacroPane>
          <Container>
            <MacroDetailPane
              macroExpressions={macroExpressions}
              selectedMacro={selectedMacro}
              saveMacros={saveMacro}
              protocol={selectedDevice ? selectedDevice.protocol : -1}
            />
          </Container>
        </MacroPane>
      </OverflowCell>
    </>
  );
};

// TODO: these are used in the context that configure.tsx imports menus with props Icon, Title, Pane.
// Should we encapsulate this type and wrap the exports to conform to them?
export const Icon = component;
export const Title = title;
