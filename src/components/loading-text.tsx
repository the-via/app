import React from 'react';
import styled from 'styled-components';

const LoadingText = styled.div`
  font-size: 30px;
  color: var(--color_label-highlighted);
`;

enum LoadingLabel {
  Searching = 'Searching for devices...',
  Loading = 'Loading...',
}

type Props = {
  isSearching: boolean;
};

export default function (props: Props) {
  return (
    <LoadingText data-tid="loading-message">
      {props.isSearching ? LoadingLabel.Searching : LoadingLabel.Loading}
    </LoadingText>
  );
}
