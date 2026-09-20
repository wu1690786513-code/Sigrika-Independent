import { visit } from "unist-util-visit";
import fs from "fs";
import path from "path";

/**
 * 移除文件扩展名（.md, .mdx, .markdown）
 */
function removeFileExtension(id) {
	return id.replace(/\.(md|mdx|markdown)$/i, "");
}

/**
 * 生成文章 URL（使用相对路径）
 */
function getPostUrlBySlug(slug) {
	const slugWithoutExt = removeFileExtension(slug);
	return `/posts/${slugWithoutExt}/`;
}

// 缓存映射表和上次扫描时间
let cachedTitleToSlugMap = null;
let cachedContentDir = null;
let lastScanTime = 0;
const CACHE_TTL = 30000; // 缓存有效期 30 秒

/**
 * 构建标题到 slug 的映射表（带缓存）
 */
function buildTitleToSlugMap(contentDir) {
	// 检查缓存是否有效
	const now = Date.now();
	if (
		cachedTitleToSlugMap &&
		cachedContentDir === contentDir &&
		now - lastScanTime < CACHE_TTL
	) {
		return cachedTitleToSlugMap;
	}

	const titleToSlugMap = new Map();
	let fileCount = 0;

	function scanDirectory(dir) {
		try {
			const entries = fs.readdirSync(dir, { withFileTypes: true });

			for (const entry of entries) {
				const fullPath = path.join(dir, entry.name);

				if (entry.isDirectory()) {
					if (
						entry.name.startsWith("_") ||
						entry.name.startsWith(".") ||
						entry.name === "Template"
					) {
						continue;
					}
					scanDirectory(fullPath);
					continue;
				}

				if (
					!entry.isFile() ||
					!/\.(md|mdx)$/i.test(entry.name)
				) {
					continue;
				}

				try {
					fileCount++;
					
					// 优先使用 UTF-8 编码读取（带有 BOM 支持）
					let content = fs.readFileSync(fullPath, "utf-8");
					
					// 移除 BOM（如果存在）
					if (content.charCodeAt(0) === 0xFEFF) {
						content = content.slice(1);
					}
					
					// 匹配标题，支持中英文冒号
					let titleMatch = content.match(/^title\s*[：:]\s*([^\n]+)$/m);
					
					// 如果没有找到，尝试更宽松的匹配（可能有缩进或空格）
					if (!titleMatch) {
						titleMatch = content.match(/title\s*[：:]\s*([^\n]+)/i);
					}
					
					// 如果 UTF-8 读取不到 title（可能是 GBK 编码），尝试 GBK 编码
					if (!titleMatch) {
						try {
							content = fs.readFileSync(fullPath, "gbk");
							// 移除 BOM（如果存在）
							if (content.charCodeAt(0) === 0xFEFF) {
								content = content.slice(1);
							}
							titleMatch = content.match(/^title\s*[：:]\s*([^\n]+)$/m);
							if (!titleMatch) {
								titleMatch = content.match(/title\s*[：:]\s*([^\n]+)/i);
							}
						} catch {
							// GBK 也失败，保持使用 UTF-8 内容
						}
					}
					
					const slugMatch = content.match(/^slug:\s*([^\n]*)$/m);

					if (titleMatch && titleMatch[1]) {
						const title = titleMatch[1].trim();
						if (!title || title === "---" || title.trim().length === 0) {
							continue;
						}
						
						let slug = null;
						if (slugMatch && slugMatch[1]) {
							slug = slugMatch[1].trim();
							if (!slug || slug === "---" || slug.trim().length === 0) {
								slug = null;
							}
						}
						
						if (!slug) {
							const relativePath = path.relative(contentDir, fullPath);
							slug = removeFileExtension(relativePath).replace(/\\/g, "/").toLowerCase();
						}
						
						if (slug && slug !== "---" && slug.trim().length > 0) {
							titleToSlugMap.set(title.toLowerCase(), slug);
						}
					}
				} catch (error) {
					console.warn(`[remark-wikilinks] 警告: 无法读取文件 ${fullPath}`, error.message);
				}
			}
		} catch (error) {
			console.warn(`[remark-wikilinks] 警告: 无法扫描目录 ${dir}`, error.message);
		}
	}

	scanDirectory(contentDir);
	
	// 更新缓存
	cachedTitleToSlugMap = titleToSlugMap;
	cachedContentDir = contentDir;
	lastScanTime = now;
	
	console.log(`[remark-wikilinks] 扫描完成: ${fileCount} 篇文章, 构建了 ${titleToSlugMap.size} 个映射`);
	
	if (process.env.DEBUG_WIKILINKS) {
		console.log("[remark-wikilinks] 调试: 标题到 slug 映射表:");
		for (const [title, slug] of titleToSlugMap.entries()) {
			console.log(`  "${title}" -> "${slug}"`);
		}
	}
	
	return titleToSlugMap;
}

/**
 * 解析 wikilink 语法
 * 支持格式：
 * - [[文章标题]]
 * - [[文章标题|显示文本]]
 * - [[文章标题#锚点]]
 * - [[文章标题#锚点|显示文本]]
 */
function parseWikilinks(text) {
	const wikilinkRegex = /\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g;
	const matches = [];

	let match;
	while ((match = wikilinkRegex.exec(text)) !== null) {
		matches.push({
			title: match[1].trim(),           // 文章标题
			anchor: match[2]?.trim(),        // 锚点（可选）
			displayText: match[3]?.trim(),   // 显示文本（可选）
			fullMatch: match[0],
			index: match.index,
		});
	}

	return matches;
}

/**
 * Obsidian 双链链接 remark 插件
 * 支持 [[文章标题]] 和 [[文章标题|显示文本]] 语法
 */
export function remarkWikilinks(options = {}) {
	const {
		contentDir = "./src/content/posts",
	} = options;

	const titleToSlugMap = buildTitleToSlugMap(contentDir);
	
	return (tree, { data }) => {
		visit(tree, "text", (node, index, parent) => {
			if (!node.value) return;

			const text = node.value;
			const matches = parseWikilinks(text);
			
			if (matches.length === 0) return;
			
			const newNodes = [];
			let lastIndex = 0;

			for (const match of matches) {
				const { title, anchor, displayText, fullMatch, index: matchStart } = match;
				const matchEnd = matchStart + fullMatch.length;

				if (matchStart > lastIndex) {
					newNodes.push({
						type: "text",
						value: text.slice(lastIndex, matchStart),
					});
				}

				const slug = titleToSlugMap.get(title.toLowerCase());

				if (slug) {
					const linkText = displayText ? displayText : title;
					let url = getPostUrlBySlug(slug);
					
					// 如果有锚点，添加到 URL 后面（需要编码）
					if (anchor) {
						url += "#" + encodeURIComponent(anchor);
					}

					newNodes.push({
						type: "link",
						url: url,
						children: [
							{
								type: "text",
								value: linkText,
							},
						],
					});
				} else {
					newNodes.push({
						type: "text",
						value: fullMatch,
					});
				}

				lastIndex = matchEnd;
			}

			if (lastIndex < text.length) {
				newNodes.push({
					type: "text",
					value: text.slice(lastIndex),
				});
			}

			parent.children.splice(index, 1, ...newNodes);
		});
	};
}