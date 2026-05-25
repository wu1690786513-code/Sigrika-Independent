const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO_URL = 'https://github.com/wu1690786513-code/Blog-Posts-Sync.git';
const TEMP_DIR = path.join(__dirname, '..', '.temp-posts');
const TARGET_DIR = path.join(__dirname, '..', 'src', 'content', 'posts');

// 清理临时目录
if (fs.existsSync(TEMP_DIR)) {
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });
}

// 浅克隆文章仓库（只拉最新，速度最快）
console.log('📥 Fetching posts from Blog-Posts-Sync...');
execSync(`git clone --depth 1 ${REPO_URL} ${TEMP_DIR}`, { stdio: 'inherit' });

// 同步文章目录
const sourceDir = path.join(TEMP_DIR, 'src', 'content', 'posts');
if (!fs.existsSync(sourceDir)) {
  console.error('❌ Source posts directory not found!');
  process.exit(1);
}

// 清空旧文章并复制新文章
if (fs.existsSync(TARGET_DIR)) {
  fs.rmSync(TARGET_DIR, { recursive: true, force: true });
}
fs.cpSync(sourceDir, TARGET_DIR, { recursive: true });

// 清理临时目录
fs.rmSync(TEMP_DIR, { recursive: true, force: true });
console.log('✅ Posts synced successfully!');
