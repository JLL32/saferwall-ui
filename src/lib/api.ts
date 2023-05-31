import { env } from "$env/dynamic/public";
import { browser } from "$app/environment";

import type { APIFile } from "./types/files";
import type APISummary from "./types/summary";
import type {
    Activity, User, Session,
    ChangePasswordData, LoginData, RegisterData, UpdateProfileData, UpdateEmailData, UpdatePasswordData
} from "./types";

export type APIConfig = {
    url: string;
}

export class APIClient {
    private authorization: string | undefined;
    private apiConfig: APIConfig = {
        url: `${env.PUBLIC_API_URL}`
    }

    constructor(session?: Session) {
        if (session && session.token) {
            this.authorization = `Bearer ${session.token}`;
        }
    }

    private cacheRequest(init: RequestInit): RequestInit {
        if (browser) {
            init.cache = "force-cache";
        }

        return init;
    }

    private setAuthHeaders(init: RequestInit): RequestInit {
        if (this.authorization) {
            init.headers = {
                ...init.headers,
                'Authorization': this.authorization
            }
        }

        return init;
    }

    public async request<T>(endpoint: string, cache: boolean = false, args: any = {}): Promise<T> {
        const url = `${this.apiConfig.url}/${endpoint}`;
        const init: RequestInit = {
            headers: {
                "Content-Type": "application/json"
            },
            ...args,
        };

        if (cache) {
            this.cacheRequest(init);
        }

        this.setAuthHeaders(init);

        const response: any = await fetch(url, init);

        if (!response.ok) {
            throw response;
        }

        return response.json();
    }

    public async getActivities(): Promise<Activity[]> {
        return this.request<Activity[]>(`users/activities?per_page=10`);
    }

    public async getFileStatus(hash: string): Promise<number> {
        return this.request<{ status: number }>(`files/${hash}?fields=status`, false)
            .then(res => res.status);
    }
    public async uploadFile(file: File): Promise<APIFile> {
        const data: any = new FormData();
        data.append('file', file);

        return this.request<APIFile>(`files/`, false, {
            method: 'POST',
            headers: {
                'Content-Length': file.size
            },
            body: data
        })

    }

    public async getFile(hash: string): Promise<APIFile> {
        return this.request<APIFile>(`files/${hash}`, true);
    }

    public async getFileMeta(hash: string): Promise<APIFile> {
        return this.request<APIFile>(`files/${hash}?fields=first_seen,submissions,sha256,last_scanned,multiav,file_format,pe.meta,liked`);
    }

    public async getFileSummary(hash: string): Promise<APIFile & APISummary> {
        return this.request<APIFile & APISummary>(`files/${hash}/summary`);
    }

    public async getUser(username: string): Promise<User> {
        return this.request<User>(`users/${username}`, true);
    }

    public async followUser(username: string, follow: boolean = true): Promise<unknown> {
        const type = follow ? 'follow' : 'unfollow';

        return this.request<unknown>(`users/${username}/${type}`, false, {
            method: 'POST'
        });
    }

    public async likeFile(hash: string, like: boolean = true): Promise<unknown> {
        const type = like ? 'like' : 'unlike';

        return this.request<unknown>(`files/${hash}/${type}`, false, {
            method: 'POST'
        });
    }

    public async singIn(data: LoginData): Promise<Session> {
        return this.request<Session>('auth/login', false, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    public async signUp(data: RegisterData): Promise<Session> {
        return this.request<Session>('users/', false, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    public async sendConfirmation(email: string): Promise<Session> {
        return this.request<Session>('auth/resend-confirmation', false, {
            method: 'POST',
            body: JSON.stringify({
                email
            })
        });
    }

    public async resetPassword(email: string): Promise<Session> {
        return this.request<Session>('auth/reset-password', false, {
            method: 'POST',
            body: JSON.stringify({
                email
            })
        });
    }

    public async changePassword(data: ChangePasswordData): Promise<Session> {
        return this.request<Session>('auth/password', false, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    public async updateProfile(data: UpdateProfileData): Promise<Session> {
        return this.request<Session>(`users/${data.username}`, false, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    public async updateEmail(data: UpdateEmailData): Promise<Session> {
        return this.request<Session>(`users/${data.username}/email`, false, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    public async updatePassword(data: UpdatePasswordData): Promise<Session> {
        return this.request<Session>(`users/${data.username}/password`, false, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    public async deleteAccount(username: string): Promise<any> {
        return this.request<any>(`users/${username}`, false, {
            method: 'DELETE',
        });
    }

    public async logOut(): Promise<any> {
        return this.request('auth/logout', false, {
            method: 'DELETE'
        });
    }
}
