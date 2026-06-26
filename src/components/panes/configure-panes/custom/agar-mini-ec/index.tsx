import {getBoundingBox} from '@the-via/reader';
import type {Result, VIAKey} from '@the-via/reader';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import styled from 'styled-components';
import {AccentButton} from 'src/components/inputs/accent-button';
import {AccentSelect} from 'src/components/inputs/accent-select';
import {component as TuneIcon} from 'src/components/icons/tune';
import {
  ControlRow,
  Detail,
  Label,
  SpanOverflowCell,
} from 'src/components/panes/grid';
import {CenterPane} from 'src/components/panes/pane';
import {
  getSelectedKeyDefinitions,
  getSelectedLayoutOptions,
  updateLayoutOption,
} from 'src/store/definitionsSlice';
import {getSelectedKeyboardAPI} from 'src/store/devicesSlice';
import {useAppDispatch, useAppSelector} from 'src/store/hooks';
import {
  AGAR_EC_MATRIX_COLS,
  AGAR_EC_MATRIX_ROWS,
  AgarEcRow,
  readAgarEcRow,
} from './api';

const EC_SENSITIVITY_LAYOUT_INDEX = 2;
const EC_ACTUATION_THRESHOLDS = [92, 100, 108, 116, 124, 132, 140, 148];
const POLL_INTERVAL_MS = 140;

type EcCellValue = number | null;
type AgarKey = VIAKey & {ei?: number};

type KeyGeometry = {
  id: string;
  key: AgarKey;
  left: number;
  top: number;
  width: number;
  height: number;
};

const makeEmptyRows = (): EcCellValue[][] =>
  Array.from({length: AGAR_EC_MATRIX_ROWS}, () =>
    Array.from({length: AGAR_EC_MATRIX_COLS}, () => null),
  );

const makeEmptyMasks = (): number[] =>
  Array.from({length: AGAR_EC_MATRIX_ROWS}, () => 0);

const getReleaseThreshold = (level: number) =>
  EC_ACTUATION_THRESHOLDS[level] - level - 3;

const getKeyboardGeometry = (keys: AgarKey[]) => {
  const visibleKeys = keys.filter((key) => !key.d);
  const boxes = visibleKeys.map((key) => ({
    key,
    box: getBoundingBox(key as unknown as Result),
  }));

  if (!boxes.length) {
    return {keys: [] as KeyGeometry[], width: 1, height: 1};
  }

  const minX = Math.min(...boxes.map(({box}) => box.xStart));
  const minY = Math.min(...boxes.map(({box}) => box.yStart));
  const maxX = Math.max(...boxes.map(({box}) => box.xEnd));
  const maxY = Math.max(...boxes.map(({box}) => box.yEnd));
  const width = maxX - minX || 1;
  const height = maxY - minY || 1;

  return {
    width,
    height,
    keys: boxes.map(({key, box}, index) => ({
      id: `${index}-${key.row}-${key.col}-${key.w}-${key.h}`,
      key,
      left: ((box.xStart - minX) / width) * 100,
      top: ((box.yStart - minY) / height) * 100,
      width: ((box.xEnd - box.xStart) / width) * 100,
      height: ((box.yEnd - box.yStart) / height) * 100,
    })),
  };
};

const ContainerPane = styled(CenterPane)`
  height: 100%;
  background: var(--color_dark_grey);
`;

const Container = styled.div`
  width: 100%;
  max-width: 980px;
  padding: 18px 12px 28px;
  box-sizing: border-box;
`;

const ToolbarDetail = styled(Detail)`
  gap: 10px;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-bottom: 1px solid var(--border_color_cell);
`;

const Stat = styled.div`
  min-height: 58px;
  padding: 8px 10px;
  box-sizing: border-box;
  border-right: 1px solid var(--border_color_cell);

  &:last-child {
    border-right: 0;
  }
`;

const StatLabel = styled.div`
  color: var(--color_label);
  font-size: 13px;
  line-height: 18px;
`;

