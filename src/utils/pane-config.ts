import ConfigurePane from '../components/panes/configure';
import DebugPane from '../components/panes/debug';
import DesignPane from '../components/panes/design';
import SettingsPane from '../components/panes/settings';
import TestPane from '../components/panes/test';

export default [
  {
    key: 'default',
    component: ConfigurePane,
    title: 'Configure',
    path: '/'
  },
  {
    key: 'test',
    component: TestPane,
    path: '/test',
    title: 'Key Tester'
  },
  {
    key: 'design',
    component: DesignPane,
    path: '/design',
    title: 'Design'
  },
  {
    key: 'settings',
    component: SettingsPane,
    path: '/settings',
    title: 'Settings'
  },
  {
    key: 'debug',
    component: DebugPane,
    path: '/debug',
    title: 'Debug'
  }
];
