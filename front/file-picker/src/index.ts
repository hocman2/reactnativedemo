import { EventEmitter } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to FilePickerModule.web.ts
// and on native platforms to FilePickerModule.ts
import FilePickerModule from './FilePickerModule';

export interface FilePickerResult {
  uri: string;
  // Add any other properties that your native implementations might return
}

class FilePickerManager extends EventEmitter {
  async pickImage(): Promise<FilePickerResult> {
    const uri = await FilePickerModule.pickImage();
    return { uri };
  }
}

export default new FilePickerManager(FilePickerModule);
