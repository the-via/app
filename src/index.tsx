import '@webscopeio/react-textarea-autocomplete/style.css';
import React from 'react';
import {render} from 'react-dom';
import Root from './containers/Root';
import {ApplicationInsights} from '@microsoft/applicationinsights-web';

const appInsights = new ApplicationInsights({
  config: {
    instrumentationKey: 'b3c046b8-137c-47f3-b28d-9049abfa9fe8',
    /* ...Other Configuration Options... */
  },
});
appInsights.loadAppInsights();
appInsights.trackPageView(); // Manually call trackPageView to establish the current user/session/pageview

render(<Root />, document.getElementById('root'));
