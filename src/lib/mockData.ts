export interface Post {
  id: string;
  title: string;
  slug: string;
  eyecatch: string;
  body: string;
  category: string;
  publishedAt: string;
  excerpt: string;
}

export interface Member {
  id: string;
  name: string;
  company: string;
  description: string;
  url: string;
  address: string;
}

export const posts: Post[] = [
  {
    id: '1',
    title: '2025年度 三多摩支部総会が開催されました',
    slug: '2025-soukai',
    eyecatch: '',
    body: `<p>2025年4月に三多摩支部の年度総会が開催されました。今年度の活動方針と予算案が承認され、新役員体制がスタートしました。</p>
<p>総会には約30名の会員が参加し、活発な議論が行われました。新年度は「共に学び、共に成長する」をスローガンに、月例会の充実と新規会員の拡大を目指します。</p>
<p>懇親会では新入会員の自己紹介もあり、和やかな雰囲気の中で交流が深まりました。</p>`,
    category: 'news2025',
    publishedAt: '2025-04-15',
    excerpt: '2025年4月に三多摩支部の年度総会が開催されました。今年度の活動方針と予算案が承認され、新役員体制がスタートしました。',
  },
  {
    id: '2',
    title: '3月例会「経営指針の実践と成果」を開催',
    slug: '202503-reikai',
    eyecatch: '',
    body: `<p>3月例会では「経営指針の実践と成果」をテーマに、会員企業2社による報告が行われました。</p>
<p>経営指針を成文化し実践することで、社員との意思疎通が改善し、業績向上に繋がった事例が共有されました。参加者からは活発な質疑応答がありました。</p>`,
    category: 'news2025',
    publishedAt: '2025-03-20',
    excerpt: '3月例会では「経営指針の実践と成果」をテーマに、会員企業2社による報告が行われました。',
  },
  {
    id: '3',
    title: '新春経営講演会を開催しました',
    slug: '202501-shinshun',
    eyecatch: '',
    body: `<p>1月の新春経営講演会には、50名を超える参加者が集まりました。外部講師による「中小企業の未来戦略」と題した講演は大変好評でした。</p>
<p>講演後のグループディスカッションでは、各テーブルで活発な意見交換が行われ、新たなビジネスの可能性について議論しました。</p>`,
    category: 'news2025',
    publishedAt: '2025-01-25',
    excerpt: '1月の新春経営講演会には、50名を超える参加者が集まりました。外部講師による「中小企業の未来戦略」と題した講演は大変好評でした。',
  },
  {
    id: '4',
    title: '12月忘年例会・懇親会レポート',
    slug: '202412-bounenkai',
    eyecatch: '',
    body: `<p>12月は恒例の忘年例会と懇親会を開催しました。今年一年の活動を振り返りつつ、会員同士の親睦を深める機会となりました。</p>
<p>ビンゴ大会や会員企業のPRタイムなど、楽しい企画が盛りだくさんでした。</p>`,
    category: 'news2024',
    publishedAt: '2024-12-20',
    excerpt: '12月は恒例の忘年例会と懇親会を開催しました。今年一年の活動を振り返りつつ、会員同士の親睦を深める機会となりました。',
  },
  {
    id: '5',
    title: '秋の合宿研修を実施しました',
    slug: '202410-gasshuku',
    eyecatch: '',
    body: `<p>10月に1泊2日の合宿研修を実施しました。テーマは「10年ビジョンを描く」。</p>
<p>普段の例会とは異なる環境で、じっくりと自社の将来について考える貴重な時間となりました。グループワークを通じて、他社の経営者からの客観的な意見も得られ、参加者から高い評価を頂きました。</p>`,
    category: 'news2024',
    publishedAt: '2024-10-15',
    excerpt: '10月に1泊2日の合宿研修を実施しました。テーマは「10年ビジョンを描く」。',
  },
  {
    id: '6',
    title: '7月例会「採用と人材育成」を開催',
    slug: '202407-reikai',
    eyecatch: '',
    body: `<p>7月例会では「採用と人材育成」をテーマに開催しました。中小企業における人材確保の課題と、育成の工夫について、パネルディスカッション形式で議論しました。</p>`,
    category: 'news2024',
    publishedAt: '2024-07-18',
    excerpt: '7月例会では「採用と人材育成」をテーマに開催しました。中小企業における人材確保の課題と、育成の工夫について議論しました。',
  },
  {
    id: '7',
    title: '2024年度 三多摩支部総会報告',
    slug: '2024-soukai',
    eyecatch: '',
    body: `<p>2024年度の支部総会を開催し、新年度の活動方針が承認されました。会員数の増加を目標に、広報活動の強化に取り組みます。</p>`,
    category: 'news2024',
    publishedAt: '2024-04-20',
    excerpt: '2024年度の支部総会を開催し、新年度の活動方針が承認されました。',
  },
  {
    id: '8',
    title: '経営指針成文化セミナー 第10期が修了',
    slug: '202403-keiei-shishin',
    eyecatch: '',
    body: `<p>経営指針成文化セミナー第10期が全6回のカリキュラムを終え、修了式を迎えました。今期は5名の経営者が参加し、それぞれの経営理念・方針・計画を成文化しました。</p>
<p>修了生からは「自社の方向性が明確になった」「社員に伝えるべきことが整理できた」といった声が寄せられました。</p>`,
    category: 'news2024',
    publishedAt: '2024-03-10',
    excerpt: '経営指針成文化セミナー第10期が全6回のカリキュラムを終え、修了式を迎えました。',
  },
  {
    id: '9',
    title: '11月例会「DXで変わる中小企業経営」',
    slug: '202311-dx-reikai',
    eyecatch: '',
    body: `<p>11月例会では「DXで変わる中小企業経営」をテーマに開催。IT導入補助金の活用事例や、少人数でも実践できるデジタル化の第一歩について学びました。</p>`,
    category: 'news2023',
    publishedAt: '2023-11-22',
    excerpt: '11月例会では「DXで変わる中小企業経営」をテーマに開催。IT導入補助金の活用事例について学びました。',
  },
  {
    id: '10',
    title: '9月例会「事業承継の準備と課題」',
    slug: '202309-jigyoushoukei',
    eyecatch: '',
    body: `<p>9月例会では事業承継をテーマに、専門家を招いた講演と会員企業の体験報告を実施しました。早期の準備の重要性が改めて認識されました。</p>`,
    category: 'news2023',
    publishedAt: '2023-09-15',
    excerpt: '9月例会では事業承継をテーマに、専門家を招いた講演と会員企業の体験報告を実施しました。',
  },
  {
    id: '11',
    title: '2023年度 支部総会を開催',
    slug: '2023-soukai',
    eyecatch: '',
    body: `<p>2023年度の支部総会が無事に開催されました。コロナ禍からの回復を踏まえ、対面活動の充実を方針の柱として掲げました。</p>`,
    category: 'news2023',
    publishedAt: '2023-04-18',
    excerpt: '2023年度の支部総会が無事に開催されました。コロナ禍からの回復を踏まえ、対面活動の充実を方針の柱として掲げました。',
  },
  {
    id: '12',
    title: '新年交流会を開催しました',
    slug: '202301-shinnen',
    eyecatch: '',
    body: `<p>2023年新年交流会を1月に開催しました。新しい年の抱負を語り合い、会員同士のネットワーキングを深める有意義な時間となりました。</p>`,
    category: 'news2023',
    publishedAt: '2023-01-20',
    excerpt: '2023年新年交流会を1月に開催しました。新しい年の抱負を語り合い、会員同士のネットワーキングを深めました。',
  },
];

