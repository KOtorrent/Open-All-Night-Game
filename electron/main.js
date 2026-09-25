// Portable Windows playtest shell for OPEN ALL NIGHT. Hosts the existing production Vite build
// (copied into ./dist alongside this file at packaging time - see scripts/package-playtest-win64.sh)
// inside a desktop window via a tiny built-in static file server, rather than loading the built
// index.html directly over file:// - PlayCanvas's asset loader uses fetch()/XHR for glTF/texture
// files, and Chromium's CORS rules block fetch() of sibling file:// resources, which would break
// every model/texture load. Serving from http://127.0.0.1 avoids that entirely and needs no
// external dependency beyond Electron itself and Node's own core http/fs modules.
const { app, BrowserWindow, Menu } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.bin': 'application/octet-stream',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.ico': 'image/x-icon'
};

// A fixed port, not an OS-assigned random one (`.listen(0, ...)`), is required here: the page's
// origin is "http://127.0.0.1:<port>", and localStorage - which is how this game's own save data
// persists - is scoped per origin. A random port every launch would put each session's save under
// a different origin, silently discarding it on relaunch even though the same on-disk profile
// directory is reused. Caught by an explicit two-launch persistence test against the packaged
// build before shipping, not assumed. If this port is somehow already taken (another instance
// already running, or a leftover process from a crash), fall back to an OS-assigned port with a
// clear one-time warning - better a working game with no persistence that session than a game that
// won't start at all.
const FIXED_PORT = 47821;

function startLocalServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let reqPath = decodeURIComponent((req.url || '/').split('?')[0]);
      if (reqPath === '/') reqPath = '/index.html';
      const filePath = path.normalize(path.join(DIST_DIR, reqPath));
      // Refuse to serve anything outside the built dist/ folder.
      if (!filePath.startsWith(DIST_DIR)) {
        res.writeHead(403);
        res.end();
        return;
      }
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not found');
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });
    let fellBack = false;
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE' && !fellBack) {
        fellBack = true;
        console.warn(
          `Port ${FIXED_PORT} is already in use - falling back to a random port. ` +
          'Save data from a previous session on this machine will not be visible this run.'
        );
        server.listen(0, '127.0.0.1');
        return;
      }
      reject(err);
    });
    server.on('listening', () => {
      const address = server.address();
      resolve(typeof address === 'object' && address ? address.port : 0);
    });
    server.listen(FIXED_PORT, '127.0.0.1');
  });
}

let mainWindow = null;

async function createWindow() {
  const port = await startLocalServer();
  // Normal player boot has zero query params. --dev on the command line (see
  // OPEN_ALL_NIGHT_DEV.bat) is the only way to get ?dev=1's time-jump/dev-tools panel - never on
  // by default.
  const isDev = process.argv.includes('--dev');

  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    center: true,
    backgroundColor: '#050505',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  // No File/Edit/View menu bar - this is a playtest build, not a dev shell, and a menu bar eats
  // into the pointer-lock game view for no benefit here.
  Menu.setApplicationMenu(null);

  // F11 toggles fullscreen. The game itself has no in-page fullscreen toggle (confirmed by
  // searching src/ before building this) and the brief explicitly said not to build a new
  // settings system just for this playtest - this is a few lines in the Electron shell, not a
  // change to the game, and gives players a normal "press F11 for fullscreen" option on top of
  // the window's own native maximize button.
  mainWindow.webContents.on('before-input-event', (_event, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });

  const query = isDev ? '?dev=1' : '';
  await mainWindow.loadURL(`http://127.0.0.1:${port}/${query}`);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
