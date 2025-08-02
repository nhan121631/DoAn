import apiClient from "../lib/api-client-ad";
import type { IPostType } from "../types/type";

export async function fetchTypePosts() {
    try {
        const response = (await apiClient.get('/post-types')) as IPostType[];
        return response;
    } catch (error) {
        console.error('Error fetching type posts:', error);
        throw error;
    }
}

export async function createTypePost(data: IPostType) {
    try {
        const response = (await apiClient.post('/post-types', data)) as IPostType;
        return response;
    } catch (error) {
        console.error('Error creating type post:', error);
        throw error;
    }
}

export async function deleteTypePost(id: string) {
    try {
        const response = (await apiClient.patch(`/post-types/delete/${id}`)) as { message: string };
        return response;
    } catch (error) {
        console.error('Error deleting type post:', error);
        throw error;
    }
}