import {
	LinkPreset,
	type NavBarConfig,
	type NavBarLink,
	type NavBarSearchConfig,
	NavBarSearchMethod,
} from "../types/config";
import { siteConfig } from "./siteConfig";

// LinkPreset 到实际链接对象的映射
const linkPresets: Record<LinkPreset, NavBarLink> = {
	[LinkPreset.Home]: {
		name: "首页",
		url: "/",
		icon: "material-symbols:home",
	},
	[LinkPreset.Archive]: {
		name: "归档",
		url: "/archive/",
		icon: "material-symbols:archive",
	},
	[LinkPreset.About]: {
		name: "关于",
		url: "/about/",
		icon: "material-symbols:info",
	},
	[LinkPreset.Friends]: {
		name: "友链",
		url: "/friends/",
		icon: "material-symbols:group",
		pageKey: "friends",
	},
	[LinkPreset.Sponsor]: {
		name: "赞助",
		url: "/sponsor/",
		icon: "material-symbols:coffee",
		pageKey: "sponsor",
	},
	[LinkPreset.Guestbook]: {
		name: "留言板",
		url: "/guestbook/",
		icon: "material-symbols:chat",
		pageKey: "guestbook",
	},
	[LinkPreset.Bangumi]: {
		name: "番剧",
		url: "/bangumi/",
		icon: "material-symbols:movie",
		pageKey: "bangumi",
	},
	[LinkPreset.Gallery]: {
		name: "相册",
		url: "/gallery/",
		icon: "material-symbols:photo-library",
		pageKey: "gallery",
	},
	[LinkPreset.Tags]: {
		name: "标签",
		url: "/tags/",
		icon: "material-symbols:tag",
	},
	[LinkPreset.Categories]: {
		name: "分类",
		url: "/categories/",
		icon: "material-symbols:folder-open",
	},
	[LinkPreset.Moments]: {
		name: "说说",
		url: "/moments/",
		icon: "mdi:wechat",
	},
};

// 将 LinkPreset 或 NavBarLink 转换为 NavBarLink
function resolveLink(link: NavBarLink | LinkPreset): NavBarLink {
	if (typeof link === "number") {
		return linkPresets[link];
	}
	return link;
}

