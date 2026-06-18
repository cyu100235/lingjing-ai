import { defineStore } from 'pinia'
import { useAssetStore, type Asset, type AssetType, type AssetSubType } from './assets'
import { useSiteConfigStore } from './siteConfig'

/** 市场上架信息 */
export interface MarketListing {
  /** 上架记录唯一标识 */
  id: string
  /** 关联的素材ID */
  assetId: string
  /** 素材详情 */
  asset: Asset
  /** 卖家用户ID */
  sellerId: string
  /** 卖家昵称 */
  sellerName: string
  /** 卖家头像 */
  sellerAvatar: string
  /** 售价 */
  price: number
  /** 原价（用于展示折扣） */
  originalPrice?: number
  /** 上架状态：在售 / 已售 / 已下架 */
  status: 'active' | 'sold' | 'removed'
  /** 上架日期 */
  listedAt: string
  /** 售出日期 */
  soldAt?: string
  /** 浏览次数 */
  viewCount: number
  /** 点赞数 */
  likeCount: number
  /** 当前用户是否已点赞 */
  liked: boolean
  /** 商品描述 */
  description?: string
}

/** 交易记录 */
export interface Transaction {
  /** 交易唯一标识 */
  id: string
  /** 关联的上架记录ID */
  listingId: string
  /** 素材名称 */
  assetName: string
  /** 素材缩略图 */
  assetThumbnail: string
  /** 素材类型 */
  assetType: AssetType
  /** 买家昵称 */
  buyerName: string
  /** 卖家昵称 */
  sellerName: string
  /** 交易金额 */
  price: number
  /** 交易类型：买入 / 卖出 */
  type: 'buy' | 'sell'
  /** 交易创建时间 */
  createdAt: string
}

/** 用户钱包信息 */
export interface UserWallet {
  /** 余额 */
  balance: number
  /** 累计收入 */
  totalEarnings: number
  /** 累计支出 */
  totalSpent: number
}

/** 市场排序选项：最新 / 价格升序 / 价格降序 / 最热门 */
export type MarketSortOption = 'newest' | 'price_asc' | 'price_desc' | 'popular'

