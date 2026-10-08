import { UserProfile } from '../types';
import { isMockMode, getApiBaseUrl } from './api';

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (isMockMode()) {
      // Simulate network latency
      await new Promise((r) => setTimeout(r, 200));

      // Mock user profile
      const user: UserProfile = {
        id: 'usr_fintracker_demo',
        name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Arjun Sharma',
        email,
        monthlyIncome: 65000,
        monthlyExpenses: 38500,
        currentSavings: 148250,
        emergencyFund: 100000,
        riskTolerance: 'Moderate',
      };
      const token = `jwt_mock_${Date.now()}_${btoa(email)}`;
      localStorage.setItem('fintracker_jwt_token', token);
      localStorage.setItem('fintracker_current_user', JSON.stringify(user));
      return { token, user };
    }

    // Real FastAPI JWT login endpoint
    const res = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Invalid login credentials');
    }

    const data = await res.json();
    localStorage.setItem('fintracker_jwt_token', data.access_token);
    localStorage.setItem('fintracker_current_user', JSON.stringify(data.user));
    return { token: data.access_token, user: data.user };
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    if (!name || !email || !password) {
      throw new Error('All fields are required');
    }

    if (isMockMode()) {
      await new Promise((r) => setTimeout(r, 250));
      const user: UserProfile = {
        id: `usr_${Date.now()}`,
        name,
        email,
        monthlyIncome: 65000,
        monthlyExpenses: 38500,
        currentSavings: 148250,
        emergencyFund: 100000,
        riskTolerance: 'Moderate',
      };
      const token = `jwt_mock_${Date.now()}_${btoa(email)}`;
      localStorage.setItem('fintracker_jwt_token', token);
      localStorage.setItem('fintracker_current_user', JSON.stringify(user));
      return { token, user };
    }

    const res = await fetch(`${getApiBaseUrl()}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Registration failed');
    }

    const data = await res.json();
    localStorage.setItem('fintracker_jwt_token', data.access_token);
    localStorage.setItem('fintracker_current_user', JSON.stringify(data.user));
    return { token: data.access_token, user: data.user };
  },

  logout(): void {
    localStorage.removeItem('fintracker_jwt_token');
    localStorage.removeItem('fintracker_current_user');
  },

  getCurrentUser(): UserProfile | null {
    try {
      const raw = localStorage.getItem('fintracker_current_user');
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    // Default demo session if none set
    return {
      id: 'usr_fintracker_demo',
      name: 'Arjun Sharma',
      email: 'arjun.sharma@fintracker.ai',
      monthlyIncome: 65000,
      monthlyExpenses: 38500,
      currentSavings: 148250,
      emergencyFund: 100000,
      riskTolerance: 'Moderate',
    };
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('fintracker_jwt_token') || !!localStorage.getItem('fintracker_current_user');
  },
};
