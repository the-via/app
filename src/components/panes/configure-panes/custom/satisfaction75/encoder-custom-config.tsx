import React from 'react';
import {getBasicKeyToByte} from 'src/store/definitionsSlice';
import {useAppSelector} from 'src/store/hooks';
import styled from 'styled-components';
import KeycodeTextInput from '../../../../inputs/keycode-text-input';

const RowDiv = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 4px;
`;

const LabelText = styled.span`
  font-weight: 650;
  margin-right: 8px;
  width: 80px;
`;

const KeyInput = styled(KeycodeTextInput as any)`
  width: 64px;
  margin-right: 8px;
`;

type Props = {
  title: string;
  encoderIdx: number;
  behaviors: number[];
  onChange: (encoderIdx: number, behavior: number, newValue: number) => void;
};

export const EncoderCustomConfig = (props: Props) => {
  const {
    encoderIdx,
    onChange,
    title,
    behaviors: [cw, ccw, press],
  } = props;
  const {basicKeyToByte, byteToKey} = useAppSelector(getBasicKeyToByte);
  const handleInputChange = (newValue: number, behaviorIdx: number) => {
    onChange(encoderIdx, behaviorIdx, newValue);
  };

  return (
    <RowDiv>
      <LabelText>{title}</LabelText>
      <KeyInput
        defaultValue={cw}
        basicKeyToByte={basicKeyToByte}
        byteToKey={byteToKey}
        onBlur={(newValue: any) => handleInputChange(newValue, 0)}
      />
      <KeyInput
        defaultValue={ccw}
        basicKeyToByte={basicKeyToByte}
        byteToKey={byteToKey}
        onBlur={(newValue: any) => handleInputChange(newValue, 1)}
      />
      <KeyInput
        defaultValue={press}
        basicKeyToByte={basicKeyToByte}
        byteToKey={byteToKey}
        onBlur={(newValue: any) => handleInputChange(newValue, 2)}
      />
    </RowDiv>
  );
};

export default EncoderCustomConfig;
