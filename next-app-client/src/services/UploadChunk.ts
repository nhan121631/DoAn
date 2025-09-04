import { API_URL } from "./Constant";

// API Response Types
interface InitResponse {
  uploadId: string;
  chunkSize?: number;
}

interface StatusResponse {
  chunks?: number[];
}

interface UploadChunkParams {
  uploadId: string;
  chunkIndex: number;
  totalChunks: number;
  filename: string;
  blob: Blob;
  chunkHash?: string;
}

interface CompleteResponse {
  success: boolean;
  fileUrl?: string;
  message?: string;
}

interface UploadChunkResponse {
  success: boolean;
  chunkIndex: number;
  message?: string;
}

const API = {
  init: async (filename: string, totalChunks: number, totalSize: number, fileHash?: string): Promise<InitResponse> => {
    const body = {
      filename,
      totalChunks,
      totalSize,
      ...(fileHash && { fileHash }),
    };

    const r = await fetch(`${API_URL}/upload/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error('init failed');
    return r.json() as Promise<InitResponse>;
  },

  status: async (uploadId: string): Promise<StatusResponse> => {
    const r = await fetch(`${API_URL}/upload/status?uploadId=${encodeURIComponent(uploadId)}`);
    if (!r.ok) throw new Error('status failed');
    return r.json() as Promise<StatusResponse>;
  },

  uploadChunk: async (params: UploadChunkParams): Promise<UploadChunkResponse> => {
    const { uploadId, chunkIndex, totalChunks, filename, blob, chunkHash } = params;

    const form = new FormData();
    form.append('uploadId', uploadId);
    form.append('chunkIndex', String(chunkIndex));
    form.append('totalChunks', String(totalChunks));
    form.append('filename', filename);
    form.append('chunk', blob);
    if (chunkHash) form.append('chunkHash', chunkHash);

    let attempt = 0;
    while (true) {
      try {
        const r = await fetch(`${API_URL}/upload/chunk`, { method: 'POST', body: form });
        if (!r.ok) throw new Error(`chunk ${chunkIndex} failed ${r.status}`);
        return r.json();
      } catch (e) {
        attempt++;
        if (attempt >= 3) throw e;
        await new Promise((res) => setTimeout(res, 500 * 2 ** (attempt - 1)));
      }
    }
  },

  complete: async (uploadId: string, filename: string, fileHash: string, roomId: string): Promise<CompleteResponse> => {
    const body = {
      uploadId,
      filename,
      fileHash,
      roomId,
    };

    const r = await fetch(`${API_URL}/upload/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error('complete failed');
    
    const result = await r.json() as CompleteResponse;
    
    // Call cleanup API after successful completion
    try {
      await API.cleanup(uploadId);
    } catch (cleanupError) {
      console.warn('Cleanup failed, but upload was successful:', cleanupError);
      // Don't throw error as the main upload was successful
    }
    
    return result;
  },

  cleanup: async (uploadId: string): Promise<{ message: string; uploadId: string; deletedFiles?: number }> => {
    const r = await fetch(`${API_URL}/upload/cleanup?uploadId=${encodeURIComponent(uploadId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!r.ok) throw new Error('cleanup failed');
    return r.json();
  },
};

export default API;