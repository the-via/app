import * as React from 'react';
import styled from 'styled-components';
import {OverflowCell, SubmenuOverflowCell, SubmenuRow} from '../grid';
import {CenterPane} from '../pane';
import {useState} from 'react';
import {title, component} from '../../icons/adjust';
import {MacroDetailPane} from './submenus/macros/macro-detail';
import {useAppSelector} from '../../../store/hooks';
import {getSelectedConnectedDevice} from '../../../store/devicesSlice';
import {saveMacros} from '../../../store/macrosSlice';
import {useDispatch} from 'react-redux';

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

export const MacroMenu = () => {
  const dispatch = useDispatch();
  const selectedDevice = useAppSelector((state) =>
    getSelectedConnectedDevice(state),
  );
  const macroExpressions = useAppSelector((state) => state.macros.expressions);

  const [selectedMacro, setSelectedMacro] = useState(0);

  const saveMacro = async (macro: string) => {
    if (!selectedDevice) {
      return;
    }

    const newMacros = macroExpressions.map((oldMacro, i) =>
      i === selectedMacro ? macro : oldMacro,
    );
    // TODO: does awaiting really make a difference here?
    await dispatch(saveMacros(selectedDevice, newMacros));
  };

  return (
    <>
      <SubmenuOverflowCell>
        <MenuContainer>
          {Array(16)
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
            ))}
        </MenuContainer>
      </SubmenuOverflowCell>
      <OverflowCell>
        <MacroPane>
          <Container>
            <MacroDetailPane
              macros={macroExpressions}
              selectedMacro={selectedMacro}
              saveMacros={saveMacro}
              key={selectedMacro}
            />
          </Container>
        </MacroPane>
      </OverflowCell>
    </>
  );
};

// TODO: how do these work?
export const Icon = component;
export const Title = title;
