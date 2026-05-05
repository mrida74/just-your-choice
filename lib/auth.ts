import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { mongoClient } from "./mongodb";
import { User } from "./models/User";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(mongoClient),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/auth/error",
  },

  callbacks: {
    async signIn({ user, account }) {
      if (!user.email || !account) {
        return false;
      }

      try {
        // Check if user exists
        let existingUser = await User.findOne({ email: user.email });

        if (existingUser) {
          // User exists, update OAuth ID based on provider
          if (account.provider === "google") {
            existingUser.googleId = account.providerAccountId;
            if (user.image) existingUser.image = user.image;
          } else if (account.provider === "facebook") {
            existingUser.facebookId = account.providerAccountId;
            if (user.image) existingUser.image = user.image;
          }
          existingUser.last_login = new Date();
          await existingUser.save();
        } else {
          // Create new user (omit phone since it will be provided later)
          const newUser = await User.create({
            email: user.email,
            name: user.name || user.email.split("@")[0],
            role: "customer",
            auth_method: account.provider,
            image: user.image,
            googleId: account.provider === "google" ? account.providerAccountId : undefined,
            facebookId: account.provider === "facebook" ? account.providerAccountId : undefined,
            account_created_at: new Date(),
            last_login: new Date(),
            verified: false, // Can enable later if needed
          });
          user.id = newUser._id.toString();
        }

        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        return false;
      }
    },

    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = "customer";
      }
      return session;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = "customer";
        token.auth_method = account?.provider;
      }
      return token;
    },

    async redirect({ url, baseUrl }) {
      // Redirect to checkout if coming from checkout page
      if (url.startsWith(`${baseUrl}/checkout`)) {
        return `${baseUrl}/checkout`;
      }
      // Redirect to home otherwise
      return baseUrl;
    },
  },

  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Refresh session daily
  },

  events: {
    async signIn({ user }) {
      console.log(`User signed in: ${user.email}`);
    },
    async signOut() {
      console.log("User signed out");
    },
  },

  // Security settings
  useSecureCookies: process.env.NODE_ENV === "production",
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
