import apiClient from "../lib/api-client-ad";
import type { IPostType } from "../types/type";

export async function fetchTypePosts() {
    try {
        const response = (await apiClient.get('/type-posts')) as IPostType[];
        return response;
    } catch (error) {
        console.error('Error fetching type posts:', error);
        throw error;
    }
}