// Renders one minimap thumbnail per track from the built game and saves src/thumbs.png.
// Usage: node tools/mkthumbs.mjs docs   (then run build.sh again to copy it into docs/)
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
const root=process.argv[2] || 'docs';
const types={'.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json'};
const srv=http.createServer((q,res)=>{const p=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!fs.existsSync(p)||fs.statSync(p).isDirectory()){res.writeHead(404);return res.end()}res.writeHead(200,{'Content-Type':types[path.extname(p)]||'application/octet-stream'});fs.createReadStream(p).pipe(res)}).listen(8125);
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const pg=await b.newPage({viewport:{width:1100,height:620}});
pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.addInitScript(() => { try { localStorage.setItem('pixelprix.q', '0'); } catch(e){} });
await pg.goto('http://localhost:8125/index.html');
await pg.waitForFunction("window.__pp && window.__pp.screen && window.__pp.screen !== 'loading'",null,{timeout:300000});
const url=await pg.evaluate(()=>window.__pp.makeThumbs(160));
fs.writeFileSync('src/thumbs.png', Buffer.from(url.split(',')[1],'base64'));
console.log('thumbs', fs.statSync('src/thumbs.png').size);
await b.close(); srv.close();