// 根据页面开关动态生成导航栏配置
const getDynamicNavBarConfig = (): NavBarConfig => {
	// 基础导航栏链接
	const links: (NavBarLink | LinkPreset)[] = [
		// 主页
		LinkPreset.Home,
	];

	// 文章及其子菜单
	links.push({
		name: "文章",
		url: "/post/",
		icon: "material-symbols:article-rounded",
		children: [
			// 归档
			LinkPreset.Archive,
			// 分类
			LinkPreset.Categories,
			// 标签
			LinkPreset.Tags,
		],
	});

	// 我的及其子菜单
	links.push({
		name: "我的",
		url: "/gallery/",
		icon: "material-symbols:person",
		children: [
			{
				name: "漫展",
				url: "/comic-events/",
				icon: "material-symbols:festival",
			},
			{
				name: "相册",
				url: "/gallery/",
				icon: "material-symbols:photo-library",
			},
			{
				name: "番剧",
				url: "/anime/",
				icon: "material-symbols:movie",
			},
			// 说说
			// LinkPreset.Moments,
			{
				name: "动态",
				url: "/dynamic/",
				icon: "material-symbols:forum-rounded",
			}
		],
	});

	// 根据配置决定是否添加友链，在siteConfig关闭pages.friends时导航栏不显示友链

	
	links.push(LinkPreset.Friends);
	// 根据配置决定是否添加留言板，在siteConfig关闭pages.guestbook时导航栏不显示留言板
		// links.push({
		// 	name: "图谱",
		// 	url: "/graph/",
		// 	icon: "material-symbols:hub",
		// });
	// 放到关于中
	// if (siteConfig.pages.guestbook) {
	// 	links.push(LinkPreset.Guestbook);
	// }


	// links.push({
	// 	name: "我的",
	// 	url: "/my/",
	// 	icon: "material-symbols:person",
	// 	children: [
	// 		// 根据配置决定是否添加相册，在siteConfig关闭pages.gallery时导航栏不显示相册
	// 		...(siteConfig.pages.gallery ? [LinkPreset.Gallery] : []),

	// 		// 根据配置决定是否添加番组计划，在siteConfig关闭pages.bangumi时导航栏不显示番组计划
	// 		...(siteConfig.pages.bangumi ? [LinkPreset.Bangumi] : []),
	// 	],
	// });

	// if (siteConfig.pages.friends) {
	// 	links.push(LinkPreset.Friends);
	// }
	// 关于及其子菜单
	links.push({
		name: "关于",
		url: "/content/",
		icon: "material-symbols:info",
		children: [
			// 根据配置决定是否添加赞助，在siteConfig关闭pages.sponsor时导航栏不显示赞助
			...(siteConfig.pages.sponsor ? [LinkPreset.Sponsor] : []),
				
			// 关于页面
			LinkPreset.About,
			
			{
			name: "留言板",
			url: "/guestbook/",
			icon: "material-symbols:chat",
			},
			{
			name: "朋友们",
			url: "/friends/",
			icon: "material-symbols:group",
			},
		],
	});

	// 自定义导航栏链接,并且支持多级菜单
	// links.push({
	// 	name: "链接",
	// 	url: "/links/",
	// 	icon: "material-symbols:link",

	// 	// 子菜单
	// 	children: [
	// 		{
	// 			name: "GitHub",
	// 			url: "https://github.com/CuteLeaf/Firefly",
	// 			external: true,
	// 			icon: "fa7-brands:github",
	// 		},
	// 		{
	// 			name: "Gitee",
	// 			url: "https://gitee.com/CuteLeaf/Firefly",
	// 			external: true,
	// 			icon: "fa7-brands:gitee",
	// 		},
	// 		{
	// 			name: "QQ交流群",
	// 			url: "https://qm.qq.com/q/ZGsFa8qX2G",
	// 			external: true,
	// 			icon: "fa7-brands:qq",
	// 		},
	// 	],
	// });

		// 递归解析所有的 LinkPreset 为 NavBarLink
	function resolveLinks(links: (NavBarLink | LinkPreset)[]): NavBarLink[] {
		return links.map((link) => {
			const resolved = resolveLink(link);
			if (resolved.children) {
				return {
					...resolved,
					children: resolveLinks(resolved.children),
				};
			}
			return resolved;
		});
	}

	// 仅返回链接，其它导航搜索相关配置在模块顶层常量中独立导出
	return { links: resolveLinks(links) } as NavBarConfig;
};

// 导航搜索配置
export const navBarSearchConfig: NavBarSearchConfig = {
	method: NavBarSearchMethod.PageFind,
};

// ============================================================================
// 链接预设 - 可自由自定义导航栏链接的名称、图标和URL
// Link Presets - Allows free customization of the name, icon, and URL of navigation bar links
// ============================================================================
export const LinkPresets: Record<string, NavBarLink> = {
	Home: {
		name: "主页",
		url: "/",
		icon: "material-symbols:home",
	},
	Dynamic: {
		name: "动态",
		url: "/dynamic/",
		icon: "material-symbols:forum-rounded",
		pageKey: "dynamic",
	},
	Archive: {
		name: "归档",
		url: "/archive/",
		icon: "material-symbols:archive",
	},
	Categories: {
		name: "分类",
		url: "/categories/",
		icon: "material-symbols:folder-open-rounded",
	},
	Tags: {
		name: "标签",
		url: "/tags/",
		icon: "material-symbols:tag-rounded",
	},
	Friends: {
		name: "友链",
		url: "/friends/",
		icon: "material-symbols:link-2-rounded",
		pageKey: "friends",
	},
	Sponsor: {
		name: "打赏",
		url: "/sponsor/",
		icon: "material-symbols:favorite",
		pageKey: "sponsor",
	},
	Guestbook: {
		name: "留言",
		url: "/guestbook/",
		icon: "material-symbols:chat",
		pageKey: "guestbook",
	},
	About: {
		name: "关于我",
		url: "/about/",
		icon: "material-symbols:person",
	},
	Bangumi: {
		name: "番组计划",
		url: "/bangumi/",
		icon: "material-symbols:movie",
		pageKey: "bangumi",
	},
	Gallery: {
		name: "相册",
		url: "/gallery/",
		icon: "material-symbols:photo-library",
		pageKey: "gallery",
	},
	Anime: {
		name: "追番",
		url: "/anime/",
		icon: "material-symbols:live-tv",
		pageKey: "anime",
	},
};

export const navBarConfig: NavBarConfig = getDynamicNavBarConfig();
