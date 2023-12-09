import { useRef, type RefObject } from 'react'

export function useClickSubmit(): {
    formRef: RefObject<HTMLFormElement>
    onClick: (event: React.MouseEvent<HTMLTextAreaElement>) => void
} {
    const formRef = useRef<HTMLFormElement>(null)

    const handleClick = (
        event: React.MouseEvent<HTMLTextAreaElement>
    ): void => {
        formRef.current?.requestSubmit()
        event.preventDefault()
    }

    return { formRef, onClick: handleClick }
}
