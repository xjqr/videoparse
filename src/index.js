const { app, BrowserWindow,Menu,ipcMain} = require('electron');
const path = require('path');
const {log}= require('./logs');

const windowStateKeeper = require('electron-window-state');
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}
let video_source ="https://v.qq.com/";
let video_parse_url = "";
const createWindow = () => {
  // Create the browser window.
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800,
    path: path.join(path.dirname(__dirname),'userData')
  });
  let mainWindow = new BrowserWindow({
    x:mainWindowState.x,
    y:mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    title:'视频解析',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),  
      userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'    
    },
    show:false
  });
  log.info(`mainWindowId:${mainWindow.id}`)
  mainWindowState.manage(mainWindow);
  // and load the index.html of the app.
  // mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.loadURL(video_source,{userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'});
  //mainWindow.loadFile(path.join(__dirname,'youkuplayer.html'));
  //https://z1.m1907.top?jx=https://v.youku.com/v_nextstage/id_dfda9a2ca4114ac29277.html?spm=a2hja.14919748_WEBHOME_NEW.drawer2.d_zj1_2&s=dfda9a2ca4114ac29277&scm=20140719.rcmd.35027.show_dfda9a2ca4114ac29277

  mainWindow.webContents.on('did-finish-load',(e)=>{
    mainWindow.show();
    mainWindow.setTitle('腾讯视频解析');
    
  })
  mainWindow.webContents.setWindowOpenHandler((d) => {
    // console.log(d.url)
    // log.info(d.url);
    let parse_url ="";
    if(d.url.startsWith('https://v.qq.com/x/cover') || d.url.startsWith('https://www.mgtv.com/b')){
      parse_url=`https://jx.m3u8.tv/jiexi/?url=${d.url}`;
    }
    else if(d.url.startsWith('https://v.youku.com/v_nextstage')){
      parse_url = `https://z1.m1907.top/?jx=${d.url}`;

    }
    // else if (d.url.startsWith('https://www.mgtv.com')){
    //   return {action:'deny'};
    // }
    else{
      parse_url=d.url;
    }
    log.info(parse_url);
    video_parse_url = parse_url;
    if(BrowserWindow.getAllWindows().length>1){
      let last_win = BrowserWindow.getAllWindows()[0]
      //last_win.loadURL(parse_url,{userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'})
      last_win.loadFile(path.join(__dirname,'player.html'),{userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'});
      last_win.webContents.on('did-finish-load',(e)=>{
        last_win.show();
      })
      last_win.maximize();
      last_win.focus()
      return {action:'deny'};
    }
    let new_win = new BrowserWindow({
      width: 800,
      height: 600,
      title:'视频解析',
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
      },
      show:false
    });
    new_win.setMenu(null);
    //console.log(`childrenWindowId:${new_win.id}`);
    log.info(`childrenWindowId:${new_win.id}`);
    //new_win.loadURL(parse_url,{userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'})
    new_win.loadFile(path.join(__dirname,'player.html'),{userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'});
    new_win.webContents.on('did-finish-load',(e)=>{
      new_win.show();
      new_win.focus();
      //new_win.webContents.openDevTools();
    });
    new_win.webContents.addListener('context-menu',(e,p)=>{
      e.preventDefault();
      let rightMenu = Menu.buildFromTemplate([
        {
          label:"刷新",
          role:'reload',
        },
        {
          label:"复制",
          role:'copy',
          accelerator:'ctrl+c',
        },
        {
          label:"粘贴",
          role:"paste",
          accelerator:'ctrl+v',
        },
        {
          label:"全选",
          role:"selectAll",
          accelerator:'ctrl+a',
        }
    ]);
      rightMenu.popup({window:new_win});
    })
    new_win.maximize();
    return {action:'deny'};

  })
  mainWindow.webContents.addListener('context-menu',(e,p)=>{
    e.preventDefault();
    let rightMenu = Menu.buildFromTemplate([
      {
        label:"刷新",
        role:'reload',
      },
      {
        label:"复制",
        role:'copy',
        accelerator:'ctrl+c',
      },
      {
        label:"粘贴",
        role:"paste",
        accelerator:'ctrl+v',
      },
      {
        label:"全选",
        role:"selectAll",
        accelerator:'ctrl+a',
      }
  ]);
    rightMenu.popup({window:mainWindow});
  })
  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
  const isMac = process.platform === 'darwin'
  const template = [
    // { role: 'appMenu' }
    ...(isMac
      ? [{
          label: app.name,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
          ]
        }]
      : []),
    // { role: 'fileMenu' }
    {
      label: '首页',
      click:()=>{
        mainWindow.loadURL(video_source);
      } 
    },
    {
      label:'刷新',
      role:'reload'
    },
    {
      label:"上一页",
      click:()=>{
        let focusewindow= BrowserWindow.getFocusedWindow();
        if(focusewindow){
          focusewindow.webContents.goBack();
        }
      }
    },
    {
      label:"下一页",
      click:()=>{
        let focusewindow= BrowserWindow.getFocusedWindow();
        if(focusewindow){
          focusewindow.webContents.goForward();
        }        
      }
    },
    {
      label:'切换视频源',
      submenu: [
        {
          label:'腾讯视频',
          click:async()=>{
            video_source = "https://v.qq.com/";
            await mainWindow.loadURL(video_source,{userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'});
          }
        },
        {
          label:'优酷视频',
          click:async()=>{

            video_source = "https://www.youku.com/";
            await mainWindow.loadURL(video_source,{userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'});
          }
        },
        // {
        //   label:'爱奇艺视频',
        //   click:async()=>{
        //     video_source = "https://www.iqiyi.com/";
        //     await mainWindow.loadURL(video_source,{userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'});
        //   }
        // },
        {
          label:'芒果TV',
          click:async()=>{
            video_source = "https://www.mgtv.com/show/";
            await mainWindow.loadURL(video_source,{userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'});
          }
        }

      ]
    },
    {
      label: '关于',
      click: async()=>{
        let about_win = new BrowserWindow({
          width: 500,
          height: 400,
          title:'关于',
          webPreferences: {
            //preload: path.join(__dirname, 'preload.js'),
          },
        });
        about_win.setMenu(null);
        console.log(path.join(__dirname,'src/about.html'))
        await about_win.loadFile(path.join(__dirname,'about.html'));
        
      }
    }
  ]
  
  const menu = Menu.buildFromTemplate(template)
  mainWindow.setMenu(menu)
  //mainWindow.webContents.openDevTools()
  // Menu.setApplicationMenu(menu)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', ()=>{
  ipcMain.handle('getparseurl',()=>video_parse_url);
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here
