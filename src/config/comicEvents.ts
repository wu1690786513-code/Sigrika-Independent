export interface ComicEvent {
  name: string;           // 漫展名称
  startDate: string;      // 开始日期 YYYY-MM-DD
  endDate?: string;       // 结束日期 YYYY-MM-DD（可选）
  goingDate?: string;     // 计划去的日期 YYYY-MM-DD（可选，默认开始日期）
  location: string;       // 地点
  preSalePrice?: string;  // 预售价格（可选）
  onSitePrice?: string;   // 现场价格（可选）
  priceText?: string;     // 自定义价格文本（可选，优先使用）
  poster?: string;        // 海报图片URL（可选）
  url?: string;           // 官网链接（可选）
}

export const comicEvents: ComicEvent[] = [
  {
    name: '杭州国际动漫节',
    startDate: '2026-06-15',
    endDate: '2026-06-19',
    goingDate: '2026-06-19',
    location: '杭州·白马湖会展中心',
    priceText: '工作日50元 | 现场70元',
    poster: 'https://cicaf.hzxcw.gov.cn/assets/images/banner.jpg',
    url: 'https://www.cicaf.com'
  },
  {
    name: '上海Comicup',
    startDate: '2026-08-15',
    endDate: '2026-08-17',
    location: '上海·新国际博览中心',
    preSalePrice: '120',
    onSitePrice: '150'
  },
  {
    name: '成都ComicDay',
    startDate: '2026-10-01',
    endDate: '2026-10-03',
    location: '成都·世纪城新国际会展中心',
    preSalePrice: '80',
    onSitePrice: '100'
  }
];