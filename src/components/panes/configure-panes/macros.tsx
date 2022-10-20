import React, {useState, useMemo} from 'react';
import styled from 'styled-components';
import {OverflowCell, SubmenuOverflowCell, SubmenuRow} from '../grid';
import {CenterPane} from '../pane';
import {title, component} from '../../icons/adjust';
import {MacroDetailPane} from './submenus/macros/macro-detail';
import {useAppSelector} from '../../../store/hooks';
import {getSelectedConnectedDevice} from '../../../store/devicesSlice';
import {saveMacros} from '../../../store/macrosSlice';
import {useDispatch} from 'react-redux';
import type {FC} from 'react';

const MacroPane = styled(CenterPane)`
  height: 100%;
  background: var(--color_dark_grey);
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 12px;
`;

const MenuContainer = styled.div`
  padding: 15px 20px 20px 10px;
`;

export const Pane: FC = () => {
  const dispatch = useDispatch();
  const selectedDevice = useAppSelector(getSelectedConnectedDevice);
  const macroExpressions = useAppSelector((state) => state.macros.expressions);

  const [selectedMacro, setSelectedMacro] = useState(0);

  const saveMacro = async (macro: string) => {
    if (!selectedDevice) {
      return;
    }

    const newMacros = macroExpressions.map((oldMacro, i) =>
      i === selectedMacro ? macro : oldMacro,
    );

    dispatch(saveMacros(selectedDevice, newMacros));
  };

  const macroMenus = useMemo(
    () =>
      Array(16)
        .fill(0)
        .map((_, idx) => idx)
        .map((idx) => (
          <SubmenuRow
            selected={selectedMacro === idx}
            onClick={(_) => setSelectedMacro(idx)}
            key={idx}
          >
            {`Macro ${idx}`}
          </SubmenuRow>
        )),
    [selectedMacro],
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
              key={selectedMacro}
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