export const members: Member[] = [
  { id: '1', name: '山田 太郎', company: '株式会社山田製作所', description: '精密部品の設計・製造', url: 'https://example.com/yamada', address: '東京都八王子市元本郷町1-1-1' },
  { id: '2', name: '鈴木 一郎', company: '鈴木建設株式会社', description: '住宅・商業施設の建築', url: 'https://example.com/suzuki', address: '東京都立川市曙町2-2-2' },
  { id: '3', name: '佐藤 花子', company: '株式会社サトウデザイン', description: 'グラフィックデザイン・Web制作', url: 'https://example.com/sato', address: '東京都武蔵野市吉祥寺本町3-3-3' },
  { id: '4', name: '田中 健二', company: '田中電機株式会社', description: '電気設備工事・メンテナンス', url: 'https://example.com/tanaka', address: '東京都府中市宮町4-4-4' },
  { id: '5', name: '高橋 美咲', company: '株式会社タカハシフーズ', description: '食品製造・卸売', url: 'https://example.com/takahashi', address: '東京都調布市布田5-5-5' },
  { id: '6', name: '伊藤 誠', company: '伊藤会計事務所', description: '税務・会計コンサルティング', url: 'https://example.com/ito', address: '東京都町田市原町田6-6-6' },
  { id: '7', name: '渡辺 裕子', company: '株式会社ワタナベ印刷', description: '商業印刷・デジタル印刷', url: 'https://example.com/watanabe', address: '東京都小平市花小金井7-7-7' },
  { id: '8', name: '中村 大輔', company: '中村ソフトウェア株式会社', description: '業務システム開発', url: 'https://example.com/nakamura', address: '東京都日野市豊田8-8-8' },
  { id: '9', name: '小林 直樹', company: '株式会社コバヤシ運輸', description: '物流・配送サービス', url: 'https://example.com/kobayashi', address: '東京都東村山市本町9-9-9' },
  { id: '10', name: '加藤 恵美', company: '加藤介護サービス株式会社', description: '訪問介護・デイサービス', url: 'https://example.com/kato', address: '東京都多摩市関戸10-10-10' },
  { id: '11', name: '吉田 浩', company: '吉田自動車整備株式会社', description: '自動車整備・車検', url: 'https://example.com/yoshida', address: '東京都青梅市河辺町11-11-11' },
  { id: '12', name: '松本 真理', company: '株式会社マツモト不動産', description: '不動産仲介・管理', url: 'https://example.com/matsumoto', address: '東京都国分寺市南町12-12-12' },
];

export function getPostsByCategory(category: string): Post[] {
  return posts.filter(p => p.category === category);
}

export function getLatestPosts(count: number): Post[] {
  return [...posts].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).slice(0, count);
}

export const categoryLabels: Record<string, string> = {
  news2022: '2022',
  news2023: '2023',
  news2024: '2024',
  news2025: '2025',
};

export const categoryFullLabels: Record<string, string> = {
  news2022: '2022年度のお知らせ',
  news2023: '2023年度のお知らせ',
  news2024: '2024年度のお知らせ',
  news2025: '2025年度のお知らせ',
};

export function getCategoryLabel(category: string): string {
  return categoryFullLabels[category] || category;
}

export const categories = ['news2025', 'news2024', 'news2023', 'news2022'];

export const navItems = [
  { label: 'トップ', href: '/' },
  { label: '三多摩支部とは', href: '/about/' },
  { label: '経営者の気づきとまなび', href: '/posts/' },
  { label: '経営者支援サービス', href: '/our-services/' },
  { label: 'イベント', href: '/event/' },
  { label: '会員企業一覧', href: '/list/' },
  { label: '東京同友会', href: '/tokyo-doyu/' },
];

export const footerNavItems = [
  ...navItems,
  { label: '入会案内', href: '/welcome/' },
  { label: 'お問い合わせ', href: '/contact/' },
];
