import { EventEmitter } from 'expo-modules-core';
import FilePickerModule from './FilePickerModule';

const eventEmitter = new EventEmitter({});

export default {
  async pickImage(): Promise<string> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            resolve(dataUrl);
          };
          reader.onerror = (e) => {
            reject(new Error('Failed to read file'));
          };
          reader.readAsDataURL(file);
        } else {
          reject(new Error('No file selected'));
        }
      };
      input.click();
    });
  },

  // Add any additional methods here

  addListener(eventName: string, listener: (...args: any[]) => void) {
    return eventEmitter.addListener(eventName, listener);
  },
};
