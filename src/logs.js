const path = require('path');
const log = require('electron-log');
log.transports.file.maxSize=50*1024*1025;
log.transports.file.resolvePathFn=()=>path.join(path.dirname(__dirname),'log/run.log');
log.transports.file.level='info';
log.initialize();
module.exports={
    'log':log
}