import * as React from 'react';
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

const KeyInput = styled(KeycodeTextInput)`
  width: 64px;
  margin-right: 8px;
`;

type Props = {
  title: string;
  encoderIdx: number;
  behaviors: number[];
  onChange: (encoderIdx: number, behavior: number, newValue: number) => void;
};

export class EncoderCustomConfig extends React.Component<Props> {
  handleInputChange = (newValue: number, behaviorIdx: number) => {
    const {encoderIdx, onChange} = this.props;
    onChange(encoderIdx, behaviorIdx, newValue);
  };

  render() {
    const {
      title,
      behaviors: [cw, ccw, press]
    } = this.props;
    return (
      <RowDiv>
        <LabelText>{title}</LabelText>
        <KeyInput
          defaultValue={cw}
          onBlur={newValue => this.handleInputChange(newValue, 0)}
        />
        <KeyInput
          defaultValue={ccw}
          onBlur={newValue => this.handleInputChange(newValue, 1)}
        />
        <KeyInput
          defaultValue={press}
          onBlur={newValue => this.handleInputChange(newValue, 2)}
        />
      </RowDiv>
    );
  }
}

export default EncoderCustomConfig;
