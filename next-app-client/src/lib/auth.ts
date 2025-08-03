/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { NextAuthOptions, Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import NextAuth from "next-auth";

interface UserType {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  accessToken: string;
  refreshToken: string;
  roles: string[];
  userProfile: {
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
      },
      authorize: async (credentials) => {
        if (!credentials?.username || !credentials.password) {
          return null;
        }

        const res = await fetch('http://localhost:3333/api/auth/login', {
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
        console.log("API login response:", user); // Log ra dữ liệu trả về

        if (!res.ok) {
          throw new Error("UnAuthorized");
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
          email: user.email,
          avatar: user.avatar,
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
        email: (token.email as string) ?? "",
        avatar: (token.avatar as string) ?? null,
        accessToken: (token.accessToken as string) ?? "",
        refreshToken: (token.refreshToken as string) ?? "",
        roles: token.roles as string[] ?? [],
        userProfile: token.userProfile ?? {},
      };

      session.user = userObject;
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
