// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, shell } = require('electron');

// Expose any APIs you want to make available to your React app here
contextBridge.exposeInMainWorld('electron', {
  openExternal: (url) => shell.openExternal(url),
});
