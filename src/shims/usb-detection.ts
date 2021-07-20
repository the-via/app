type USBMonitorEvent = "remove" | "change";
export class usbDetect {
    static _listeners: {change: Function[],remove: Function[]} = {change: [], remove: []};
    static shouldMonitor = false;
    static hasMonitored = false;
    static startMonitoring() {
        console.log('start monitoring');
        this.shouldMonitor =true;   
        if (!this.hasMonitored) {
            navigator.hid.addEventListener('connect', usbDetect.onConnect);
            navigator.hid.addEventListener('disconnect', usbDetect.onDisconnect);
        }
    }
    static stopMonitoring() {
        this.shouldMonitor =false;   
    }
    private static onConnect() {
        if (this.shouldMonitor) {
            this._listeners.change.forEach(f => f());
        }
    }
    private static onDisconnect() {
        if (this.shouldMonitor) {
            this._listeners.change.forEach(f => f());
            this._listeners.remove.forEach(f => f());
        }
    }
    static on(eventName: USBMonitorEvent, cb: () => void) {
        this._listeners[eventName] = [...this._listeners[eventName], cb] ;
    }
    static off(eventName: USBMonitorEvent, cb: () => void) {
        this._listeners[eventName] = this._listeners[eventName].filter(f => f !== cb);
    }
};