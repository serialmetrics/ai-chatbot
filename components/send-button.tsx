import { Button } from "./ui/button"
import { IconRefresh, IconSend, IconStop } from "./ui/icons"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"

interface SendButtonProps {
    inputIsEmpty: boolean
    isLoading: boolean
    hasMessages: boolean
    send: () => void
    stop: () => void
    reload: () => void
}

const SendButton = ({
    inputIsEmpty, isLoading, hasMessages, send, stop, reload
}: SendButtonProps) => {
    return (
        <>
            {isLoading ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size="icon"
                            onClick={() => stop()}
                        >
                            <IconStop />
                            <span className="sr-only">Stop generating</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Stop generating</TooltipContent>
                </Tooltip>
            ) : (
                hasMessages && inputIsEmpty ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => reload()}
                            >
                                <IconRefresh />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Regenerate response</TooltipContent>
                    </Tooltip>
                ) : (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="submit"
                                size="icon"
                                onClick={() => send()}
                                disabled={isLoading || inputIsEmpty}
                            >
                                <IconSend />
                                <span className="sr-only">Send message++</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Send message www</TooltipContent>
                    </Tooltip>
                )
            )}

        </>
    )
}

export default SendButton