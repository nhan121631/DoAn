/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { NextAuthOptions, Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { API_URL } from "@/services/Constant";

interface UserType {
  id: string;
  username: string;
  // email: string;
  // avatar: string | null;
  accessToken: string;
  refreshToken: string;
  roles: string[];
  userProfile: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string | null;
    avatar: string | null;
    isActive: number;
    bankName: string | null;
    binCode: string | null;
    bankNumber: string | null;
    accoutHolderName: string | null;
    address: {
      id: string;
      street: string;
      ward: {
        id: number;
        name: string;
        district: {
          id: number;
          name: string;
          province: {
            id: number;
            name: string;
          };
        };
      };
    };
  };
}

export const authOptions: NextAuthOptions = {
  debug: true,
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Sign in",
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "example",
        },
        password: { label: "Password", type: "password" },
        credential: { label: "Google Credential", type: "text" },
      },
      authorize: async (credentials) => {
        // Đăng nhập thường
        if (credentials?.username && credentials.password) {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const user = await res.json();
          if (!res.ok) {
            // Trả về message lỗi chi tiết cho frontend
            const errorMsg = user?.message?.[0] || user?.errors?.[0] || "UnAuthorized with login";
            throw new Error(errorMsg);
          }
          if (user) {
            return {
              id: user.id,
              username: user.username,
              email: user.userProfile?.email ?? "",
              avatar: user.userProfile?.avatar ?? null,
              accessToken: user.accessToken,
              refreshToken: user.refreshToken,
              roles: user.roles ?? [],
              userProfile: user.userProfile,
            } as UserType;
          }
          return null;
        }
        // Đăng nhập Google
        if (credentials?.credential) {
          const res = await fetch(`${API_URL}/auth/google-login`, {
            method: 'POST',
            body: JSON.stringify({ credential: credentials.credential }),
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const user = await res.json();
          if (!res.ok) {
            // Trả về message lỗi chi tiết cho frontend
            const errorMsg = user?.message?.[0] || user.errors?.[0] || "UnAuthorized with google login";
            throw new Error(errorMsg);
          }
          if (user) {
            return {
              id: user.id,
              username: user.username,
              email: user.userProfile?.email ?? "",
              avatar: user.userProfile?.avatar ?? null,
              accessToken: user.accessToken,
              refreshToken: user.refreshToken,
              roles: user.roles ?? [],
              userProfile: user.userProfile,
            } as UserType;
          }
          return null;
        }
        return null;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }: { token: JWT; user: User }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          username: user.username,
          // email: user.email,
          // avatar: user.avatar,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          roles: user.roles,
          userProfile: user.userProfile,
        };
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      const userObject: UserType = {
        id: token.id as string,
        username: (token.username as string) ?? "",
        // email: (token.email as string) ?? "",
        // avatar: (token.avatar as string) ?? null,
        accessToken: (token.accessToken as string) ?? "",
        refreshToken: (token.refreshToken as string) ?? "",
        roles: token.roles as string[] ?? [],
        userProfile: token.userProfile ?? {},
      };
      session.user = userObject;
      console.log("Session user:", session.user);
      return session;
    },
  },
};

declare module "next-auth" {
  interface User extends UserType {}
}

declare module "next-auth" {
  interface Session {
    user: UserType;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends UserType {}
}
