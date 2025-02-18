export interface IElectronAPI {
  openExternal: (url: string) => Promise<void>;
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}
