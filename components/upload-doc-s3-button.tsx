import { useS3Upload } from "@/hooks/use-s3-upload";
import { useState } from "react";
import { IconSpinner } from "./ui/icons";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { Button } from "./ui/button";
import { UploadCloudIcon } from "lucide-react";
import useSWR from "swr";
import toast from "react-hot-toast";
import { digestMessage } from "@/lib/utils";


export default function UploadDocS3Button() {

    // fetcher function
    async function fetcher<JSON = any>(
        [url, payload]: [string, any],
    ): Promise<JSON> {
        if (!payload.url) {
            return {} as JSON;
        }
        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                url: payload.url,
                upload_key: await digestMessage(payload.url, 'upload:'),

            })
        });
        if (!res.ok) {
            const json = await res.json()
            if (json.error) {
                const error = new Error(json.error) as Error & {
                    status: number
                }
                error.status = res.status
                throw error
            } else {
                throw new Error('An unexpected error occurred')
            }
        }
        const result = await res.json();
        // console.log('fetcher result:', result);
        if (result.status && result.progress) {
            if (result.data) {
                // we got the document key
                setJustinaKey(result.data);
                setMemraKey('');
                setUploading(false);
                const msg = result.data === '==NODOC==' ? 'Failed to prepare document' : 'Document prepared!';
                toast.success(msg, {
                    id: 'document_upload',
                    duration: 10000
                });
            } else {
                // we got the progress
                toast.loading(`${result.progress}% ${result.status}`, {
                    id: 'document_upload',
                    duration: 300000
                });
            }
        }
        return result;
    }

    const [memraKey, setMemraKey] = useState("");
    const [uploading, setUploading] = useState(false);

    const { data, error } = useSWR(
        ['/api/ingest', { url: memraKey }],
        fetcher,
        { refreshInterval: (data) => data ? 1000 : 5000 }
    );

    let { FileInput, openFileDialog, uploadToS3 } = useS3Upload();

    const doc_key = process.env.JUSTINA_DOC_KEY ?? 'JUSTINA_DOC_KEY';
    const [justina_key, setJustinaKey] = useLocalStorage<string>(doc_key, "");

    let handleFileChange = async (file: File) => {
        setUploading(true);
        console.log('handleFileChange started:', file.name);
        toast.loading('Uploading document...', {
            id: 'document_upload',
            duration: 100000
        });
        // await new Promise(r => setTimeout(r, 3000));
        const { url } = await uploadToS3(file);
        console.log('handleFileChange ended:', url);
        setMemraKey(url);
    };

    return (
        <>
            <Button
                variant="outline"
                size="icon"
                onClick={openFileDialog}
            >
                {!uploading && <UploadCloudIcon />}
                {uploading && <IconSpinner />}
            </Button>
            <FileInput
                id="fileInput"
                disabled={uploading}
                onChange={handleFileChange}
            />
        </>
    )
}
