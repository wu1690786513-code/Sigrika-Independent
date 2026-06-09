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

/**
 * 构建标题到 slug 的映射表
 */
function buildTitleToSlugMap(contentDir) {
	const titleToSlugMap = new Map();

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
					// 优先使用 UTF-8 编码读取
					let content = fs.readFileSync(fullPath, "utf-8");
					let titleMatch = content.match(/^title:\s*([^\n]+)$/m);
					
					// 如果 UTF-8 读取不到 title（可能是 GBK 编码），尝试 GBK 编码
					if (!titleMatch) {
						try {
							content = fs.readFileSync(fullPath, "gbk");
							titleMatch = content.match(/^title:\s*([^\n]+)$/m);
						} catch {
							// GBK 也失败，保持使用 UTF-8 内容
						}
					}
					
					const slugMatch = content.match(/^slug:\s*([^\n]*)$/m);

					if (titleMatch && titleMatch[1]) {
						const title = titleMatch[1].trim();
						// 跳过无效的标题（如空标题或仅包含分隔符）
						if (!title || title === "---" || title.trim().length === 0) {
							continue;
						}
						
						let slug = null;
						if (slugMatch && slugMatch[1]) {
							slug = slugMatch[1].trim();
							// 如果 slug 为空或为无效值，则使用文件路径
							if (!slug || slug === "---" || slug.trim().length === 0) {
								slug = null;
							}
						}
						
						if (!slug) {
							// 如果没有 slug，使用文件在 posts 目录下的相对路径（转换为小写）
							const relativePath = path.relative(contentDir, fullPath);
							slug = removeFileExtension(relativePath).replace(/\\/g, "/").toLowerCase();
						}
						
						// 确保 slug 不为空且不为无效值
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
	
	// 调试日志：打印映射表中的所有条目
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
 */
function parseWikilinks(text) {
	const wikilinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
	const matches = [];

	let match;
	while ((match = wikilinkRegex.exec(text)) !== null) {
		matches.push({
			title: match[1].trim(),
			displayText: match[2]?.trim(),
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
				const { title, displayText, fullMatch, index: matchStart } = match;
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
					const url = getPostUrlBySlug(slug);

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