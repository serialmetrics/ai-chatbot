"use client";

import React, { useEffect, useState } from 'react'
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
import { useLocalStorageWatcher } from '@/hooks/use-localstorage-watcher';

interface FetcherType {
    url: string;
    args: any;
}

export function DocumentSelector() {

    const doc_key = process.env.JUSTINA_DOC_KEY ?? 'JUSTINA_DOC_KEY';
    // const [currentDocument, setCurrentDocument] = useLocalStorage<string>(doc_key, "==NODOC==");
    const [currentDocument, setCurrentDocument] = useLocalStorageWatcher(doc_key, "==NODOC==");

    useEffect(() => {
        const handleStorageChange = () => {
            window.removeEventListener('localStorageChange', handleStorageChange);
            setCurrentDocument(JSON.parse(localStorage.getItem(doc_key) || '') || '==NODOC==');
            window.addEventListener('localStorageChange', handleStorageChange);
        };

        window.addEventListener('localStorageChange', handleStorageChange);

        return () => {
            window.removeEventListener('localStorageChange', handleStorageChange);
        };
    }, []);

    const { data: documents, error } = useSWR<DocumentInfo[]>(
        '/api/documents',
        fetcher,
        { refreshInterval: 5000 }
    );
    const no_docs: DocumentInfo[] = [];

    return (
        <>
            <DocumentDropdown
                documents={documents}
                curDocument={currentDocument || '==NODOC=='}
                setDocument={setCurrentDocument}
            />
            <UploadDocS3Button />
        </>
    )
}

export default DocumentSelector