const StatValue = styled.div`
  color: var(--color_accent);
  font-size: 22px;
  line-height: 28px;
  font-variant-numeric: tabular-nums;
`;

const KeyboardShell = styled.div`
  width: 100%;
  margin-top: 20px;
  padding: 14px;
  box-sizing: border-box;
  border: 1px solid var(--border_color_cell);
  background: var(--bg_control);
`;

const KeyboardSurface = styled.div`
  position: relative;
  width: 100%;
  margin: 0 auto;
`;

const EcKey = styled.div<{$pressed: boolean; $aboveThreshold: boolean}>`
  position: absolute;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 5px 6px 7px;
  overflow: hidden;
  border-radius: 5px;
  border: 1px solid
    ${(props) =>
      props.$pressed || props.$aboveThreshold
        ? 'var(--color_accent)'
        : 'var(--border_color_cell)'};
  background: ${(props) =>
    props.$pressed
      ? 'var(--color_accent)'
      : props.$aboveThreshold
        ? 'var(--bg_menu)'
        : 'var(--bg_control)'};
  color: ${(props) =>
    props.$pressed ? 'var(--color_inside-accent)' : 'var(--color_label)'};
  box-shadow:
    inset 1px 1px 0 rgb(255 255 255 / 14%),
    inset -1px -1px 0 rgb(0 0 0 / 25%);
`;

const KeyMeta = styled.div`
  font-size: 10px;
  line-height: 12px;
  white-space: nowrap;
  opacity: 0.7;
`;

const KeyValue = styled.div`
  align-self: center;
  color: inherit;
  font-size: 16px;
  line-height: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
`;

const StatusText = styled.div<{$error?: boolean}>`
  margin-top: 12px;
  color: ${(props) =>
    props.$error ? 'var(--color_accent)' : 'var(--color_label)'};
  font-size: 14px;
  line-height: 20px;
`;

const EcToolsIcon = () => <TuneIcon />;

const updateEcRow = (
  nextRow: AgarEcRow,
  setRows: React.Dispatch<React.SetStateAction<EcCellValue[][]>>,
  setKeyMasks: React.Dispatch<React.SetStateAction<number[]>>,
) => {
  setRows((currentRows) => {
    const updatedRows = currentRows.map((row) => [...row]);
    updatedRows[nextRow.row] = nextRow.values;
    return updatedRows;
  });
  setKeyMasks((currentMasks) => {
    const updatedMasks = [...currentMasks];
    updatedMasks[nextRow.row] = nextRow.keyMask;
    return updatedMasks;
  });
};

