// Bluetooth Service for SmartAttendance
// This provides a simulation layer for web preview
// In the Capacitor native build, this will use actual Bluetooth APIs

export interface BluetoothDevice {
  name: string;
  id: string;
  connected: boolean;
}

// Simulated Bluetooth state for web preview
let simulatedBluetoothEnabled = false;
let simulatedConnectedDevice: BluetoothDevice | null = null;

// Check if we're in a native Capacitor environment
export const isNativeEnvironment = (): boolean => {
  return typeof (window as any).Capacitor !== 'undefined';
};

// Enable Bluetooth
export const enableBluetooth = async (): Promise<boolean> => {
  if (isNativeEnvironment()) {
    // In native environment, this would use Capacitor Bluetooth plugin
    // For now, we'll simulate success
    console.log('Native: Enabling Bluetooth...');
    return true;
  }
  
  // Web simulation
  simulatedBluetoothEnabled = true;
  return true;
};

// Check if Bluetooth is enabled
export const isBluetoothEnabled = async (): Promise<boolean> => {
  if (isNativeEnvironment()) {
    // In native environment, check actual Bluetooth status
    return true;
  }
  
  return simulatedBluetoothEnabled;
};

// Scan for nearby devices
export const scanForDevices = async (targetDeviceName: string): Promise<BluetoothDevice | null> => {
  if (isNativeEnvironment()) {
    // In native environment, this would scan for actual Bluetooth devices
    console.log('Native: Scanning for device:', targetDeviceName);
    // Simulate finding the device after a delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      name: targetDeviceName,
      id: crypto.randomUUID(),
      connected: false,
    };
  }
  
  // Web simulation - always "find" the device for demo purposes
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate a 90% success rate for demo
  const success = Math.random() > 0.1;
  
  if (success) {
    const device: BluetoothDevice = {
      name: targetDeviceName,
      id: crypto.randomUUID(),
      connected: false,
    };
    return device;
  }
  
  return null;
};

// Connect to a device
export const connectToDevice = async (device: BluetoothDevice): Promise<boolean> => {
  if (isNativeEnvironment()) {
    // In native environment, establish actual Bluetooth connection
    console.log('Native: Connecting to device:', device.name);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  }
  
  // Web simulation
  await new Promise(resolve => setTimeout(resolve, 800));
  
  simulatedConnectedDevice = { ...device, connected: true };
  return true;
};

// Disconnect from current device
export const disconnectDevice = async (): Promise<void> => {
  if (isNativeEnvironment()) {
    console.log('Native: Disconnecting from device');
  }
  
  simulatedConnectedDevice = null;
};

// Get currently connected device
export const getConnectedDevice = (): BluetoothDevice | null => {
  return simulatedConnectedDevice;
};

// Verify proximity to teacher's device
export const verifyProximity = async (teacherDeviceName: string): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    // Check if Bluetooth is enabled
    const bluetoothOn = await isBluetoothEnabled();
    if (!bluetoothOn) {
      return {
        success: false,
        message: 'Please turn on Bluetooth to mark attendance',
      };
    }
    
    // Scan for the teacher's device
    const device = await scanForDevices(teacherDeviceName);
    if (!device) {
      return {
        success: false,
        message: 'Teacher\'s device not found. Make sure you are in the classroom.',
      };
    }
    
    // Connect to the device
    const connected = await connectToDevice(device);
    if (!connected) {
      return {
        success: false,
        message: 'Could not connect to teacher\'s device. Please try again.',
      };
    }
    
    return {
      success: true,
      message: 'Bluetooth verification successful',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Bluetooth verification failed. Please try again.',
    };
  }
};
