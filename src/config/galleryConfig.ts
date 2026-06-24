import type { GalleryConfig } from "@/types/galleryConfig";

// 相册配置
export const galleryConfig: GalleryConfig = {
	// 相册列表
	albums: [
		// 支持jpg/png/webp/avif/gif格式
		// id: 相册唯一标识符（用于目录命名和URL路径），比如设置：id: "firefly-2026", 对应 public/gallery/firefly-2026/目录
		// cover: 手动指定封面图（可选，不填会把cover.*文件作为封面图，如果没有cover.*文件，则使用第一张图片作为封面图）
		// name: 相册名称
		// description: 相册描述
		// location: 相册拍摄地点
		// date: 相册日期，格式为 YYYY-MM-DD，用于排序和显示
		// tags: 相册标签，用于分类和过滤
		// password: 访问密码，设置后需要输入密码才能查看相册内容（可选）
		// passwordHint: 密码提示，设置后在输入密码错误时显示（可选，需配合password使用）
		// 每添加一个数组项就相当于添加了一个相册，记得在 public/gallery/ 目录下创建对应的子目录并放入图片
		// {
		// 	id: "firefly-2026",
		// 	name: "可爱流萤",
		// 	description: "飞萤之火自无梦的长夜亮起，绽放在终竟的明天。",
		// 	location: "崩坏：星穹铁道",
		// 	date: "2026-01-01",
		// 	tags: ["崩坏星穹铁道", "流萤"],
		// },
		// {
		// 	id: "encrypted-test",
		// 	name: "加密相册示例",
		// 	description:
		// 		"这是一个加密相册的示例，设置了访问密码，只有输入正确的密码才能查看相册内容。",
		// 	location: "崩坏：星穹铁道",
		// 	date: "2026-02-01",
		// 	tags: ["加密相册", "示例"],
		// 	password: "123456",
		// 	passwordHint: "示例密码123456",
		// },
		{
			id: "mw-allin",
			name: "宝宝们",
			description: "博爱党狂喜,但是钱包👛不嘻嘻了",
			location: "杭州市 上城区",
			date: "2026-05-05",
			tags: ["鸣潮"],
		},
		{
			id: "mc-fll-mhww",
			name: "弗糯糯",
			description: "弗糯糯你看你脸圆的",
			location: "杭州市 上城区",
			date: "2026-06-13",
			tags: ["鸣潮","弗洛洛"],
		},
		{
			id: "mc-kfc-chun",
			name: "鸣潮-KFC",
			description: "二次元的钱真好赚😭",
			location: "杭州市 滨江区",
			date: "2026-01-23",
			tags: ["鸣潮"],
		},
		{
			id: "mc-zgsdbwg",
			name: "鸣潮X中国湿地博物馆",
			description: "萌萌的耙耙柑🍊",
			location: "杭州市 西湖区",
			date: "2026-04-06",
			tags: ["鸣潮","西格莉卡"],
		},
		{
			id: "sigrika-pass",
			name: "小太阳西西",
			description: "萌萌的耙耙柑🍊",
			location: "杭州市 上城区",
			date: "2026-05-21",
			tags: ["鸣潮","西格莉卡"],
		},
		// 轻音少女
		{
			id: "qysn-mhww",
			name: "轻音棉花娃娃全图鉴",
			description: "轻音永不毕业🎓！！！",
			location: "杭州市 滨江区",
			date: "2026-03-16",
			tags: ["轻音少女"],
		},
		{
			id: "hangzhou-music-anime-only-3-0",
			name: "杭州音乐番ONLY3.0",
			description: "线下氛围真好~",
			location: "杭州市 临平区",
			date: "2025-08-16",
			tags: ["轻音少女"],
		},
		// 弗洛洛
		{
			id: "mc-fll-lsg",
			name: "弗洛洛(老鼠干版)",
			description: "即使变成老鼠干还是那么忧郁",
			location: "杭州市 上城区",
			date: "2026-05-30",
			tags: ["鸣潮","弗洛洛"],
		},
			{
			id: "mc-fll-sys",
			name: "弗洛洛X三月兽",
			description: "索拉里斯最忧郁之人",
			location: "杭州市 上城区 三月兽(in77C2区B1)",
			date: "2026-05-30",
			tags: ["鸣潮","弗洛洛"],
		},
		// 多元IP
		{
			id: "yzk-www",
			name: "缘之空X乌丸屋",
			description: "等身穹妹！",
			location: "杭州市 工联CC B1乌丸屋",
			date: "2026-04-08",
			tags: ["多元IP"],
		},
		{
			id: "wxw-qkl",
			name: "我心危XMeiji巧克力",
			description: "巧克力很甜，番剧更加甜",
			location: "杭州市 滨江区",
			date: "2026-01-30",
			tags: ["多元IP"],
		},
		{
			id: "dog",
			name: "变脸",
			description: "我等过很久，我不会再等了",
			location: "杭州市 滨江区",
			date: "2026-06-02",
			password: "dog",
			passwordHint: "我是什么？",
			tags: ["鸣潮"],
		},
	],

	// 瀑布流最小列宽(px)，浏览器根据容器宽度自动计算列数，默认 240
	// 值越小列数越多，值越大列数越少
	// 你猜猜会不会同步
	columnWidth: 240,
};
