import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Button } from './ui/button'
import { FileSearch, XSquareIcon } from 'lucide-react'
import { DocumentInfo } from '@/lib/types'

interface DocumentDropdownProps {
    documents: DocumentInfo[] | undefined
    document: string
    setDocument: (key: string) => void
}

export const DocumentDropdown = ({
    documents, document, setDocument
}: DocumentDropdownProps) => {

    const currentDocument = documents && documents.find(
        doc => doc.pdf_key === `${document}:pdf_file`
    );
    
    const shortTitle = (title: string) => {
        if (title.length > 30) {
            return title.slice(0, 60) + '...'
        }
        return title
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <div
                        className="relative max-h-5 flex-1 select-none overflow-hidden text-ellipsis break-all"
                        title={currentDocument?.file_name}
                    >
                        <span className="whitespace-nowrap">
                            {shortTitle(currentDocument?.file_name || 'Select document')}
                        </span>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-100">
                <DropdownMenuLabel>Documents</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    {documents && documents.map((doc) => (
                        <DropdownMenuItem
                            key={doc.pdf_key}
                            onClick={() => setDocument(doc.pdf_key.split(':')[0])}
                        >
                            <FileSearch className="mr-2 h-4 w-4" />
                            <div>{doc.file_name}</div>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => setDocument('==NODOC==')}
                >
                    <XSquareIcon className="mr-2 h-4 w-4" />
                    <span>Reset document</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
