import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { auth } from '@/auth';

export default async function IndexPage() {
    const id = nanoid()

    const session = await auth();
    const username = session?.user?.name || '';

    return <Chat id={id} username={username} />
}
