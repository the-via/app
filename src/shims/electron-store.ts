export class ElectronStore {
    constructor(props: any) {
        this.props = props.defaults;
    }
    get(key: string) {
        return this.props[key];
    }
    set(key: string) {
        this.props[key] = arguments[1];
    }
}