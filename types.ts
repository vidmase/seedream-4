
export type ImageSize = 'square' | 'square_hd' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9';
export type ImageResolution = '1K' | '2K' | '4K';

export interface CreateTaskInput {
  prompt: string;
  image_urls: string[];
  image_size?: ImageSize;
  image_resolution?: ImageResolution;
  max_images?: number;
  seed?: number;
}

export interface CreateTaskPayload {
  model: 'bytedance/seedream-v4-edit';
  input: CreateTaskInput;
}

export interface CreateTaskResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

export type TaskState = 'waiting' | 'success' | 'fail';

export interface TaskStatusResponseData {
  taskId: string;
  model: string;
  state: TaskState;
  param: string; 
  resultJson: string | null;
  failCode: string | null;
  failMsg: string | null;
  costTime: number | null;
  completeTime: number | null;
  createTime: number;
}

export interface TaskStatusResponse {
  code: number;
  msg: string;
  data: TaskStatusResponseData;
}

export interface ResultJson {
    resultUrls: string[];
}
