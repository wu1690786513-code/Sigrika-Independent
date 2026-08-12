# 仓库开发规范
## 一、项目结构与模块划分
Firefly 是基于 Astro 7 搭建、搭配 Svelte 孤岛组件与 TypeScript 类型配置的站点项目。核心源码存放于 `src` 目录：路由页面放在 `src/pages`，页面布局文件在 `src/layouts`，可复用 UI 组件存放于 `src/components`，样式文件统一在 `src/styles`，内容素材在 `src/content`，通用工具函数在 `src/utils`，Markdown/HTML 编译插件置于 `src/plugins`。

站点配置文件拆分至 `src/config`，配套类型定义文件放在 `src/types`；能通过 `@/config` 路径导入时优先使用该别名。
- `public`：直接对外访问的静态资源
- `src/assets`：源码托管图片资源
- `docs`、`Firefly-Docs`：项目文档
- `scripts`：自动化脚本

## 二、构建、测试与开发命令
项目强制使用 `pnpm` 包管理器，`preinstall` 前置脚本会校验包管理工具。
- `pnpm dev` / `pnpm start`：启动本地 Astro 开发服务器
- `pnpm check`：执行 Astro 项目诊断检查
- `pnpm type-check`：运行 TypeScript 类型校验（仅检查、不生成编译文件 `--noEmit`）
- `pnpm format`：使用 Biome 格式化 `src` 下全部代码
- `pnpm lint`：执行 Biome 代码规范检测，并自动修复可处理问题
- `pnpm build`：批量生成图标、低质量占位图（LQIP）、Astro 生产构建产物、字体子集与 Pagefind 全站检索索引，输出至 `dist` 目录
- `pnpm preview`：本地预览打包后的生产站点
- `pnpm new-post`：一键生成内容文章模板

## 三、代码风格与命名规范
项目统一使用 Biome 做格式化与代码校验工具：缩进使用制表符，JS/TS 字符串统一双引号。
1. Astro、Svelte 组件：大驼峰命名（例：`PostCard.astro`、`Search.svelte`）
2. 配置模块：小驼峰命名，文件名以 `Config.ts` 结尾
3. 工具函数文件：语义化短横线分隔命名（例：`date-utils.ts`）
4. `src/types` 类型定义需与 `src/config` 配置文件一一对应
5. 提交代码时避免无意义、无关的格式改动

## 四、测试规范
项目未配置专用单元测试框架。提交代码前，若改动页面渲染、内容素材或静态生成资源，必须依次执行 `pnpm check`、`pnpm type-check`、`pnpm build` 校验。
若修改可视化交互界面，需通过 `pnpm dev` 或 `pnpm preview` 验证效果，并在合并请求（PR）中附上界面截图。
后续新增测试文件需和对应功能放在同一目录，以原业务文件名为测试文件基础名。

## 五、代码提交与合并请求规范
严格遵循**约定式提交（Conventional Commits）** 规范，与项目历史提交格式保持一致：`feat: 新增功能`、`fix: 修复问题`、`chore: 工程/脚本调整`。
1. 单次提交、单个合并请求仅聚焦单一需求，不混杂多类改动
2. 合并请求需包含简洁改动说明、关联对应需求工单（如有）、已执行校验命令清单；UI 界面改动附带截图
3. 大型功能、架构设计变更，需先在 Issue/讨论区沟通方案，再落地开发

## 六、安全与配置注意事项
1. 配置文件中禁止提交密钥、访问令牌、第三方服务密钥等敏感信息
2. 部署专属配置统一存放在对应平台的环境变量中
3. 提交前务必检查自动生成文件：`dist` 构建目录、`src/constants/lqips.json` 占位图配置、`src/constants/icons.ts` 图标定义，确认无冗余/错误内容

### 术语注释（便于开发对照）
1. Svelte islands：Svelte 孤岛渲染（Astro 组件隔离渲染方案）
2. LQIP：Low Quality Image Placeholders，低清晰度图片占位图
3. Pagefind：轻量静态站点全文检索工具
4. Biome：一体化代码格式化、Lint 工具（替代 ESLint+Prettier）
5. PR：Pull Request，代码合并请求
6. `--noEmit`：TS 参数，仅做类型检查，不输出 JS 编译文件
7. PascalCase / camelCase / kebab-case：大驼峰、小驼峰、短横线分隔命名法