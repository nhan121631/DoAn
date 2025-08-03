/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NavigateFunction } from 'react-router';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import apiClient from '../lib/api-client-ad';
import type { UserProfile } from '../types/type';
export interface LoggedInUser {
  id: string;
  username: string;
  isActive: number;
  roles: string[];
  userProfile: UserProfile;
}
export interface AuthState {
  access_token?: string;
  refresh_token?: string;
  loggedInUser?: LoggedInUser;
  loading: boolean;
  // isAccessDined?: boolean; // Optional property for access denial
  error: any;
  login: ({ username, password, navigate }: { username: string; password: string; navigate: NavigateFunction }) => Promise<void>;
  logOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => {
        return {
          access_token: undefined,
          refresh_token: undefined,
          loggedInUser: undefined,
          loading: false,
          error: null,
          login: async ({ username, password, navigate }) => {
            try {
              set(
                {
                  loggedInUser: undefined,
                  access_token: undefined,
                  refresh_token: undefined,
                  error: null,
                  loading: true,
                },
                false,
                { type: '@AUTH/LOGIN/LOADING' }
              );

              const response: any = (await apiClient.post('/auth/login', { username, password })) as any;
              set(
                {
                  access_token: response.accessToken,
                  refresh_token: response.refreshToken,
                  loggedInUser: {
                    id: response.id,
                    username: response.username,
                    isActive: response.isActive,
                    roles: response.roles,
                    userProfile: response.userProfile,
                  },
                  loading: false,
                  error: null,
                },
                false,
                { type: '@AUTH/LOGIN/SUCCESS' }
              );
              if (!response.roles.includes('Administrators')) {
                set({ access_token: undefined, refresh_token: undefined, loggedInUser: undefined, error: "You do not have permission to access admin area." });
                navigate('/login');
                return Promise.reject("You do not have permission to access admin area.");
              } else {
                navigate('/admin');
              }
            } catch (error) {
              set({ error, access_token: undefined, refresh_token: undefined, loggedInUser: undefined }, false, {
                type: '@AUTH/LOGIN/ERROR',
              });
            }
          },

          logOut: async () => {
            set({ access_token: undefined, refresh_token: undefined, loggedInUser: undefined });
          },

        };
      },
      {
        name: 'auth-storage',
      }
    )
  )
);