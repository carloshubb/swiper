import { DeviceTypes } from "../enums/device-type.enum";

export interface IDeviceIdentity {
  deviceInfo: string;
  fingerPrintId: string;
  deviceType: DeviceTypes;
}
