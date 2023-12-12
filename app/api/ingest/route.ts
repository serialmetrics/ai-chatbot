import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server"
import { getUploadActions } from "./actions";

export async function POST(req: NextRequest) {

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return new Response('Unauthorized', {
            status: 401
        })
    }

    const body = await req.json();
    const upload_key = body.upload_key;
    const last_upload_action = await getUploadActions(upload_key);
    // console.log('last_upload_action:', last_upload_action, typeof last_upload_action);

    if (!last_upload_action) {
        const baseURL = process.env.JUSTINA_API_URL ?? 'http://127.0.0.1:8000';
        const ingestURL = `${baseURL}/chat/ingest`;

        const ingest_data = await fetch(
            ingestURL,
            {
                method: 'POST',
                body: JSON.stringify({
                    upload_key: body.upload_key,
                    url: body.url,
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('ingestion API responded:', ingest_data);
    }
    // await new Promise(r => setTimeout(r, 2000));

    return NextResponse.json(last_upload_action);
}