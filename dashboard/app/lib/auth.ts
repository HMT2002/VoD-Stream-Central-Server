import clientPromise from "@/app/lib/mongodb";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// import "@/app/types/next-auth";

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        pass: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        //retrieve user data
        // const client = await clientPromise;
        // const accountsCollection = client
        //   .db(process.env.DB_NAME)
        //   .collection("accounts");
        // const email = credentials?.email;
        // const account = await accountsCollection.findOne({ email });
        // if (!account) {
        //   throw new Error("Invalid account");
        // }
        // if (account.pass !== credentials?.password) {
        //   throw new Error("Invalid password");
        // }
        if (credentials === null) return;
        if (credentials?.email === null && credentials?.pass === null)
          throw new Error("Invalid");
        const res = await fetch("http://localhost:8000/v1/account/singin", {
          method: "POST",
          body: JSON.stringify(credentials),
          headers: { "Content-Type": "application/json" },
        });
        const account = res.json()!;
        if (res.ok && account) {
          return account;
        }
        throw new Error("Invalid");
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      // if (user) {
      //   if (user?.id) token._id = user.id;
      //   if (user?.email) token.email = user.email;
      //   if (user?.name) token.name = user.name;
      //   if (user?.account_type) token.account_type = user.account_type;
      // }
      if (user) {
        token.account_type = user.account_type;
        token.email = user.email;
        token.fullname = user.fullname;
      }
      return token;
    },
    // async session({ session, user }) {
    //   // Modify the session data before sending it to the client
    //   session.user.fullname = user.name ?? undefined;
    //   session.user.email = user.email ?? undefined;
    //   session.user.account_type = user.account_type;
    //   // session.user.fullname = user.fullname; // Assuming 'name' is the property in your user object
    //   // session.user.accountType = user.account_type;
    //   return session;
    // },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider.
      // session.user = token!;
      if (token && session.user) {
        session.user.account_type = token.account_type;
        session.user.email = token.email;
        session.user.fullname = token.fullname;
      }
      return session;
    },
  },
  pages: {
    signIn: "/pages/signin",
  },
};
