// Child-process audit: fail before any real network operation can execute.
import net from 'node:net';
import tls from 'node:tls';
let attempts=0;
function blocked(){attempts++;throw Error('NETWORK_FORBIDDEN_IN_CONFIG_CHECK');}
globalThis.fetch=blocked;net.Socket.prototype.connect=blocked;tls.connect=blocked;
process.once('exit',()=>console.log(JSON.stringify({event:'network_sentinel',attempts})));
