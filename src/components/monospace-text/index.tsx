import React from 'react';
import styled from 'styled-components';
import { IconButtonContainer } from '../inputs/icon-button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconButtonTooltip } from '../inputs/tooltip';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

interface MonospaceTextProps {
  text: string;
}

const TextComponent = styled.div`
  font-family: monospace;
  position: relative;
`;

const ClipboardButtonDiv = styled.div`
  position: absolute;
  top: 0;
  right: 0;
`;

export const MonospaceText: React.FC<MonospaceTextProps> = ({ text }) => {
  return (
    <TextComponent>
      <ul>
        {text?.split('\n').map((line, i) => (
          <li key={i}>
            {line.split('').map((char, i) => {
              if (char === '\t') {
                return <>
                  <span>&nbsp;</span>
                  <span>&nbsp;</span>
                  <span>&nbsp;</span>
                  <span>&nbsp;</span>
                </>
              }
              if (char === ' ') {
                return <span>&nbsp;</span>;
              }
              return <span>{char}</span>
            })}
          </li>
        ))}
      </ul>
      <ClipboardButtonDiv>
        <IconButtonContainer onClick={() => navigator.clipboard.writeText(text)}>
          <FontAwesomeIcon
            size={'sm'}
            color="var(--color_label)"
            icon={faCopy}
          />
          <IconButtonTooltip>Copy to clipboard</IconButtonTooltip>
        </IconButtonContainer>
      </ClipboardButtonDiv>
    </TextComponent>
  )
};
