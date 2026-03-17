const https = require('https');
const fs = require('fs');
const path = require('path');

const LOGO_URL = 'https://files.catbox.moe/k8yobw.png';
const ICONS_DIR = path.join(__dirname, 'public', 'icons');

// Create icons directory
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Download the logo
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
  
  console.log('Downloading logo...');
  const logoPath = path.join(ICONS_DIR, 'original.png');
  await downloadFile(LOGO_URL, logoPath);
  console.log('Logo downloaded!');
  
  // Copy the original as all sizes (proper resizing needs sharp/canvas, 
  // but for PWA the browser will handle scaling)
  for (const size of sizes) {
    const dest = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
    fs.copyFileSync(logoPath, dest);
    console.log(`Created icon-${size}x${size}.png`);
  }
  
  console.log('\nAll icons created! For production, use a proper image resizer.');
  console.log('You can use https://www.pwabuilder.com/imageGenerator for optimized icons.');
}

main().catch(console.error);
