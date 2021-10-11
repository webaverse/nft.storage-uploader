// const {Readable} = require('stream');
const path = require('path');
const fs = require('fs');
// const http = require('http');
// const https = require('https');
// const {FormData, Blob} = require('formdata-node');
// const {FormDataEncoder} = require('form-data-encoder');
// const fetch = require('node-fetch');
const {NFTStorage, File, Blob} = require('nft.storage');

const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEUxRWM5YTZBMDhFN0U3YTJlRTFhN2ZhM2VGNDM1RGRCNkY4YzU1OTgiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYzMzk4OTUwNTQ2NiwibmFtZSI6IndlYmF2ZXJzZSJ9.9CV9OU-MXRszWnclPmenoXzVOMJDL9-X6reD_9MJUxs'
const client = new NFTStorage({
  token: apiKey,
});
const gatewayPrefix = `https://cloudflare-ipfs.com/ipfs/`;

const argname = process.argv[2] || '.';

(async () => {
  const stats = await new Promise((accept, reject) => {
    fs.lstat(argname, (err, stats) => {
      if (!err) {
        accept(stats);
      } else {
        reject(err);
      }
    });
  });
  if (stats.isFile()) {
    const data = fs.readFileSync(argname);
    const b = new Blob([
      data,
    ])
    const metadata = await client.storeBlob(b);
    console.log(gatewayPrefix + metadata);
    
    /* const req = https.request({
      method: 'POST',
      host: 'ipfs.webaverse.com',
      path: '/',
    }, res => {
      const bs = [];
      res.on('data', d => {
        bs.push(d);
      });
      res.on('end', () => {
        const b = Buffer.concat(bs);
        bs.length = 0;
        const s = b.toString('utf8');
        const j = JSON.parse(s);
        const {hash} = j;
        console.log(`https://ipfs.webaverse.com/ipfs/${hash}`);
        const basename = path.basename(argname);
        console.log(`https://ipfs.webaverse.com/${hash}/${basename}`);
      });
    });
    req.on('error', err => {
      throw err;
    });
    rs.pipe(req); */
  } else {
    const files = [];
    const _recurse = async p => {
      await new Promise((accept, reject) => {
        fs.readdir(p, async (err, filenames) => {
          if (!err) {
            await Promise.all(filenames.map(async filename => {
              await new Promise((accept, reject) => {
                const fullpath = path.join(p, filename);
                
                fs.lstat(fullpath, async (err, stats) => {
                  if (!err) {
                    if (stats.isFile()) {
                      const file = new File(
                        [await fs.promises.readFile(fullpath)],
                        fullpath
                      );
                      files.push(file);
                      accept();
                    } else if (stats.isDirectory()) {
                      _recurse(fullpath)
                        .then(accept, reject);
                    } else {
                      accept();
                    }
                  } else {
                    reject(err);
                  }
                });
              });
            }));
            accept();
          } else {
            reject(err);
          }
        });
      });
    };
    await _recurse(argname);
    
    
    /* const encoder = new FormDataEncoder(formData)
    const uploadFilesRes = await fetch(`https://ipfs.webaverse.com/`, {
      method: 'POST',
      headers: encoder.headers,
      body: Readable.from(encoder)
    });
    const hashes = await uploadFilesRes.json(); */
    // console.log('got ok', uploadFilesRes.ok, uploadFilesRes.status, hashes);

    const metadata = await client.storeDirectory(files);
    console.log(gatewayPrefix + metadata);

    /* const rootDirectory = hashes.find(h => h.name === '');
    // console.log('got hashes', {rootDirectory, hashes});
    const rootDirectoryHash = rootDirectory.hash;
    console.log(`https://ipfs.webaverse.com/ipfs/${rootDirectoryHash}/`); */
  }
})();

/* const metadata = await client.store({
  name: 'Pinpie',
  description: 'Pin is not delicious beef!',
  image: new File([], 'pinpie.jpg', { type: 'image/jpg' })
})
console.log(metadata.url) */