/** 市场状态管理 */
export const useMarketplaceStore = defineStore('marketplace', () => {
  /** 上架商品列表 */
  const listings = ref<MarketListing[]>([
    { id: 'ml-1', assetId: 'market-c1', asset: { id: 'market-c1', name: '剑客浪人', type: 'character', thumbnail: '/images/char-panda.jpg', tags: ['主角', '武侠'], createdAt: '2026-04-20' }, sellerId: 'seller-1', sellerName: '竹林创作者', sellerAvatar: '/images/char-panda.jpg', price: 120, originalPrice: 150, status: 'active', listedAt: '2026-05-01', viewCount: 328, likeCount: 45, liked: false, description: '精心设计的武侠剑客角色，适合古装动画' },
    { id: 'ml-2', assetId: 'market-c2', asset: { id: 'market-c2', name: '仙子飘飘', type: 'character', thumbnail: '/images/char-girl.jpg', tags: ['女主', '仙侠'], createdAt: '2026-04-18' }, sellerId: 'seller-2', sellerName: '古风工作室', sellerAvatar: '/images/char-girl.jpg', price: 180, status: 'active', listedAt: '2026-05-02', viewCount: 456, likeCount: 72, liked: false, description: '唯美仙侠风格女性角色' },
    { id: 'ml-3', assetId: 'market-c3', asset: { id: 'market-c3', name: '铁匠老汉', type: 'character', thumbnail: '/images/char-scholar.jpg', tags: ['配角', '古风'], createdAt: '2026-04-15' }, sellerId: 'seller-3', sellerName: 'AI绘画大师', sellerAvatar: '/images/char-scholar.jpg', price: 65, status: 'active', listedAt: '2026-05-03', viewCount: 142, likeCount: 18, liked: false },
    { id: 'ml-4', assetId: 'market-c4', asset: { id: 'market-c4', name: '灵猫精灵', type: 'character', thumbnail: '/images/char-dog.jpg', tags: ['萌宠', '配角'], createdAt: '2026-04-12' }, sellerId: 'seller-1', sellerName: '竹林创作者', sellerAvatar: '/images/char-panda.jpg', price: 88, status: 'active', listedAt: '2026-05-04', viewCount: 267, likeCount: 56, liked: false, description: '可爱的灵猫精灵角色，自带多种表情' },
    { id: 'ml-5', assetId: 'market-b1', asset: { id: 'market-b1', name: '雪山之巅', type: 'background', thumbnail: '/images/bg-palace.jpg', tags: ['室外', '宏伟'], createdAt: '2026-04-22' }, sellerId: 'seller-2', sellerName: '古风工作室', sellerAvatar: '/images/char-girl.jpg', price: 95, status: 'active', listedAt: '2026-05-01', viewCount: 198, likeCount: 33, liked: false, description: '壮丽的雪山场景，适合武侠对决' },
    { id: 'ml-6', assetId: 'market-b2', asset: { id: 'market-b2', name: '水墨江南', type: 'background', thumbnail: '/images/bg-bamboo.jpg', tags: ['室外', '自然'], createdAt: '2026-04-20' }, sellerId: 'seller-4', sellerName: '音效达人', sellerAvatar: '/images/audio-cover.svg', price: 75, status: 'active', listedAt: '2026-05-02', viewCount: 312, likeCount: 48, liked: false },
    { id: 'ml-7', assetId: 'market-b3', asset: { id: 'market-b3', name: '地下密室', type: 'background', thumbnail: '/images/bg-inn.jpg', tags: ['室内', '神秘'], createdAt: '2026-04-18' }, sellerId: 'seller-5', sellerName: '动画小匠', sellerAvatar: '/images/char-dog.jpg', price: 55, status: 'active', listedAt: '2026-05-05', viewCount: 89, likeCount: 12, liked: false },
    { id: 'ml-8', assetId: 'market-a1', asset: { id: 'market-a1', name: '飞踢连环', type: 'action', thumbnail: '/images/action-sword-slash.jpg', tags: ['打斗', '武侠'], createdAt: '2026-04-25' }, sellerId: 'seller-3', sellerName: 'AI绘画大师', sellerAvatar: '/images/char-scholar.jpg', price: 45, status: 'active', listedAt: '2026-05-03', viewCount: 234, likeCount: 38, liked: false, description: '流畅的飞踢连招动作序列' },
    { id: 'ml-9', assetId: 'market-a2', asset: { id: 'market-a2', name: '御剑飞行', type: 'action', thumbnail: '/images/action-run.jpg', tags: ['飞行', '仙侠'], createdAt: '2026-04-23' }, sellerId: 'seller-1', sellerName: '竹林创作者', sellerAvatar: '/images/char-panda.jpg', price: 68, status: 'active', listedAt: '2026-05-04', viewCount: 178, likeCount: 29, liked: false },
    { id: 'ml-10', assetId: 'market-a3', asset: { id: 'market-a3', name: '翻滚闪避', type: 'action', thumbnail: '/images/action-punch.jpg', tags: ['闪避', '打斗'], createdAt: '2026-04-21' }, sellerId: 'seller-5', sellerName: '动画小匠', sellerAvatar: '/images/char-dog.jpg', price: 35, status: 'active', listedAt: '2026-05-06', viewCount: 156, likeCount: 21, liked: false },
    { id: 'ml-11', assetId: 'market-a4', asset: { id: 'market-a4', name: '施法吟唱', type: 'action', thumbnail: '/images/action-pointing.jpg', tags: ['魔法', '仙侠'], createdAt: '2026-04-19' }, sellerId: 'seller-2', sellerName: '古风工作室', sellerAvatar: '/images/char-girl.jpg', price: 52, status: 'active', listedAt: '2026-05-07', viewCount: 201, likeCount: 35, liked: false },
    { id: 'ml-12', assetId: 'market-e1', asset: { id: 'market-e1', name: '邪魅冷笑', type: 'expression', thumbnail: '/images/expr-cold.png', tags: ['反派', '冷酷'], createdAt: '2026-04-28' }, sellerId: 'seller-3', sellerName: 'AI绘画大师', sellerAvatar: '/images/char-scholar.jpg', price: 25, status: 'active', listedAt: '2026-05-02', viewCount: 167, likeCount: 22, liked: false },
    { id: 'ml-13', assetId: 'market-e2', asset: { id: 'market-e2', name: '惊恐万分', type: 'expression', thumbnail: '/images/expr-surprised.png', tags: ['恐惧', '夸张'], createdAt: '2026-04-26' }, sellerId: 'seller-4', sellerName: '音效达人', sellerAvatar: '/images/audio-cover.svg', price: 18, status: 'active', listedAt: '2026-05-03', viewCount: 98, likeCount: 11, liked: false },
    { id: 'ml-14', assetId: 'market-e3', asset: { id: 'market-e3', name: '温柔微笑', type: 'expression', thumbnail: '/images/expr-happy.png', tags: ['正面', '温柔'], createdAt: '2026-04-24' }, sellerId: 'seller-1', sellerName: '竹林创作者', sellerAvatar: '/images/char-panda.jpg', price: 22, status: 'active', listedAt: '2026-05-05', viewCount: 145, likeCount: 28, liked: false },
    { id: 'ml-15', assetId: 'market-p1', asset: { id: 'market-p1', name: '神秘卷轴', type: 'prop', thumbnail: '/images/prop-sword.jpg', tags: ['道具', '古风'], createdAt: '2026-04-27' }, sellerId: 'seller-2', sellerName: '古风工作室', sellerAvatar: '/images/char-girl.jpg', price: 38, status: 'active', listedAt: '2026-05-01', viewCount: 213, likeCount: 31, liked: false },
    { id: 'ml-16', assetId: 'market-p2', asset: { id: 'market-p2', name: '玉佩挂饰', type: 'prop', thumbnail: '/images/prop-wine.jpg', tags: ['装饰', '古风'], createdAt: '2026-04-25' }, sellerId: 'seller-5', sellerName: '动画小匠', sellerAvatar: '/images/char-dog.jpg', price: 28, status: 'active', listedAt: '2026-05-04', viewCount: 87, likeCount: 14, liked: false },
    { id: 'ml-17', assetId: 'market-p3', asset: { id: 'market-p3', name: '烟花礼炮', type: 'prop', thumbnail: '/images/prop-lantern.jpg', tags: ['节日', '特效'], createdAt: '2026-04-23' }, sellerId: 'seller-3', sellerName: 'AI绘画大师', sellerAvatar: '/images/char-scholar.jpg', price: 42, status: 'active', listedAt: '2026-05-06', viewCount: 134, likeCount: 19, liked: false },
    { id: 'ml-18', assetId: 'market-ef1', asset: { id: 'market-ef1', name: '樱花飘落', type: 'effect', thumbnail: '/images/effect-crystal-lotus.jpg', tags: ['粒子', '氛围'], createdAt: '2026-04-29' }, sellerId: 'seller-1', sellerName: '竹林创作者', sellerAvatar: '/images/char-panda.jpg', price: 85, status: 'active', listedAt: '2026-05-02', viewCount: 389, likeCount: 67, liked: false, description: '精美的樱花飘落粒子特效' },
    { id: 'ml-19', assetId: 'market-ef2', asset: { id: 'market-ef2', name: '剑气纵横', type: 'effect', thumbnail: '/images/effect-energy-swirl.jpg', tags: ['技能', '攻击'], createdAt: '2026-04-27' }, sellerId: 'seller-4', sellerName: '音效达人', sellerAvatar: '/images/audio-cover.svg', price: 110, status: 'active', listedAt: '2026-05-03', viewCount: 276, likeCount: 43, liked: false },
    { id: 'ml-20', assetId: 'market-ef3', asset: { id: 'market-ef3', name: '传送门光圈', type: 'effect', thumbnail: '/images/effect-rune-tornado.jpg', tags: ['魔法', '传送'], createdAt: '2026-04-25' }, sellerId: 'seller-2', sellerName: '古风工作室', sellerAvatar: '/images/char-girl.jpg', price: 95, status: 'active', listedAt: '2026-05-05', viewCount: 201, likeCount: 36, liked: false },
    { id: 'ml-21', assetId: 'market-v1', asset: { id: 'market-v1', name: '磁性男低音', type: 'voice', subType: 'youth_voice', thumbnail: '/images/audio-cover.svg', mediaUrl: '/media/voice-youth.mp3', tags: ['男声', '磁性'], createdAt: '2026-04-30' }, sellerId: 'seller-4', sellerName: '音效达人', sellerAvatar: '/images/audio-cover.svg', price: 150, status: 'active', listedAt: '2026-05-01', viewCount: 412, likeCount: 78, liked: false, description: '浑厚有力的男低音，适合旁白和大侠角色' },
    { id: 'ml-22', assetId: 'market-v2', asset: { id: 'market-v2', name: '娇俏女声', type: 'voice', subType: 'teen_voice', thumbnail: '/images/audio-cover.svg', mediaUrl: '/media/voice-teen.mp3', tags: ['女声', '甜美'], createdAt: '2026-04-28' }, sellerId: 'seller-4', sellerName: '音效达人', sellerAvatar: '/images/audio-cover.svg', price: 160, status: 'active', listedAt: '2026-05-03', viewCount: 356, likeCount: 65, liked: false },
    { id: 'ml-23', assetId: 'market-sfx1', asset: { id: 'market-sfx1', name: '古琴弹奏', type: 'sound_effect', subType: 'atmosphere_sfx', thumbnail: '/images/audio-cover.svg', mediaUrl: '/media/sfx-wind.mp3', tags: ['氛围', '音乐'], createdAt: '2026-04-26' }, sellerId: 'seller-5', sellerName: '动画小匠', sellerAvatar: '/images/char-dog.jpg', price: 55, status: 'active', listedAt: '2026-05-04', viewCount: 178, likeCount: 24, liked: false },
    { id: 'ml-24', assetId: 'market-sfx2', asset: { id: 'market-sfx2', name: '万马奔腾', type: 'sound_effect', subType: 'environment_sfx', thumbnail: '/images/audio-cover.svg', mediaUrl: '/media/sfx-rain.mp3', tags: ['环境', '史诗'], createdAt: '2026-04-24' }, sellerId: 'seller-3', sellerName: 'AI绘画大师', sellerAvatar: '/images/char-scholar.jpg', price: 48, status: 'active', listedAt: '2026-05-06', viewCount: 123, likeCount: 17, liked: false },
    { id: 'ml-25', assetId: 'market-vid1', asset: { id: 'market-vid1', name: '水墨片头模板', type: 'video', subType: 'intro_video', thumbnail: '/images/video-cover.svg', mediaUrl: '/media/intro-ancient.mp4', tags: ['片头', '水墨'], createdAt: '2026-04-22' }, sellerId: 'seller-2', sellerName: '古风工作室', sellerAvatar: '/images/char-girl.jpg', price: 280, status: 'active', listedAt: '2026-05-02', viewCount: 534, likeCount: 92, liked: false, description: '高质量水墨风格片头视频模板' },
  ])

  /** 交易记录列表 */
  const transactions = ref<Transaction[]>([
    { id: 'tx-1', listingId: 'ml-sold-1', assetName: '侠客立绘', assetThumbnail: '/images/char-panda.jpg', assetType: 'character', buyerName: '我', sellerName: '竹林创作者', price: 100, type: 'buy', createdAt: '2026-05-10' },
    { id: 'tx-2', listingId: 'ml-sold-2', assetName: '瀑布场景', assetThumbnail: '/images/bg-bamboo.jpg', assetType: 'background', buyerName: '我', sellerName: '古风工作室', price: 80, type: 'buy', createdAt: '2026-05-08' },
    { id: 'tx-3', listingId: 'ml-sold-3', assetName: '闪电特效', assetThumbnail: '/images/effect-lightning-chain.jpg', assetType: 'effect', buyerName: '我', sellerName: 'AI绘画大师', price: 60, type: 'buy', createdAt: '2026-05-06' },
    { id: 'tx-4', listingId: 'ml-sold-4', assetName: '跳跃动作', assetThumbnail: '/images/action-run.jpg', assetType: 'action', buyerName: '我', sellerName: '动画小匠', price: 35, type: 'buy', createdAt: '2026-05-04' },
    { id: 'tx-5', listingId: 'ml-sold-5', assetName: '笛子音效', assetThumbnail: '/images/audio-cover.svg', assetType: 'sound_effect', buyerName: '我', sellerName: '音效达人', price: 45, type: 'buy', createdAt: '2026-05-02' },
    { id: 'tx-6', listingId: 'ml-sold-6', assetName: '惊喜表情', assetThumbnail: '/images/expr-surprised.png', assetType: 'expression', buyerName: '我', sellerName: '竹林创作者', price: 15, type: 'buy', createdAt: '2026-04-28' },
    { id: 'tx-7', listingId: 'ml-sold-7', assetName: '古风少女', assetThumbnail: '/images/char-girl.jpg', assetType: 'character', buyerName: '动画小匠', sellerName: '我', price: 130, type: 'sell', createdAt: '2026-05-09' },
    { id: 'tx-8', listingId: 'ml-sold-8', assetName: '火焰特效包', assetThumbnail: '/images/effect-fire-burst.jpg', assetType: 'effect', buyerName: '古风工作室', sellerName: '我', price: 90, type: 'sell', createdAt: '2026-05-07' },
    { id: 'tx-9', listingId: 'ml-sold-9', assetName: '客栈内景', assetThumbnail: '/images/bg-inn.jpg', assetType: 'background', buyerName: 'AI绘画大师', sellerName: '我', price: 70, type: 'sell', createdAt: '2026-05-05' },
    { id: 'tx-10', listingId: 'ml-sold-10', assetName: '拔剑动作', assetThumbnail: '/images/action-sword-slash.jpg', assetType: 'action', buyerName: '音效达人', sellerName: '我', price: 40, type: 'sell', createdAt: '2026-05-03' },
    { id: 'tx-11', listingId: 'ml-sold-11', assetName: '怒吼表情', assetThumbnail: '/images/expr-angry.png', assetType: 'expression', buyerName: '竹林创作者', sellerName: '我', price: 20, type: 'sell', createdAt: '2026-05-01' },
    { id: 'tx-12', listingId: 'ml-sold-12', assetName: '战斗BGM', assetThumbnail: '/images/audio-cover.svg', assetType: 'sound_effect', buyerName: '动画小匠', sellerName: '我', price: 55, type: 'sell', createdAt: '2026-04-29' },
  ])

  /** 用户钱包信息 */
  const wallet = ref<UserWallet>({
    balance: 1000,
    totalEarnings: 405,
    totalSpent: 335,
  })

  /** 搜索关键词 */
  const searchQuery = ref('')
  /** 当前选中的主类型筛选 */
  const activeFilter = ref<AssetType | 'all'>('all')
  /** 当前选中的子类型筛选 */
  const activeSubFilter = ref<AssetSubType | 'all'>('all')
  /** 排序方式 */
  const sortBy = ref<MarketSortOption>('newest')
  /** 价格区间最小值 */
  const priceMin = ref<number | null>(null)
  /** 价格区间最大值 */
  const priceMax = ref<number | null>(null)
  /** 视图模式：全部商品 / 我的上架 */
  const viewMode = ref<'all' | 'my_listings'>('all')

  /** 根据筛选、排序条件过滤后的上架商品列表 */
  const filteredListings = computed(() => {
    let result = listings.value.filter(l => l.status === 'active')

    if (viewMode.value === 'my_listings') {
      result = result.filter(l => l.sellerId === 'current-user')
    }

    if (activeFilter.value !== 'all') {
      result = result.filter(l => l.asset.type === activeFilter.value)
    }

    if (activeSubFilter.value !== 'all') {
      result = result.filter(l => l.asset.subType === activeSubFilter.value)
    }

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(l =>
        l.asset.name.toLowerCase().includes(query) ||
        l.asset.tags.some(t => t.toLowerCase().includes(query)) ||
        l.sellerName.toLowerCase().includes(query)
      )
    }

    if (priceMin.value !== null) {
      const min = Math.max(0, Math.min(500, priceMin.value))
      result = result.filter(l => l.price >= min)
    }
    if (priceMax.value !== null) {
      const max = Math.max(5, Math.min(10000, priceMax.value))
      result = result.filter(l => l.price <= max)
    }

    switch (sortBy.value) {
      case 'newest':
        result.sort((a, b) => b.listedAt.localeCompare(a.listedAt))
        break
      case 'price_asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'popular':
        result.sort((a, b) => b.viewCount - a.viewCount)
        break
    }

    return result
  })

  /** 我上架的商品列表 */
  const myListings = computed(() => {
    return listings.value.filter(l => l.sellerId === 'current-user' && l.status === 'active')
  })

  /** 买入交易记录 */
  const buyTransactions = computed(() => transactions.value.filter(t => t.type === 'buy'))
  /** 卖出交易记录 */
  const sellTransactions = computed(() => transactions.value.filter(t => t.type === 'sell'))

  /** 将素材上架到市场 */
  function listAsset(assetId: string, price: number, description?: string) {
    const assetStore = useAssetStore()
    const asset = assetStore.assets.find(a => a.id === assetId)
    if (!asset || asset.listingId) return false

    const listing: MarketListing = {
      id: `ml-${Date.now()}`,
      assetId,
      asset: { ...asset },
      sellerId: 'current-user',
      sellerName: '我',
      sellerAvatar: '/images/char-panda.jpg',
      price,
      status: 'active',
      listedAt: new Date().toISOString().slice(0, 10),
      viewCount: 0,
      likeCount: 0,
      liked: false,
      description,
    }

    listings.value.unshift(listing)
    asset.listingId = listing.id
    return true
  }

  /** 批量上架素材 */
  function listAssetsBatch(items: { assetId: string; price: number }[]) {
    items.forEach(item => listAsset(item.assetId, item.price))
  }

  /** 下架商品 */
  function unlistAsset(listingId: string) {
    const listing = listings.value.find(l => l.id === listingId)
    if (!listing) return false

    listing.status = 'removed'

    const assetStore = useAssetStore()
    const asset = assetStore.assets.find(a => a.id === listing.assetId)
    if (asset) {
      asset.listingId = undefined
    }
    return true
  }

  /** 购买商品（扣除余额、记录交易、添加到素材库） */
  function purchaseAsset(listingId: string) {
    const siteConfigStore = useSiteConfigStore()
    const listing = listings.value.find(l => l.id === listingId && l.status === 'active')
    if (!listing) return false
    if (siteConfigStore.currencyBalance < listing.price) return false
    if (listing.sellerId === 'current-user') return false

    siteConfigStore.setCurrencyBalance(siteConfigStore.currencyBalance - listing.price)
    wallet.value.totalSpent += listing.price

    listing.status = 'sold'
    listing.soldAt = new Date().toISOString().slice(0, 10)

    const transaction: Transaction = {
      id: `tx-${Date.now()}`,
      listingId,
      assetName: listing.asset.name,
      assetThumbnail: listing.asset.thumbnail,
      assetType: listing.asset.type,
      buyerName: '我',
      sellerName: listing.sellerName,
      price: listing.price,
      type: 'buy',
      createdAt: new Date().toISOString().slice(0, 10),
    }
    transactions.value.unshift(transaction)

    const assetStore = useAssetStore()
    assetStore.addAsset({
      name: listing.asset.name,
      type: listing.asset.type,
      subType: listing.asset.subType,
      thumbnail: listing.asset.thumbnail,
      mediaUrl: listing.asset.mediaUrl,
      tags: [...listing.asset.tags, '购买'],
    })

    return true
  }

  /** 修改已上架商品的售价 */
  function updatePrice(listingId: string, newPrice: number) {
    const listing = listings.value.find(l => l.id === listingId && l.sellerId === 'current-user')
    if (!listing) return false
    listing.price = newPrice
    return true
  }

  /** 切换商品点赞状态 */
  function toggleLike(listingId: string) {
    const listing = listings.value.find(l => l.id === listingId)
    if (!listing) return
    listing.liked = !listing.liked
    listing.likeCount += listing.liked ? 1 : -1
  }

  return {
    listings,
    transactions,
    wallet,
    searchQuery,
    activeFilter,
    activeSubFilter,
    sortBy,
    priceMin,
    priceMax,
    viewMode,
    filteredListings,
    myListings,
    buyTransactions,
    sellTransactions,
    listAsset,
    listAssetsBatch,
    unlistAsset,
    purchaseAsset,
    updatePrice,
    toggleLike,
  }
})
