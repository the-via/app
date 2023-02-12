import {KeyColorType} from '@the-via/reader';
import {PropsWithChildren, useMemo} from 'react';
import {useAppSelector} from 'src/store/hooks';
import {getSelectedTheme} from 'src/store/settingsSlice';
import {getColors} from 'src/utils/keyboard-rendering';

export const Keycap2DTooltip: React.FC<PropsWithChildren> = (props) => {
  const styles = useMemo(
    () => ({
      containerStyles: {
        position: 'absolute',
        left: '50%',
        transformOrigin: 'left',
        transition: 'all 0.1s ease-in-out',
        top: 0,
        marginTop: -40,
        zIndex: 4,
        pointerEvents: 'none',
        filter: 'drop-shadow(0px 0px 1px white)',
      },
      contentStyles: {
        padding: '5px 8px',
        borderRadius: 10,
        background: 'var(--color_accent)',
        color: 'var(--color_inside-accent)',
        fontFamily:
          "'Fira Sans Condensed', Helvetica, Helvetica Neue, Arial, serif",
        fontSize: 16,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textTransform: 'uppercase',
        zIndex: 5,
        transform: 'translateX(-50%)',
      },
      pointerStyles: {
        borderStyle: 'solid',
        borderColor: 'transparent',
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
        borderTop: `6px solid var(--color_accent)`,
        position: 'absolute',
        marginLeft: -6,
        width: 0,
      },
    }),
    [],
  );
  return (
    <Tooltip
      {...props}
      containerStyles={styles.containerStyles}
      contentStyles={styles.contentStyles}
      pointerStyles={styles.pointerStyles}
    />
  );
};

export const KeycapTooltip: React.FC<any> = (props) => {
  const styles = useMemo(
    () => ({
      containerStyles: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        marginTop: -800,
      },
      contentStyles: {
        padding: '70px 70px',
        background: 'var(--color_accent)',
        color: 'var(--color_inside-accent)',
        borderRadius: 100,
        fontSize: 200,
        fontFamily: "'Fira Sans', Helvetica, Helvetica Neue, Arial, serif",
        whiteSpace: 'nowrap',
        letterSpacing: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontWeight: 'bold',
      },
      pointerStyles: {
        height: 150,
        width: 150,
        marginTop: -100,
        transform: 'rotate(45deg)',
        background: 'var(--color_accent)',
      },
    }),
    [],
  );
  return (
    <Tooltip
      {...props}
      containerStyles={styles.containerStyles}
      contentStyles={styles.contentStyles}
      pointerStyles={styles.pointerStyles}
    />
  );
};

export const CategoryMenuTooltip: React.FC<any> = (props) => {
  const styles = useMemo(
    () => ({
      containerStyles: {
        position: 'absolute',
        top: 45,
        left: 0,
        transformOrigin: 'left',
        transition: 'all 0.1s ease-in-out',
        marginTop: 0,
        zIndex: 4,
        pointerEvents: 'none',
      },
      contentStyles: {
        padding: '5px 10px',
        borderRadius: 10,
        background: 'var(--color_accent)',
        color: 'var(--color_inside-accent)',
        fontFamily:
          "'Fira Sans Condensed', Helvetica, Helvetica Neue, Arial, serif",
        fontSize: 18,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textTransform: 'uppercase',
        zIndex: 5,
        transform: 'translateX(-50%)',
        marginLeft: 18,
      },
      pointerStyles: {
        borderStyle: 'solid',
        borderColor: 'transparent',
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
        borderBottom: `6px solid var(--color_accent)`,
        position: 'absolute',
        marginLeft: 15,
        marginTop: -41,
        width: 0,
      },
    }),
    [],
  );
  return (
    <Tooltip
      {...props}
      containerStyles={styles.containerStyles}
      contentStyles={styles.contentStyles}
      pointerStyles={styles.pointerStyles}
    />
  );
};
export const ProgressBarTooltip: React.FC<any> = (props) => {
  const styles = useMemo(
    () => ({
      containerStyles: {
        position: 'absolute',
        left: '50%',
        transformOrigin: 'left',
        transition: 'all 0.1s ease-in-out',
        top: 0,
        marginTop: -40,
        zIndex: 4,
        pointerEvents: 'none',
      },
      contentStyles: {
        padding: '5px 10px',
        borderRadius: 10,
        background: 'var(--color_inside-accent)',
        color: 'var(--color_accent)',
        fontFamily:
          "'Fira Sans Condensed', Helvetica, Helvetica Neue, Arial, serif",
        fontSize: 18,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textTransform: 'uppercase',
        zIndex: 5,
        transform: 'translateX(-50%)',
      },
      pointerStyles: {
        borderStyle: 'solid',
        borderColor: 'transparent',
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
        borderTop: `6px solid var(--color_inside-accent)`,
        position: 'absolute',
        marginLeft: -6,
        width: 0,
      },
    }),
    [],
  );
  return (
    <Tooltip
      {...props}
      containerStyles={styles.containerStyles}
      contentStyles={styles.contentStyles}
      pointerStyles={styles.pointerStyles}
    />
  );
};
export const IconButtonTooltip: React.FC<any> = (props) => {
  const styles = useMemo(
    () => ({
      containerStyles: {
        position: 'absolute',
        top: 50,
        left: 0,
        transformOrigin: 'left',
        transition: 'all 0.1s ease-in-out',
        marginTop: 0,
        zIndex: 4,
        pointerEvents: 'none',
      },
      contentStyles: {
        padding: '5px 10px',
        borderRadius: 10,
        background: 'var(--color_inside-accent)',
        color: 'var(--color_accent)',
        fontFamily:
          "'Fira Sans Condensed', Helvetica, Helvetica Neue, Arial, serif",
        fontSize: 18,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textTransform: 'uppercase',
        zIndex: 5,
        transform: 'translateX(-50%)',
        marginLeft: 18,
      },
      pointerStyles: {
        borderStyle: 'solid',
        borderColor: 'transparent',
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
        borderBottom: `6px solid var(--color_inside-accent)`,
        position: 'absolute',
        marginLeft: 15,
        marginTop: -41,
        width: 0,
      },
    }),
    [],
  );
  return (
    <Tooltip
      {...props}
      containerStyles={styles.containerStyles}
      contentStyles={styles.contentStyles}
      pointerStyles={styles.pointerStyles}
    />
  );
};

export const MenuTooltip: React.FC<any> = (props) => {
  const styles = useMemo(
    () => ({
      containerStyles: {
        position: 'absolute',
        top: 0,
        left: 45,
        transformOrigin: 'left',
        transition: 'all 0.1s ease-in-out',
        marginTop: -5,
        zIndex: 4,
        pointerEvents: 'none',
      },
      contentStyles: {
        padding: '5px 5px',
        background: 'var(--color_inside-accent)',
        color: 'var(--color_accent)',
        borderRadius: 10,
        fontFamily:
          "'Fira Sans Condensed', Helvetica, Helvetica Neue, Arial, serif",
        fontWeight: 400,
        whiteSpace: 'nowrap',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
      },
      pointerStyles: {
        borderStyle: 'solid',
        borderColor: 'transparent',
        borderTop: '6px solid transparent',
        borderBottom: '6px solid transparent',
        borderRight: `6px solid var(--color_inside-accent)`,
        position: 'absolute',
        marginLeft: -9,
        marginTop: -21,
        width: 0,
      },
    }),
    [],
  );
  return (
    <Tooltip
      {...props}
      containerStyles={styles.containerStyles}
      contentStyles={styles.contentStyles}
      pointerStyles={styles.pointerStyles}
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
