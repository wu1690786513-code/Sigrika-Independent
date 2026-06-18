export interface ComicEvent {
  name: string;           // 漫展名称
  startDate: string;      // 开始日期 YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss（支持精确到具体时间）
  endDate?: string;       // 结束日期 YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss（可选）
  goingDate?: string;     // 计划去的日期 YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss（可选，默认开始日期）
  location: string;       // 地点
  preSalePrice?: string;  // 预售价格（可选）
  onSitePrice?: string;   // 现场价格（可选）
  priceText?: string;     // 自定义价格文本（可选，优先使用）
  poster?: string;        // 海报图片URL（可选）
  url?: string;           // 官网链接（可选）
  onGoingText?: string;   // 当天进行中的文本（可选，默认"主包正在逛展位"）
  passedText?: string;    // 已过去的文本（可选，默认"已经过去了{days}"，支持{days}占位符显示天数）
}

// 默认海报图片
export const defaultComicPoster = 'https://upload.codexing.top/Blogs/study.webp';

export const comicEvents: ComicEvent[] = [
  {
    name: '杭州国际动漫节',
    startDate: '2026-06-10 09:00:00',
    endDate: '2026-06-17 17:00:00',
    goingDate: '2026-06-17 09:00:00',
    location: '杭州·白马湖会展中心',
    priceText: '工作日50元 | 现场70元',
    poster: 'https://cicaf.hzxcw.gov.cn/assets/images/banner.jpg',
    url: 'https://www.cicaf.com',
    onGoingText: '主包正在逛展中...',
    passedText: '',
  },
  {
    name: '上海Comicup',
    startDate: '2026-05-01',
    endDate: '2026-05-02',
    location: '上海·新国际博览中心',
    priceText: '预售60元 | 现场80元',
    poster: defaultComicPoster,
    onGoingText: '主包正在逛展中...',
    passedText: '',
  },
  {
    name: '广州萤火虫漫展',
    startDate: '2026-04-20',
    endDate: '2026-04-22',
    location: '广州·琶洲展馆',
    priceText: '预售55元 | 现场70元',
    poster: defaultComicPoster,
    onGoingText: '主包正在逛展中...',
    passedText: '',
  },
  {
    name: '上海Bilibili World',
    startDate: '2026-07-10 09:00:00',
    endDate: '2026-07-12',
    goingDate: '2026-07-11 09:00:00',
    location: '上海·国家会展中心',
    poster: 'https://upload.codexing.top/Sigrika/26/06/20260618192812362.webp',
    url: 'https://bw.bilibili.com/',
    priceText: '游园票128元 | IP典藏票328元 | VIP票588元',
  },
  {
    name: '成都ComicDay',
    startDate: '2026-08-15',
    endDate: '2026-08-17',
    location: '成都·世纪城新国际会展中心',
    priceText: '预售50元 | 现场65元',
    poster: defaultComicPoster,
    onGoingText: '主包正在逛展中...',
    passedText: '',
  },
  {
    name: '北京IDO动漫游戏嘉年华',
    startDate: '2026-09-20',
    endDate: '2026-09-22',
    location: '北京·国家会议中心',
    priceText: '预售60元 | 现场80元',
    poster: defaultComicPoster,
    onGoingText: '主包正在逛展中...',
    passedText: '',
  },
];