export const Pane = () => {
  const dispatch = useAppDispatch();
  const api = useAppSelector(getSelectedKeyboardAPI);
  const selectedLayoutOptions = useAppSelector(getSelectedLayoutOptions);
  const keys = useAppSelector(getSelectedKeyDefinitions) as AgarKey[];
  const [rows, setRows] = useState<EcCellValue[][]>(makeEmptyRows);
  const [keyMasks, setKeyMasks] = useState<number[]>(makeEmptyMasks);
  const [lastRow, setLastRow] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isReadingRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    [],
  );

  const selectedSensitivity = Math.min(
    Math.max(selectedLayoutOptions[EC_SENSITIVITY_LAYOUT_INDEX] ?? 0, 0),
    EC_ACTUATION_THRESHOLDS.length - 1,
  );
  const actuationThreshold =
    EC_ACTUATION_THRESHOLDS[selectedSensitivity] ?? EC_ACTUATION_THRESHOLDS[0];
  const releaseThreshold = getReleaseThreshold(selectedSensitivity);

  const sensitivityOptions = useMemo(
    () =>
      ['1(High)', '2', '3', '4', '5', '6', '7', '8(Low)'].map(
        (label, value) => ({
          label,
          value: `${value}`,
        }),
      ),
    [],
  );

  const keyboardGeometry = useMemo(() => getKeyboardGeometry(keys), [keys]);

  const readNextRow = useCallback(async () => {
    if (!api || isReadingRef.current) {
      return false;
    }

    isReadingRef.current = true;
    try {
      const nextRow = await readAgarEcRow(api);
      if (!isMountedRef.current) {
        return false;
      }
      updateEcRow(nextRow, setRows, setKeyMasks);
      setLastRow(nextRow.row);
      setLastUpdated(Date.now());
      setError(null);
      return true;
    } catch (e) {
      if (isMountedRef.current) {
        setError(e instanceof Error ? e.message : 'Failed to read EC data');
      }
      return false;
    } finally {
      isReadingRef.current = false;
    }
  }, [api]);

  useEffect(() => {
    if (!api || !isPolling) {
      return;
    }

    let cancelled = false;
    const poll = async () => {
      if (!cancelled) {
        await readNextRow();
      }
    };

    poll();
    const interval = window.setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [api, isPolling, readNextRow]);

  const refreshMatrix = useCallback(async () => {
    if (!api) {
      return;
    }

    setError(null);
    for (let i = 0; i < AGAR_EC_MATRIX_ROWS; i++) {
      await readNextRow();
    }
  }, [api, readNextRow]);

  return (
    <SpanOverflowCell>
      <ContainerPane>
        <Container>
          <ControlRow>
            <Label>EC Sensitivity</Label>
            <Detail>
              <AccentSelect
                value={sensitivityOptions[selectedSensitivity]}
                options={sensitivityOptions}
                onChange={(option: any) => {
                  if (option) {
                    dispatch(
                      updateLayoutOption(
                        EC_SENSITIVITY_LAYOUT_INDEX,
                        +option.value,
                      ),
                    );
                  }
                }}
              />
            </Detail>
          </ControlRow>

          <ControlRow>
            <Label>Live ADC</Label>
            <ToolbarDetail>
              <AccentButton onClick={() => setIsPolling((value) => !value)}>
                {isPolling ? 'Pause' : 'Resume'}
              </AccentButton>
              <AccentButton onClick={refreshMatrix}>Refresh</AccentButton>
            </ToolbarDetail>
          </ControlRow>

          <Stats>
            <Stat>
              <StatLabel>Actuation</StatLabel>
              <StatValue>{actuationThreshold}</StatValue>
            </Stat>
            <Stat>
              <StatLabel>Release</StatLabel>
              <StatValue>{releaseThreshold}</StatValue>
            </Stat>
            <Stat>
              <StatLabel>Last Row</StatLabel>
              <StatValue>{lastRow === null ? '-' : `R${lastRow}`}</StatValue>
            </Stat>
          </Stats>

          <KeyboardShell>
            <KeyboardSurface
              style={{
                aspectRatio: `${keyboardGeometry.width} / ${keyboardGeometry.height}`,
              }}
            >
              {keyboardGeometry.keys.map(
                ({id, key, left, top, width, height}) => {
                  const value = rows[key.row]?.[key.col] ?? null;
                  const pressed = Boolean(keyMasks[key.row] & (1 << key.col));
                  const aboveThreshold =
                    value !== null && value >= actuationThreshold;

                  return (
                    <EcKey
                      key={id}
                      $pressed={pressed}
                      $aboveThreshold={aboveThreshold}
                      style={{
                        left: `${left}%`,
                        top: `${top}%`,
                        width: `${width}%`,
                        height: `${height}%`,
                        transform: `rotate(${key.r || 0}deg)`,
                      }}
                    >
                      <KeyMeta>
                        R{key.row} C{key.col}
                      </KeyMeta>
                      <KeyValue>{value === null ? '-' : value}</KeyValue>
                    </EcKey>
                  );
                },
              )}
            </KeyboardSurface>
          </KeyboardShell>

          <StatusText $error={Boolean(error)}>
            {error ||
              (lastUpdated
                ? `Updated ${new Date(lastUpdated).toLocaleTimeString()}`
                : 'Waiting for EC data')}
          </StatusText>
        </Container>
      </ContainerPane>
    </SpanOverflowCell>
  );
};

export const Title = 'EC Tools';
export const Icon = EcToolsIcon;
