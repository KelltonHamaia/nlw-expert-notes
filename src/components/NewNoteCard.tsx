import { ChangeEvent, FormEvent, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import * as Dialog from "@radix-ui/react-dialog"

type onNoteCreated = {
    onNoteCreated: (content: string) => void
}

let speechRecognition: SpeechRecognition | null = null;

export const NewNoteCard = ({ onNoteCreated }: onNoteCreated) => {

    const [shouldShowOnBoarding, setShouldShowOnBoarding] = useState<boolean>(true);
    const [content, setContent] = useState('');
    const [isRecording, setIsRecording] = useState(false);

    const handleStartEditor = () => {
        setShouldShowOnBoarding(false)
    }

    const handleContentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setContent(event.target.value);
        if (event.target.value === "") {
            setShouldShowOnBoarding(true)
        }

    }

    const handleSaveNote = (event: FormEvent) => {

        if (content === "") return;

        event.preventDefault();
        onNoteCreated(content);
        setContent("");
        setShouldShowOnBoarding(true)
        toast.success("Nota criada com sucesso!")
    }

    const handleStartRecording = () => {

        const isSpeechrecognitionApiAvaliable = "SpeechRecognition" in window || "webkitSpeechRecognition" in window

        if (!isSpeechrecognitionApiAvaliable) {
            alert("Unfortunally your browser does not support the Speech recognition api :( ")
            return
        }

        setIsRecording(true);
        setShouldShowOnBoarding(false)

        const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition

        speechRecognition = new SpeechRecognitionApi()
        speechRecognition.lang = "pt-BR"
        speechRecognition.continuous = true
        speechRecognition.maxAlternatives = 1
        speechRecognition.interimResults = true

        speechRecognition.onresult = (event) => {
            const transcription = Array.from(event.results).reduce((text, result) => {
                return text.concat(result[0].transcript)
            }, "")

            setContent(transcription);
        }

        speechRecognition.onerror = (event) => {
            console.error(event)
        }


        speechRecognition.start()
    }

    const handleStopRecording = () => {
        setIsRecording(false)
        if (speechRecognition !== null) {
            speechRecognition.stop()
        }
    }


    return (
        <Dialog.Root>
            <Dialog.Trigger className="flex flex-col gap-3 p-5 text-left rounded-md outline-none bg-slate-700 hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400">
                <span className="text-sm font-medium text-slate-200">Adicionar nota</span>

                <p className="text-sm leading-6 text-slate-400">
                    Grave uma nota em áudio que será convertida para texto automaticamente.
                </p>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50">
                    <Dialog.Content className="absolute z-10 md:-translate-x-1/2 overflow-hidden inset-0 md:inset-auto md:-translate-y-1/2 md:left-1/2 md:top-1/2 max-w-[640px] md:h-[60vh] w-full bg-slate-700 md:rounded-md flex flex-col outline-none">
                        <Dialog.Close className="self-end bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
                            <X className="size-5" />
                        </Dialog.Close>
                        <form className="flex flex-col flex-1" >

                            <div className="flex flex-col flex-1 gap-3 p-5">
                                <span className='font-medium text-small text-slate-300'>
                                    Adicionar nota
                                </span>
                                {shouldShowOnBoarding ? (
                                    <p className='text-sm leading-6 text-slate-400'>
                                        Comece <button type="button" onClick={handleStartRecording} className="font-medium text-lime-400 hover:underline">gravando uma nota em áudio</button>,
                                        ou se preferir <button type="button" onClick={handleStartEditor} className="font-medium text-lime-400 hover:underline">utilize apenas texto</button>.
                                    </p>
                                ) :
                                    <textarea
                                        autoFocus
                                        value={content}
                                        className="flex-1 text-sm leading-6 bg-transparent outline-none resize-none text-slate-400"
                                        onChange={handleContentChange}
                                    />
                                }
                            </div>

                            {isRecording ? (
                                <button
                                    type="button"
                                    onClick={handleStopRecording}
                                    className="flex items-center justify-center w-full gap-2 py-4 text-sm font-medium text-center outline-none bg-slate-900 text-slate-300 hover:text-slate-100"
                                >
                                    <div className="bg-red-500 rounded-full size-3 animate-pulse" />
                                    Gravando (clique para interromper)
                                </button>
                            ) :
                                <button
                                    onClick={handleSaveNote}
                                    type="button"
                                    className="w-full py-4 text-sm font-medium text-center outline-none bg-lime-400 text-lime-950 hover:bg-lime-500"
                                >
                                    Salvar nota

                                </button>}
                        </form>

                    </Dialog.Content>
                </Dialog.Overlay>
            </Dialog.Portal>
        </Dialog.Root>
    );

}
