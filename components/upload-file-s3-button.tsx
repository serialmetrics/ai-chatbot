"use client"

import { Button, buttonVariants } from "./ui/button";
// import { cn } from "@/lib/utils";
import { IconSpinner, IconVercel } from "./ui/icons";
import { useState } from "react";
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import toast from "react-hot-toast";
import { useS3Upload } from "@/hooks/use-s3-upload";
import { UploadCloudIcon } from "lucide-react";

async function ingestionProgress(
    url: string,
    setUploading: (value: boolean) => void,
    setJustinaKey: (value: string) => void
) {
    const baseURL = process.env.NEXT_PUBLIC_JUSTINA_API_URL ?? 'http://127.0.0.1:8000';
    const ingestURL = `${baseURL}/chat/ingest`;
    fetch(ingestURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ url }),
    })
        .then((response) => {
            if (!response.body) {
                return;
            }
            const reader = response.body.getReader();
            return new ReadableStream({
                start(controller) {
                    const td = new TextDecoder("utf-8");
                    let document_key = '';
                    toast.dismiss();
                    return pump();
                    function pump(): any {
                        return reader.read().then(({ done, value }) => {
                            // When no more data needs to be consumed, close the stream
                            if (done) {
                                controller.close();
                                setUploading(false);
                                if (document_key === '==NODOC==') {
                                    toast.error('Failed to prepare document!', {
                                        id: 'document_upload',
                                        duration: 5000
                                    });
                                } else {
                                    toast.success('Document prepared!', {
                                        id: 'document_upload',
                                        duration: 5000
                                    });
                                }
                                return;
                            }
                            let text = td.decode(value, { stream: true });
                            // console.log('>> decoded:', text);
                            const data = JSON.parse(text);
                            if (data.data) {
                                document_key = data.data.replaceAll('"', '');
                                setJustinaKey(document_key);
                            }
                            toast.loading(`${data.progress}% ${data.status}`, {
                                id: 'document_upload',
                                duration: 500000
                            });
                            return pump();
                        });
                    }
                },
            });
        })
        .catch((err) => {
            console.error('Error:', err);
            setUploading(false)
        });
}

export default function UploadFileS3Button() {

    // const [openDialog, setOpenDialog] = useState(false);
    const [uploading, setUploading] = useState(false);

    let { FileInput, openFileDialog, uploadToS3 } = useS3Upload();

    const doc_key = process.env.JUSTINA_DOC_KEY ?? 'JUSTINA_DOC_KEY';
    const [justina_key, setJustinaKey] = useLocalStorage<string>(doc_key, "");

    let handleFileChange = async (file: File) => {
        setUploading(true);
        console.log('handleFileChange started:', file.name);
        await new Promise(r => setTimeout(r, 3000));
        let { url } = await uploadToS3(file);
        console.log('handleFileChange ended:', url);
        ingestionProgress(url, setUploading, setJustinaKey);
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
    // return (
    //     <>
    //         <label
    //             onClick={openFileDialog}
    //             htmlFor="fileInput"
    //             className={`cursor-pointer ${cn(buttonVariants())}`}
    //         >
    //             {!uploading && <IconVercel className="mr-2 cursor-pointer" />}
    //             {uploading && <IconSpinner className="mr-2 cursor-pointer" />}
    //             <span
    //                 className="hidden sm:block"
    //             >{uploading ? 'Uploading...' : 'Upload Documents'}</span>
    //             <span
    //                 className="sm:hidden"
    //             >{uploading ? 'Uploading...' : 'Upload'}</span>
    //         </label>
    //         <FileInput
    //             id="fileInput"
    //             disabled={uploading}
    //             onChange={handleFileChange}
    //         />
    //     </>
    // );
}
