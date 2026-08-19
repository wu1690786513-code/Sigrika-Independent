export interface ComicEvent {
  name: string;           // 漫展名称(必选)
  startDate: string;      // 开始日期 YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss（必选）
  endDate?: string;       // 结束日期 YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss（可选）
  goingDate?: string;     // 计划去的日期 YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss（可选，默认开始日期）
  location: string;       // 地点(必选)
  city?: string;          // 城市（可选，用于筛选，如"杭州"、"上海"）
  preSalePrice?: string;  // 预售价格（可选）
  onSitePrice?: string;   // 现场价格（可选）
  priceText?: string;     // 自定义价格文本（可选，推荐优先使用）
  poster?: string;        // 海报图片URL（可选，默认使用defaultComicPoster）
  url?: string;           // 官网链接（可选）
  onGoingText?: string;   // 当天进行中的文本（可选，默认"主包正在逛展位"）
  passedText?: string;    // 已过去的文本（可选，默认"已经过去了{days}"，支持{days}占位符显示天数）-1
}

// 排序方式配置
export type SortOrder = 'futureFirst' | 'passedFirst';

export interface ComicEventConfig {
  sortOrder: SortOrder;   // 排序顺序：'futureFirst'（即将举行在前）| 'passedFirst'（已结束在前）
  passedCount?: number;   // 已结束漫展展示数量（可选，默认3）
  futureCount?: number;   // 即将到来漫展展示数量（可选，默认3）
}

// 漫展展示顺序配置
export const comicEventConfig: ComicEventConfig = {
  sortOrder: 'futureFirst',  // 默认即将举行的放在前面
  passedCount: 3,            // 默认展示3个已结束的漫展
  futureCount: 3,            // 默认展示3个即将到来的漫展
};

// 默认海报图片
export const defaultComicPoster = 'https://upload.codexing.top/Blogs/study.webp';

export const comicEvents: ComicEvent[] = [
  {
    name: '鸣潮 · 巡回演唱会',
    startDate: '2026-07-16 19:00:00',
    endDate: '2026-07-18 19:00:00',
    goingDate: '2026-07-18 19:00:00',
    location: '上海 · 浦发银行东方体育中心',
    city: '上海',
    priceText: 'S档1280元 | A档1180元 | B档980元 | C档880元 | D档680元 | E档480元 | F档380元',
    poster: 'https://upload.codexing.top/Sigrika/26/06/20260625165551103.webp',
    url: 'https://www.xiaohongshu.com/explore/6a34afdb000000001502478d?xsec_token=ABCrX6Q1EwGuexqnclW6Vn80j3Emd-627f-kVY0t-vKe4=&xsec_source=pc_user',
    onGoingText: '主包正在逛展中...',
    passedText: '什么?已经过去 {days}天了!',
  },
  {
    name: '飞行雪绒应援企划',
    startDate: '2026-02-07 10:00:00',
    endDate: '2026-02-08',
    goingDate: '2026-02-07 10:00:00',
    location: '杭州 · in77西子廊桥大屏',
    city: '杭州',
    priceText: '免费',
    poster: 'https://upload.codexing.top/Sigrika/26/06/20260619231517110.webp',
    url: 'https://www.xiaohongshu.com/discovery/item/69831fe40000000022031487?source=webshare&xhsshare=pc_web&xsec_token=ABYotRluvOOPY9v-0beRvkk5iqUzWhvxxviqKDhSpTL9g=&xsec_source=pc_share',
    onGoingText: '主包正在逛展中...',
    passedText: '什么?已经{days}天了!',
  },
  {
    name: '杭州CP32同人展',
    startDate: '2026-05-01 09:00:00',
    endDate: '2026-05-05',
    goingDate: '2026-05-01 09:00:00',
    location: '杭州 · 大会展中心',
    city: '杭州',
    priceText: '普票108元 | vip票118元',
    poster: 'https://upload.codexing.top/Sigrika/26/06/20260625214441806.webp',
    url: 'https://www.xiaohongshu.com/discovery/item/69e790ea000000001a021807?source=webshare&xhsshare=pc_web&xsec_token=ABeykF9o51N4rP2Vi9bDMr_bt7dpaU9x4rSNQRjRIcLPM=&xsec_source=pc_share',
    onGoingText: '主包正在逛展中...',
    passedText: '好想回到{days}天前',
  },
  {
    name: '杭州国际动漫节',
    startDate: '2026-06-15 09:00:00',
    endDate: '2026-06-19',
    goingDate: '2026-06-19 09:00:00',
    location: '杭州 · 白马湖会展中心',
    city: '杭州',
    priceText: '工作日50元 | 现场70元',
    poster: 'https://upload.codexing.top/Sigrika/26/06/20260618225309923.webp',
    url: 'https://www.cicaf.com',
    onGoingText: '主包正在逛展中...',
    passedText: '已经过去了{days}天',
  },
  {
    name: '上海Bilibili World',
    startDate: '2026-07-10 09:00:00',
    endDate: '2026-07-12',
    goingDate: '2026-07-11 09:00:00',
    location: '上海 · 国家会展中心',
    city: '上海',
    poster: 'https://upload.codexing.top/Sigrika/26/06/20260618192812362.webp',
    url: 'https://bw.bilibili.com/',
    priceText: '游园票128元 | IP典藏票328元 | VIP票588元',
    passedText: '已经过去了{days}天',
  },
  {
    name: '上海 · 轻音少女ONLY3.0',
    poster: 'https://upload.codexing.top/Sigrika/26/06/20260625214232132.webp',
    url: 'https://www.xiaohongshu.com/discovery/item/6a34e7ff000000002103d88b?source=webshare&xhsshare=pc_web&xsec_token=ABuCz8HuDGjpPAFZ9TFzlsXV-8Ku6QClnKo6hFdWb_0nA=&xsec_source=pc_share',
    location: '上海 · 交运智慧湾科创园25号楼',
    city: '上海',
    startDate: '2026-07-12 09:00:00',
    endDate: '2026-07-12',
    goingDate: '2026-07-12 09:00:00',
    priceText: '普票88元 | vip票138元',
    onGoingText: '主包正在逛展中...',
    passedText: '已经过去了{days}天',
  },
  {
    name: '夏日星炬·学院回响',
    poster: 'https://upload.codexing.top/Sigrika/26/06/20260619224044547.webp',
    url: 'https://www.xiaohongshu.com/discovery/item/6a12d90200000000350254cb?source=webshare&xhsshare=pc_web&xsec_token=ABD6gETAcH3soj3Ev921ZGzDH6RnEfErRzYNUph0QIBjc=&xsec_source=pc_share',
    location: '杭州 · 杭州大厦中央商城Zpark街区',
    city: '杭州',
    startDate: '2026-08-15 09:00:00',
    endDate: '2026-08-15',
    goingDate: '2026-08-15 09:00:00',
    priceText: '普票78元 | vip票128元',
    onGoingText: '主包正在逛展中...',
    passedText: '好想回到{days}天前',
  },
];