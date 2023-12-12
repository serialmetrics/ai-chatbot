"use client";

import React, { useState } from 'react'
import { Button } from './ui/button'
import { IconPlus } from './ui/icons'
import { DocumentDropdown } from './document-dropdown'
import { auth } from '@/auth';
import useSWR from 'swr'
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { UploadCloudIcon } from 'lucide-react';
import UploadFileS3Button from './upload-file-s3-button';
import { fetcher } from '@/lib/utils';
import { DocumentInfo } from '@/lib/types';
import UploadDocS3Button from './upload-doc-s3-button';

interface FetcherType {
    url: string;
    args: any;
}

export function DocumentSelector() {

    const doc_key = process.env.JUSTINA_DOC_KEY ?? 'JUSTINA_DOC_KEY';
    const [currentDocument, setCurrentDocument] = useLocalStorage<string>(doc_key, "==NODOC==");

    const { data: documents, error } = useSWR<DocumentInfo[]>('/api/documents', fetcher)
    const no_docs: DocumentInfo[] = [];

    return (
        <>
            <DocumentDropdown
                documents={documents}
                document={currentDocument || '==NODOC=='}
                setDocument={setCurrentDocument}
            />
            <UploadDocS3Button />
        </>
    )
}

export default DocumentSelector