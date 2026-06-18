import { request, UploadOptions } from '@/utils/request'

/** 上传响应数据 */
export interface UploadResult {
    /** 文件访问URL */
    url: string
}

/**
 * 文件上传（支持上传进度）
 */
export const upload = (
    file: File,
    options?: Pick<UploadOptions, 'onProgress' | 'abortController'>,
): Promise<UploadResult> => {
    return request.upload<UploadResult>('/xbUpload/api/Upload/upload', file, {
        fieldName: 'file',
        ...options,
    })
}
