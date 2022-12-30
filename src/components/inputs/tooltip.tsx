import {KeyColorType} from '@the-via/reader';
import {useMemo} from 'react';
import {useAppSelector} from 'src/store/hooks';
import {getSelectedTheme} from 'src/store/settingsSlice';
import {getColors} from 'src/utils/keyboard-rendering';

export const KeycapTooltip: React.FC<any> = (props) => {
  const containerStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    marginTop: -800,
  };
  const contentStyles = {
    padding: '70px 70px',
    background: 'var(--color_accent)',
    color: 'var(--color_inside-accent)',
    borderRadius: 100,
    fontSize: 200,
    fontFamily: 'Source Code Pro',
    whiteSpace: 'nowrap',
    letterSpacing: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
  };
  const pointerStyles = {
    height: 150,
    width: 150,
    marginTop: -100,
    transform: 'rotate(45deg)',
    background: 'var(--color_accent)',
  };
  return (
    <Tooltip
      {...props}
      containerStyles={containerStyles}
      contentStyles={contentStyles}
      pointerStyles={pointerStyles}
    />
  );
};

export const CategoryMenuTooltip: React.FC<any> = (props) => {
  const accent = useMemo(() => getColors({color: KeyColorType.Accent}), []);
  const containerStyles = {
    position: 'absolute',
    top: 45,
    left: 0,
    transformOrigin: 'left',
    transition: 'all 0.1s ease-in-out',
    marginTop: 0,
    zIndex: 4,
    pointerEvents: 'none',
  };
  const contentStyles = {
    padding: '5px 10px',
    borderRadius: 10,
    background: 'var(--color_accent)',
    color: 'var(--color_inside-accent)',
    fontFamily: "'Source Sans Pro', Helvetica, Helvetica Neue, Arial, serif",
    fontSize: 18,
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textTransform: 'uppercase',
    zIndex: 5,
    transform: 'translateX(-50%)',
    marginLeft: 18,
  };
  const pointerStyles = {
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderBottom: `6px solid var(--color_accent)`,
    position: 'absolute',
    marginLeft: 15,
    marginTop: -42,
    width: 0,
  };
  return (
    <Tooltip
      {...props}
      containerStyles={containerStyles}
      contentStyles={contentStyles}
      pointerStyles={pointerStyles}
    />
  );
};

export const MenuTooltip: React.FC<any> = (props) => {
  const accent = useMemo(() => getColors({color: KeyColorType.Accent}), []);
  const containerStyles = {
    position: 'absolute',
    top: 0,
    left: 45,
    transformOrigin: 'left',
    transition: 'all 0.1s ease-in-out',
    marginTop: -5,
    zIndex: 4,
    pointerEvents: 'none',
  };
  const contentStyles = {
    padding: '5px 5px',
    background: 'var(--color_inside-accent)',
    color: 'var(--color_accent)',
    borderRadius: 10,
    fontFamily: 'Source Code Pro',
    whiteSpace: 'nowrap',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  };
  const pointerStyles = {
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderTop: '6px solid transparent',
    borderBottom: '6px solid transparent',
    borderRight: `6px solid var(--color_inside-accent)`,
    position: 'absolute',
    marginLeft: -9,
    marginTop: -21,
    width: 0,
  };
  return (
    <Tooltip
      {...props}
      containerStyles={containerStyles}
      contentStyles={contentStyles}
      pointerStyles={pointerStyles}
    />
  );
};

export const Tooltip: React.FC<any> = (props) => {
  const {containerStyles, contentStyles, pointerStyles} = props;
  return (
    <div style={containerStyles} className={'tooltip'}>
      <div style={contentStyles}>{props.children}</div>
      <div style={pointerStyles}></div>
    </div>
  );
};
