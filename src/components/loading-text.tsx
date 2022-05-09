import React from 'react';

enum LoadingLabel {
  Searching = 'Searching for devices…',
  Loading = 'Loading…'
}

type Props = {
  isSearching: boolean;
};

export default function (props: Props) {
  return (
    <div className="text-xl font-medium text-text" data-tid="loading-message">
      {props.isSearching ? LoadingLabel.Searching : LoadingLabel.Loading}
    </div>
  );
}
