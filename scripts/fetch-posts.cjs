const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USER = 'wu1690786513-code';

let REPO_URL;
if (TOKEN) {
  // 修正为 用户名:Token 标准格式
  REPO_URL = `https://${GITHUB_USER}:${TOKEN}@github.com/wu1690786513-code/Blog-Posts-Sync.git`;
} else {
  REPO_URL = 'https://github.com/wu1690786513-code/Blog-Posts-Sync.git';
}

const TEMP_DIR = path.join(__dirname, '..', '.temp-posts');
const TARGET_DIR = path.join(__dirname, '..', 'src', 'content', 'posts', '同步文章2');

if (fs.existsSync(TEMP_DIR)) {
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });
}

console.log('📥 Fetching posts from Blog-Posts-Sync...');
try {
  execSync(`git clone --depth 1 ${REPO_URL} ${TEMP_DIR}`, { stdio: 'inherit' });
} catch (err) {
  console.error('克隆失败：', err.message);
  process.exit(1);
}

if (fs.existsSync(TARGET_DIR)) {
  fs.rmSync(TARGET_DIR, { recursive: true, force: true });
}
fs.mkdirSync(TARGET_DIR, { recursive: true });

function copyDir(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.name.startsWith('.') || entry.name === 'scripts' || entry.name === '00_其他') continue;
    
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
console.log('✅ Posts synced to src/content/posts/同步文章2/（已跳过 00_其他 目录）');