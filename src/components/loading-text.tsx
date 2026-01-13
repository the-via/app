import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

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
  const {t} = useTranslation();
  return (
    <LoadingText data-tid="loading-message">
      {t(props.isSearching ? LoadingLabel.Searching : LoadingLabel.Loading)}
    </LoadingText>
  );
}
