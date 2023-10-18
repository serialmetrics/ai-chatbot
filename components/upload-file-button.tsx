'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { buttonVariants } from './ui/button'
import { IconVercel } from './ui/icons'

const UploadFileButton = () => {

    const fileUpload = async (file: File | undefined) => {
        if (!file) return
        console.log(`Uploading ${file.name} ...`)

        try {
            const data = new FormData()
            data.set('file', file)

            const res = await fetch('/api/file', {
                method: 'POST',
                body: data
            })
            // handle the error
            if (!res.ok) throw new Error(await res.text())
            console.log(`File ${file.name} uploaded successfully!`)
            console.log('File upload endpoint responded with:', await res.json())
        } catch (e: any) {
            // Handle errors here
            console.error(e)
        }
    }

    const handleFileSelection = async (e: any) => {
        const file = e.target.files?.[0]
        await fileUpload(file)
    }

    return (
        <>
            <label htmlFor="fileInput" className={cn(buttonVariants())}>
                <IconVercel className="mr-2" />
                <span className="hidden sm:block">Upload Documents</span>
                <span className="sm:hidden">Upload</span>
            </label>
            <input
                type="file"
                id="fileInput"
                accept=".pdf"
                onChange={handleFileSelection}
                style={{ display: 'none' }}
            />
        </>
    )
}

export default UploadFileButton
