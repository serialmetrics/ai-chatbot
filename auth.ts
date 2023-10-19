import NextAuth, { getServerSession, type DefaultSession } from "next-auth";
// import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
    interface Session {
        user: {
            /** The user's id. */
            id: string;
        } & DefaultSession["user"];
    }
}

const users = [
    {
        id: "1",
        email: "nvrhood@gmail.com",
        name: "Sergei Podushkin",
        password: "FUN$$$4Trump2St8OnDumm",
    },
    {
        id: "2",
        email: "theresa@gmail.com",
        name: "Theresa Garsia",
        password: "IBuyCar4MyWife2GoNature&liveIn10t",
    },
    {
        id: "3",
        email: "amir@gmail.com",
        name: "Amir Behbehani",
        password: "TeslaStocksHit1k$,andGo2Sky",
    },
];

export const authOptions = {
    providers: [
        // GitHubProvider({
        //     clientId: process.env.GITHUB_ID as string,
        //     clientSecret: process.env.GITHUB_SECRET as string,
        // }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // Add logic here to look up the user from the credentials supplied
                // const user = { id: '1', name: 'J Smith', email: 'jsmith@example.com' }

                console.log('Credentials:', credentials)
                const found = users.filter((e) => e.email === credentials?.email);
                console.log('Found:', found)
                if (
                    found &&
                    found.length == 1 &&
                    found[0].password === credentials?.password
                ) {
                    return found[0];
                } else {
                    return null;
                }
            },
        }),
    ],
};

export const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

export const auth = getServerSession;