const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.GITHUB_TOKEN;
const REPO_URL = TOKEN 
  ? `https://${TOKEN}@github.com/wu1690786513-code/Blog-Posts-Sync.git`
  : 'https://github.com/wu1690786513-code/Blog-Posts-Sync.git';
const TEMP_DIR = path.join(__dirname, '..', '.temp-posts');
const TARGET_DIR = path.join(__dirname, '..', 'src', 'content', 'posts', '同步文章');

if (fs.existsSync(TEMP_DIR)) {
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });
}

console.log('📥 Fetching posts from Blog-Posts-Sync...');
execSync(`git clone --depth 1 ${REPO_URL} ${TEMP_DIR}`, { stdio: 'inherit' });

if (fs.existsSync(TARGET_DIR)) {
  fs.rmSync(TARGET_DIR, { recursive: true, force: true });
}
fs.mkdirSync(TARGET_DIR, { recursive: true });

function copyDir(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.name.startsWith('.') || entry.name === 'scripts') continue;
    
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(TEMP_DIR, TARGET_DIR);
fs.rmSync(TEMP_DIR, { recursive: true, force: true });
console.log('✅ Posts synced to src/content/posts/同步文章/');