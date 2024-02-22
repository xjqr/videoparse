// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('electronAPI',{
    'getParseUrl':()=>ipcRenderer.invoke('getparseurl')

})
console.log("preload加载")