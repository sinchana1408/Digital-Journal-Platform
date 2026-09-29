import {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  CreateEntryInput,
  UpdateEntryInput,
  FilterQueryInput,
  JournalEntry,
  DashboardStats,
  CalendarDayEntry,
  Tag,
  DailyMood,
  UserSafe,
} from '@lumajournal/shared';

const API_BASE = '/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('lumajournal_token');
  }

  setToken(token: string | null): void {
    if (token) {
      localStorage.setItem('lumajournal_token', token);
    } else {
      localStorage.removeItem('lumajournal_token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.details || data.error || 'A network error occurred. Please try again.';
      throw new Error(errorMsg);
    }

    return data as T;
  }

  // --- AUTH ---
  async login(payload: LoginInput): Promise<{ success: boolean; user: UserSafe; token: string }> {
    const res = await this.request<{ success: boolean; user: UserSafe; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(res.token);
    return res;
  }

  async register(payload: RegisterInput): Promise<{ success: boolean; user: UserSafe; token: string }> {
    const res = await this.request<{ success: boolean; user: UserSafe; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(res.token);
    return res;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getMe(): Promise<{ success: boolean; user: UserSafe }> {
    return this.request<{ success: boolean; user: UserSafe }>('/auth/me');
  }

  async forgotPassword(payload: ForgotPasswordInput): Promise<{ success: boolean; message: string; resetToken?: string | null }> {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async resetPassword(payload: ResetPasswordInput): Promise<{ success: boolean; message: string }> {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- ENTRIES ---
  async getEntries(params?: Partial<FilterQueryInput>): Promise<{
    success: boolean;
    data: JournalEntry[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          query.append(k, String(v));
        }
      });
    }
    const qStr = query.toString();
    return this.request(`/entries${qStr ? `?${qStr}` : ''}`);
  }

  async getEntry(id: string): Promise<{ success: boolean; entry: JournalEntry }> {
    return this.request(`/entries/${id}`);
  }

  async createEntry(payload: CreateEntryInput): Promise<{ success: boolean; entry: JournalEntry }> {
    return this.request('/entries', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateEntry(id: string, payload: UpdateEntryInput): Promise<{ success: boolean; entry: JournalEntry }> {
    return this.request(`/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteEntry(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/entries/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleFavorite(id: string): Promise<{ success: boolean; isFavorite: boolean }> {
    return this.request(`/entries/${id}/favorite`, { method: 'POST' });
  }

  async togglePin(id: string): Promise<{ success: boolean; isPinned: boolean }> {
    return this.request(`/entries/${id}/pin`, { method: 'POST' });
  }

  async toggleArchive(id: string): Promise<{ success: boolean; isArchived: boolean }> {
    return this.request(`/entries/${id}/archive`, { method: 'POST' });
  }

  async getCalendar(year: number, month: number): Promise<{ success: boolean; data: CalendarDayEntry[] }> {
    return this.request(`/entries/calendar?year=${year}&month=${month}`);
  }

  // --- TAGS ---
  async getTags(): Promise<{ success: boolean; tags: Tag[] }> {
    return this.request('/tags');
  }

  async createTag(name: string): Promise<{ success: boolean; tag: Tag }> {
    return this.request('/tags', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async deleteTag(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/tags/${id}`, {
      method: 'DELETE',
    });
  }

  // --- MOODS ---
  async getMoods(): Promise<{ success: boolean; moods: DailyMood[] }> {
    return this.request('/moods');
  }

  async logMood(payload: { date: string; mood: string; score?: number; note?: string | null }): Promise<{ success: boolean; mood: DailyMood }> {
    return this.request('/moods', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- DASHBOARD & INSIGHTS ---
  async getDashboard(): Promise<{ success: boolean } & DashboardStats> {
    return this.request('/insights');
  }

  // --- PROFILE & SETTINGS ---
  async updateProfile(payload: { name?: string; bio?: string | null; timezone?: string; avatar?: string | null }): Promise<{ success: boolean; user: UserSafe }> {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async changePassword(payload: { currentPassword: string; newPassword: string; confirmNewPassword: string }): Promise<{ success: boolean; message: string }> {
    return this.request('/profile/password', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async uploadAvatar(file: File): Promise<{ success: boolean; avatarUrl: string; user: UserSafe }> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.request('/profile/avatar', {
      method: 'POST',
      body: formData,
    });
  }

  // --- EXPORT & IMPORT ---
  async exportData(): Promise<any> {
    return this.request('/export');
  }

  async importData(data: any): Promise<{ success: boolean; importedCount: number; message: string }> {
    return this.request('/export', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
