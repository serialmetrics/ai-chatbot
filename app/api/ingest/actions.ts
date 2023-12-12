import kv from "@/lib/redis";

export async function getUploadActions(upload_key: string) {
    try {
        // we need only last item of the list
        const upload_actions: string | null = await kv.get(upload_key);

        if (!upload_actions) {
            return null;
        }
        return JSON.parse(upload_actions);
    } catch (error) {
        return null;
    }
}