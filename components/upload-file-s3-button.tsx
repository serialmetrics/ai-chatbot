"use client"

import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import { IconSpinner, IconVercel } from "./ui/icons";
import { useS3Upload } from "@/hooks/use-s3-upload";
import { useState } from "react";

export default function UploadFileS3Button() {
    const [uploading, setUploading] = useState(false);

    let { FileInput, openFileDialog, uploadToS3 } = useS3Upload();

    let handleFileChange = async (file: File) => {
        setUploading(true)
        let { url } = await uploadToS3(file);
        console.log('handleFileChange ended:', url);
        setUploading(false)
    };

    return (
        <>
            <label htmlFor="fileInput" className={`cursor-pointer ${cn(buttonVariants())}`}>
                {!uploading && <IconVercel className="mr-2 cursor-pointer" />}
                {uploading && <IconSpinner className="mr-2 cursor-pointer" />}
                <span
                    className="hidden sm:block"
                    onClick={openFileDialog}
                >{uploading ? 'Uploading...' : 'Upload Documents'}</span>
                <span
                    className="sm:hidden"
                    onClick={openFileDialog}
                >{uploading ? 'Uploading...' : 'Upload'}</span>
            </label>
            <FileInput disabled={uploading} onChange={handleFileChange} />
        </>
    );
}
