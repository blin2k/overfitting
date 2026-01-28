const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    const config: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        credentials: 'include',
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Request failed');
    }

    return response.json() as Promise<T>;
}

// Health check
export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
    return request('/api/health');
}

// Resume endpoints
export async function uploadResume(rawText: string): Promise<{ id: string }> {
    return request('/api/resumes', {
        method: 'POST',
        body: { rawText },
    });
}

export async function getResumes(): Promise<{ resumes: unknown[] }> {
    return request('/api/resumes');
}

export async function getResume(id: string): Promise<{ resume: unknown }> {
    return request(`/api/resumes/${id}`);
}

// Job Description endpoints
export async function uploadJobDescription(rawText: string): Promise<{ id: string }> {
    return request('/api/job-descriptions', {
        method: 'POST',
        body: { rawText },
    });
}

export async function getJobDescriptions(): Promise<{ jobDescriptions: unknown[] }> {
    return request('/api/job-descriptions');
}

export async function getJobDescription(id: string): Promise<{ jobDescription: unknown }> {
    return request(`/api/job-descriptions/${id}`);
}

// Generation endpoints
export interface GenerateParams {
    resumeId: string;
    jobDescriptionId: string;
    fittingLevel: number;
}

export async function generateResume(params: GenerateParams): Promise<{ generatedResumeId: string }> {
    return request('/api/generate', {
        method: 'POST',
        body: params,
    });
}

export async function previewResume(params: GenerateParams): Promise<{ preview: string }> {
    return request('/api/generate/preview', {
        method: 'POST',
        body: params,
    });
}

// Export endpoints
export function getPdfDownloadUrl(id: string): string {
    return `${API_URL}/api/generated/${id}/pdf`;
}

export function getTexDownloadUrl(id: string): string {
    return `${API_URL}/api/generated/${id}/tex`;
}

// Gap analysis
export async function getGapAnalysis(id: string): Promise<{ gapAnalysis: unknown }> {
    return request(`/api/generated/${id}/gaps`);
}
