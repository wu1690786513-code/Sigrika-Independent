import type { FriendLink, FriendsPageConfig } from "../types/config";

// 可以在src/content/spec/friends.md中编写友链页面下方的自定义内容

// 友链页面配置
export const friendsPageConfig: FriendsPageConfig = {
	// 页面标题，如果留空则使用 i18n 中的翻译
	title: "",

	// 页面描述文本，如果留空则使用 i18n 中的翻译
	description: "",

	// 是否显示底部自定义内容（friends.mdx 中的内容）
	showCustomContent: true,

	// 是否显示评论区，需要先在commentConfig.ts启用评论系统
	showComment: true,

	// 是否开启随机排序配置，如果开启，就会忽略权重，构建时进行一次随机排序
	randomizeSort: false,
};

// 友链配置
// 配置友链-标记
export const friendsConfig: FriendLink[] = [
	{
		title: "夏夜流萤",
		imgurl:
			"https://weavatar.com/avatar/d252655d40d6874417a720bad0a6c5f77f8f6a1fd2f882f8f338402dc37e4190?s=640",
		desc: "飞萤之火自无梦的长夜亮起，绽放在终竟的明天。",
		siteurl: "https://blog.cuteleaf.cn",
		tags: ["Blogs"],
		weight: 10, // 权重，数字越大排序越靠前
		enabled: true, // 是否启用
	},
	// {
	// 	title: "Firefly Docs",
	// 	imgurl: "https://docs-firefly.cuteleaf.cn/logo.png",
	// 	desc: "Firefly主题模板文档",
	// 	siteurl: "https://docs-firefly.cuteleaf.cn",
	// 	tags: ["Docs"],
	// 	weight: 9,
	// 	enabled: true,
	// },
	// {
	// 	title: "Astro",
	// 	imgurl: "https://avatars.githubusercontent.com/u/44914786?v=4&s=640",
	// 	desc: "The web framework for content-driven websites. ⭐️ Star to support our work!",
	// 	siteurl: "https://github.com/withastro/astro",
	// 	tags: ["Framework"],
	// 	weight: 8,
	// 	enabled: true,
	// },
	{
		title: "Nachecko",
		imgurl: "https://avatars.githubusercontent.com/u/172878250",
		desc: "Nacheckoの小窝",
		siteurl: "https://tbmiao.dpdns.org/",
		tags: ["Blogs"],
		weight: 8,
		enabled: true,
	},

	{
		title: "番茄主理人",
		imgurl: "https://q1.qlogo.cn/g?b=qq&nk=20447289&s=640",
		desc: "坐而言不如起而行.",
		siteurl: "https://fqzlr.com/",
		tags: ["Blogs"],
		weight: 8,
		enabled: true,
	},
		{
		title: "MmzMing的博客",
		imgurl: "https://tblog.mmzhiku.xyz/_astro/MyLogoSvg.qdF32ni__1liR9E.webp",
		desc: "菲比啾比",
		siteurl: "https://tblog.mmzhiku.xyz/",
		tags: ["Blogs"],
		weight: 8,
		enabled: true,
	},
	{
		title: "团子和蛋糕",
		imgurl: "https://re.tsh520.cn/zl/tx.webp",
		desc: "如果你喜欢那么欢迎来到我的世界！",
		siteurl: "https://blog.tsh520.cn/",
		tags: ["Blogs"],
		weight: 8,
		enabled: true,
	},
	{
		title: "AnKode",
		imgurl: "https://blog.anxko.cn/logo.webp",
		desc: "欢迎你！来自远方的朋友 ₍˄·͈༝·͈˄*₎◞ ̑̑",
		siteurl: "https://blog.anxko.cn",
		tags: ["Blogs"],
		weight: 8,
		enabled: true,
	},
	// {
	// 	title: "小曹同学",
	// 	imgurl: "https://pic.caotx.cn/home/friends/avatars_0_myweb.webp",
	// 	desc: "春祺夏安 秋绥冬禧",
	// 	siteurl: "https://blog.caotx.cn/",
	// 	tags: ["Blogs"],
	// 	weight: 8,
	// 	enabled: true,
	// },
];

// 获取启用的友链并进行排序
export const getEnabledFriends = (): FriendLink[] => {
	const friends = friendsConfig.filter((friend) => friend.enabled);

	if (friendsPageConfig.randomizeSort) {
		return friends.sort(() => Math.random() - 0.5);
	}

	return friends.sort((a, b) => b.weight - a.weight);
};
