import { request } from '@/utils/request'

/** 文章列表查询参数 */
export interface ArticleListParams {
  /** 分类ID */
  category_id?: number
  /** 搜索关键词 */
  keyword?: string
  /** 页码 */
  page?: number
  /** 每页数量 */
  limit?: number
}

/** 文章详情查询参数 */
export interface ArticleDetailParams {
  /** 文章ID */
  id: number
}

/** 搜索文章参数 */
export interface ArticleSearchParams {
  /** 搜索关键词 */
  keyword: string
  /** 返回数量 */
  limit?: number
}

/** 分类详情查询参数 */
export interface CategoryDetailParams {
  /** 分类ID */
  id: number
}

/** 标记已读参数 */
export interface MarkReadParams {
  /** 文章ID */
  article_id: number
}

/** 切换收藏参数 */
export interface ToggleFavoriteParams {
  /** 文章ID */
  article_id: number
}

/** 文章分类 */
export interface ArticleCategory {
  /** 分类ID */
  id: number
  /** 分类标题 */
  title: string
  /** 分类图标 */
  icon: string
  /** 排序 */
  sort: number
  /** 状态 */
  status: string
  /** 创建时间 */
  create_at: string
  /** 更新时间 */
  update_at: string
}

/** 文章信息 */
export interface Article {
  /** 文章ID */
  id: number
  /** 分类ID */
  category_id: number
  /** 文章标题 */
  title: string
  /** 文章摘要 */
  summary: string
  /** 文章内容 */
  content: string
  /** 封面图 */
  cover: string
  /** 排序 */
  sort: number
  /** 浏览次数 */
  view_count: number
  /** 是否置顶 */
  is_top: string
  /** 状态 */
  status: string
  /** 创建时间 */
  create_at: string
  /** 更新时间 */
  update_at: string
  /** 分类信息 */
  category: ArticleCategory
  /** 是否已读 */
  is_read: string
  /** 是否收藏 */
  is_favorite: string
}

/**
 * 获取文章列表
 */
export const getArticleList = (params?: ArticleListParams): Promise<Article[]> => {
  return request.get<Article[]>('/xbHelp/api/Article/list', { params })
}

/**
 * 获取文章详情
 */
export const getArticleDetail = (params: ArticleDetailParams): Promise<Article> => {
  return request.get<Article>('/xbHelp/api/Article/detail', { params })
}

/**
 * 搜索文章
 */
export const searchArticle = (params: ArticleSearchParams): Promise<unknown> => {
  return request.get<unknown>('/xbHelp/api/Article/search', { params })
}

/**
 * 获取分类列表
 */
export const getCategoryList = (): Promise<unknown> => {
  return request.get<unknown>('/xbHelp/api/Category/list')
}

/**
 * 获取分类详情
 */
export const getCategoryDetail = (params: CategoryDetailParams): Promise<unknown> => {
  return request.get<unknown>('/xbHelp/api/Category/detail', { params })
}

/**
 * 标记文章已读
 */
export const markArticleRead = (params: MarkReadParams): Promise<unknown> => {
  return request.post<unknown>('/xbHelp/api/ReadLog/markRead', params)
}

/**
 * 切换文章收藏
 */
export const toggleFavorite = (params: ToggleFavoriteParams): Promise<unknown> => {
  return request.post<unknown>('/xbHelp/api/ReadLog/toggleFavorite', params)
}

/**
 * 获取收藏列表
 */
export const getFavorites = (): Promise<unknown> => {
  return request.get<unknown>('/xbHelp/api/ReadLog/favorites')
}
