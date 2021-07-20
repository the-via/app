export const HID = {
  requestDevices: async () => {
    await navigator.hid.requestDevice({
      filters: [
        {
          usagePage: 0xff60,
          usage: 0x61,
        },
      ],
    });
  },
  devices: async () => {
    const devices = await navigator.hid.getDevices();
    return devices;
  },
  HID: class HID {},
};
