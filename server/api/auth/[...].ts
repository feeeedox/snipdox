import GithubProvider from 'next-auth/providers/github'
import {NuxtAuthHandler} from '#auth'
import {alreadyRegistered, createGitHubUser} from "~/server/actions/user.action";

export default NuxtAuthHandler({
    secret: process.env.AUTH_SECRET || 'my-auth-secret',
    providers: [
        (GithubProvider as any).default({
            clientId: process.env.GITHUB_CLIENT_ID || 'enter-your-client-id-here',
            clientSecret: process.env.GITHUB_CLIENT_SECRET || 'enter-your-client-secret-here',
            issuer: 'https://github.com/login/oauth',
            profile(profile: { id: any; email: any; avatar_url: any; login: any; name: any; }) {
                return {
                    id: profile.id,
                    email: profile.email,
                    image: profile.avatar_url,
                    username: profile.login,
                    name: profile.name || profile.login 
                }
            }
        }),
    ],
    callbacks: {
        async signIn({user}) {
            const userEmail = user?.email || '';

            const sql = usePostgres();

            const [allowedUser] = await sql`
                SELECT email
                FROM allowed_emails
                WHERE email = ${userEmail} LIMIT 1
            `;

            if (await alreadyRegistered(userEmail) && allowedUser) {
                return true;
            }

            if (!allowedUser) {
                return false;
            }

            await createGitHubUser(user as any);
            return true;
        }
    }
})