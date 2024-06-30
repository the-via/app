import { MonospaceText } from 'src/components/monospace-text';
import { DeviceInfo } from 'src/types/types';

const LinuxHidrawFix = (deviceInfo: DeviceInfo): () => JSX.Element => {
  const textUdev = `SUBSYSTEM=="usb", ATTR{idVendor}=="${deviceInfo.vendorId.toString(16).toUpperCase().padStart(4, '0')}", ATTR{idProduct}=="${deviceInfo.productId.toString(16).toUpperCase().padStart(4, '0')}", TAG+="uaccess""
KERNEL=="hidraw*", MODE="0660", TAG+="uaccess", TAG+="udev-acl"`

  const textDevHidraw = `#!/bin/bash
HID_NAME='${deviceInfo.productName}'
# loop over possible devices
for f in /dev/hidraw*
do
	DEVICE_NAME=$(basename \${f})
	if grep "$HID_NAME" "/sys/class/hidraw/\${DEVICE_NAME}/device/uevent";
	then
		# device matches product name
		echo Running sudo chmod a+rw "$f"
		sudo chmod a+rw "$f"
	fi
done`;

  const textRunDevHidrawScript = `bash script.sh`;

  return () => (
    <div>
      <p>This error can happen on Linux when the browser is not allowed to access the keyboard HID device. You can fix this either permanently or temporarily.</p>
      <p>Create udev rule to fix it permanently. To do this, create a file called</p>
      {/* Rule has to precede /usr/lib/udev/rules.d/73-seat-late.rules, see https://wiki.archlinux.org/title/Udev#Allowing_regular_users_to_use_devices */}
      <MonospaceText text="/etc/udev/rules.d/50-qmk.rules" />
      <p>with the following content:</p>
      <MonospaceText text={textUdev} />
      <p>Unplug and plug your keyboard back in. Reload this website and it should work.</p>
      <p>If you want to temporarily allow the browser access to the keyboard device, create a script with the following content:</p>
      <MonospaceText text={textDevHidraw} />
      <p>And run it:</p>
      <MonospaceText text={textRunDevHidrawScript} />
      <p>Reload this website and it should work.</p>
    </div>
  )
};

export function getUserFixForError(e: any, deviceInfo: DeviceInfo): [boolean, () => JSX.Element | undefined] {
  if (e instanceof DOMException) {
    if (e.name === 'NotAllowedError' && e.message.includes('Failed to open the device')) {
      return [true, LinuxHidrawFix(deviceInfo)];
    }
  }
  return [false, () => undefined];
}
