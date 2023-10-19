import NextAuth, { type DefaultSession } from 'next-auth'
import GitHub from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'

declare module 'next-auth' {
    interface Session {
        user: {
            /** The user's id. */
            id: string
        } & DefaultSession['user']
    }
}

const users = [
    { id: '1', email: 'nvrhood@gmail.com', name: 'Sergei Podushkin', password: 'FUN$$$4Trump2St8OnDumm' },
    { id: '2', email: 'theresa@gmail.com', name: 'Theresa Garsia', password: 'IBuyCar4MyWife2GoNature&liveIn10t' },
    { id: '3', email: 'amir@gmail.com', name: 'Amir Behbehani', password: 'TeslaStocksHit1k$,andGo2Sky' },
]

const credentials = CredentialsProvider({
    name: 'Credentials',
    credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'email' },
        password: { label: 'Password', type: 'password' }
    },
    async authorize(credentials, req) {
        // Add logic here to look up the user from the credentials supplied
        // const user = { id: '1', name: 'J Smith', email: 'jsmith@example.com' }

        const found = users.filter((e) => {e.email == credentials.email})
        if (found && found.length == 1 && found[0].password === credentials.password) {
            return found[0]
        } else {
            return null
        }
    }
})

export const {
    handlers: { GET, POST },
    auth,
    CSRF_experimental // will be removed in future
} = NextAuth({
    providers: [
        GitHub,
        credentials
    ],
    callbacks: {
        jwt({ token, profile }) {
            if (profile) {
                token.id = profile.id
                token.image = profile.avatar_url || profile.picture
            }
            return token
        },
        authorized({ auth }) {
            return !!auth?.user // this ensures there is a logged in user for -every- request
        }
    },
    // pages: {
    //     signIn: '/sign-in', // overrides the next-auth default signin page https://authjs.dev/guides/basics/pages
    //     signOut: '/sign-out',
    //     newUser: '/sign-up'
    // }
})
