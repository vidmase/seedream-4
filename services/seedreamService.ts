import { API_BASE_URL } from '../constants';
import type { CreateTaskPayload, CreateTaskResponse, TaskStatusResponse } from '../types';

const API_KEY = '3fbe07898dc7d86e836d9d274b15cd1a';

const handleResponse = async <T,>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ msg: 'Unknown error', code: response.status }));
    throw new Error(errorData.msg || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const createTask = async (payload: CreateTaskPayload): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API key is not configured. Please set the API_KEY environment variable.");
  }
  
  const response = await fetch(`${API_BASE_URL}/jobs/createTask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const data: CreateTaskResponse = await handleResponse(response);
  if (data.code !== 200 || !data.data.taskId) {
      throw new Error(data.msg || 'Failed to create task.');
  }
  return data.data.taskId;
};

export const getTaskStatus = async (taskId: string): Promise<TaskStatusResponse> => {
   if (!API_KEY) {
    throw new Error("API key is not configured. Please set the API_KEY environment variable.");
  }

  const response = await fetch(`${API_BASE_URL}/jobs/recordInfo?taskId=${taskId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
    },
  });
  
  const data: TaskStatusResponse = await handleResponse(response);
  if(data.code !== 200){
      throw new Error(data.msg || 'Failed to get task status.');
  }
  return data;
};