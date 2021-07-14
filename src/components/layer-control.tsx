import * as React from 'react';
import {
  getSelectedLayerIndex,
  getNumberOfLayers
} from '../redux/modules/keymap';
import {bindActionCreators} from 'redux';
import {actions} from '../redux/modules/keymap';
import {RootState} from '../redux';
import {connect} from 'react-redux';
const styles = require('./layer-control.css');

type OwnProps = {
  showLayer: boolean;
  loaded: boolean;
};

const mapStateToProps = (state: RootState) => ({
  numberOfLayers: getNumberOfLayers(state.keymap),
  selectedLayerIndex: getSelectedLayerIndex(state.keymap)
});

const {incrementLayer, decrementLayer} = actions;
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      incrementLayer,
      decrementLayer
    },
    dispatch
  );

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

export class LayerControlComponent extends React.Component<Props> {
  get minLayer() {
    return 0;
  }

  get maxLayer() {
    return this.props.numberOfLayers - 1;
  }

  render() {
    const {
      selectedLayerIndex,
      showLayer,
      loaded,
      incrementLayer,
      decrementLayer
    } = this.props;

    return (
      <div
        className={[
          (!loaded || !showLayer) && styles.hideLayer,
          styles.layerControl
        ].join(' ')}
      >
        <button
          disabled={!showLayer}
          className={styles.button}
          onClick={decrementLayer}
        >
          ∨
        </button>
        <div className={styles.label}>Layer {selectedLayerIndex}</div>
        <button
          disabled={!showLayer}
          className={styles.button}
          onClick={incrementLayer}
        >
          ∧
        </button>
      </div>
    );
  }
}

export const LayerControl = connect(
  mapStateToProps,
  mapDispatchToProps
)(LayerControlComponent);
