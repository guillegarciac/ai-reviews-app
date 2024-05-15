"use client"

import React, { useState } from 'react'
import Pusher from 'pusher-js'
import { v4 as uuidv4 } from 'uuid'

const ReviewReply = () => {
    const [input, setInput] = useState('Tanto las instalaciones como el personal estuvieron muy por encima de nuestras expectativas. La ubicación de este hotel es estratégica, en el centro de los lugares que puedes visitar... y si no, el transporte estaba a unos pasos. La única pega fue, que faltaba un desayuno vegano.')
    const [channelName, setChannelName] = useState('')
    const [channel, setChannel] = useState([])
    const [messages, setMessages] = useState('')
    const [metadata, setMetadata] = useState({})
    const [isGenerating, setIsGenerating] = useState(false)
    const [isCopied, setIsCopied] = useState(false)
    const [apiUrl, setApiUrl] = useState('')
    const [jwt, setJwt] = useState('')
    const [smartSnippetTopic, setSmartSnippetTopic] = useState('no vegan breakfast')
    const [smartSnippetReply, setSmartSnippetReply] = useState('We provide vegan breakfast, but you need to tell us in advance.')
    const [signature, setSignature] = useState('Your Syte Hotel Mannheim')
    const [businessType, setBusinessType] = useState('Syte Hotel Mannheim')
    const [replyTo, setReplyTo] = useState('Ingo')
    const [language, setLanguage] = useState(null)

    const generateReviewReply = () => {
        setIsGenerating(true)
        setMessages('')
        setMetadata({})
        fetch(`${apiUrl}/reply/reply-to-feedback-stream?channel_name=${channel}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'access-token': jwt
            },
            body: JSON.stringify({
                input_text: input,
                user_id: '',
                profile_id: '',
                reply_model_id: 'latest-stable-version',
                business_type: businessType,
                tone_of_voice: 1,
                response_length: 1,
                reply_language: language == null ? null : language.toUpperCase(),
                reply_to: replyTo,
                sign_offs: [signature],
                custom_topic_replies: [
                    {
                        custom_reply: smartSnippetReply,
                        review_topic: smartSnippetTopic,
                        id: 0
                    }
                ]
            })
        })
            .then(response => {
                console.log(response)
            })
            .catch(error => {
                console.error(error)
            })
            .finally(() => {
                setIsGenerating(false)
            })
    }

    const formatValue = value => {
        return value.replace(/\n/g, '<br>')
    }

    React.useEffect(() => {
        const pusher = new Pusher('695dc511475504db883e', {
            cluster: 'eu'
        })
        const channel = uuidv4()

        setChannel(channel)

        console.info('ℹ️ Pusher session:', pusher.sessionID)
        console.info('ℹ️ Channel:', channel)

        pusher.bind('message', data => {
            console.info({ 'ℹ️ Incoming stream message': data })
            if (data === '###stream-start###') {
                setMessages('')
                return
            }
            if (data === '###stream-end###') {
                return
            }

            if (/^\s*\d+\s*$/.test(data)) {
                data = ' ' + data
            }
            if (/^\s*-\s/.test(data)) {
                data = '\n' + data
            }
            setMessages(prevMessages => prevMessages + data)
        })

        pusher.bind('metainfo', data => {
            if (data === '###stream-start###') {
                setMetadata({})
                return
            }
            if (data === '###stream-end###') {
                return
            }

            for (const key in data) {
                const value = data[key]
                if (typeof value === 'object') {
                    for (const innerKey in value) {
                        const innerValue = value[innerKey].replaceAll('\n', '<br>')
                        if (!metadata[key]) {
                            setMetadata(prevMetadata => ({ ...prevMetadata, [key]: {} }))
                        }
                        setMetadata(prevMetadata => ({
                            ...prevMetadata,
                            [key]: { ...prevMetadata[key], [innerKey]: innerValue }
                        }))
                    }
                } else {
                    const newValue = value.replaceAll('\n', '<br>')
                    if (!metadata[key]) {
                        setMetadata(prevMetadata => ({ ...prevMetadata, [key]: newValue }))
                    }
                }
            }
        })

        pusher.subscribe(channel)
    }, [])

    return (
        <div className="lg:flex lg:gap-x-8">
            <div>
                <div className="border border-gray-200 rounded mb-6">
                    <h2 className="font-bold uppercase text-xs p-4 bg-gray-50 border-b border-gray-200 rounded-t">
                        Setup step 1
                    </h2>
                    <div className="my-2 p-4">
                        <b className="block font-bold text-xs">API URL</b>
                        <input
                            type="text"
                            value={apiUrl}
                            onChange={e => setApiUrl(e.target.value)}
                            className="bg-gray-50 rounded border border-gray-200 p-2 mt-1 w-full"
                        />
                    </div>
                </div>
                <div className="border border-gray-200 rounded mb-6">
                    <h2 className="font-bold uppercase text-xs p-4 bg-gray-50 border-b border-gray-200 rounded-t">
                        Setup step 2
                    </h2>
                    <div className="my-2 p-4">
                        <b className="block font-bold text-xs">JWT token</b>
                        <p className="text-gray-400 text-xs">(in production generated by app)</p>
                        <input
                            type="text"
                            value={jwt}
                            onChange={e => setJwt(e.target.value)}
                            className="bg-gray-50 rounded border border-gray-200 p-2 mt-1 w-full"
                        />
                    </div>
                </div>
                <div className="border border-gray-200 rounded mb-6">
                    <h2 className="font-bold uppercase text-xs p-4 bg-gray-50 border-b border-gray-200 rounded-t">
                        Smart Snippets (optional)
                    </h2>
                    <div className="my-2 p-4">
                        <b className="block font-bold text-xs">Description of complaint or praise</b>
                        <input
                            type="text"
                            value={smartSnippetTopic}
                            onChange={e => setSmartSnippetTopic(e.target.value)}
                            className="bg-gray-50 rounded border border-gray-200 p-2 mt-1 w-full"
                        />
                        <b className="block font-bold text-xs mt-4">Response snippet</b>
                        <textarea
                            value={smartSnippetReply}
                            onChange={e => setSmartSnippetReply(e.target.value)}
                            rows="3"
                            className="bg-gray-50 rounded border border-gray-200 p-2 w-full h-full mt-1"
                        />
                    </div>
                </div>

                <div className="border border-gray-200 rounded mb-6">
                    <h2 className="font-bold uppercase text-xs p-4 bg-gray-50 border-b border-gray-200 rounded-t">
                        Signature (optional)
                    </h2>
                    <div className="my-2 p-4">
                        <b className="block font-bold text-xs">Personalized signature to end the review</b>
                        <input
                            type="text"
                            value={signature}
                            onChange={e => setSignature(e.target.value)}
                            className="bg-gray-50 rounded border border-gray-200 p-2 mt-1 w-full"
                        />
                    </div>
                </div>

                <div className="border border-gray-200 rounded mb-6">
                    <h2 className="font-bold uppercase text-xs p-4 bg-gray-50 border-b border-gray-200 rounded-t">
                        Business type (optional)
                    </h2>
                    <div className="my-2 p-4">
                        <b className="block font-bold text-xs">What business is being reviewed</b>
                        <input
                            type="text"
                            value={businessType}
                            onChange={e => setBusinessType(e.target.value)}
                            className="bg-gray-50 rounded border border-gray-200 p-2 mt-1 w-full"
                        />
                    </div>
                </div>

                <div className="border border-gray-200 rounded mb-6">
                    <h2 className="font-bold uppercase text-xs p-4 bg-gray-50 border-b border-gray-200 rounded-t">
                        Reply to (optional)
                    </h2>
                    <div className="my-2 p-4">
                        <b className="block font-bold text-xs">Person to address in the reply</b>
                        <input
                            type="text"
                            value={replyTo}
                            onChange={e => setReplyTo(e.target.value)}
                            className="bg-gray-50 rounded border border-gray-200 p-2 mt-1 w-full"
                        />
                    </div>
                </div>

                <div className="border border-gray-200 rounded mb-6">
                    <h2 className="font-bold uppercase text-xs p-4 bg-gray-50 border-b border-gray-200 rounded-t">
                        Language (optional)
                    </h2>
                    <div className="my-2 p-4">
                        <b className="block font-bold text-xs">Which language the reply should be drafted in</b>
                        <select
                            defaultValue={language}
                            onChange={e => setLanguage(e.target.value)}
                            className="bg-gray-50 rounded border border-gray-200 p-2 mt-1 w-full"
                        >
                            <option value="null">Automatic</option>
                            <option value="de">Deutsch</option>
                            <option value="en">Englisch</option>
                            <option value="es">Spanisch</option>
                        </select>
                    </div>
                </div>

                <div className="border border-gray-200 rounded mb-6">
                    <h2 className="font-bold uppercase text-xs p-4 bg-gray-50 border-b border-gray-200 rounded-t">
                        Customer review
                    </h2>
                    <div className="p-4">
                        <textarea
                            cols="80"
                            rows="10"
                            defaultValue={input}
                            onChange={e => setInput(e.target.value)}
                            className="bg-gray-50 rounded border border-gray-200 p-2 mt-1 w-full h-full"
                        ></textarea>
                        <button
                            className="bg-gray-200 border border-gray-700 hover:bg-gray-300 rounded px-2 py-1 mt-2"
                            onClick={generateReviewReply}
                            disabled={isGenerating}
                        >
                            <span>{isGenerating ? 'Generating reply...' : 'Generate review reply 🚀'}</span>
                        </button>
                    </div>
                </div>
            </div>
            <div>
                <div className="border border-gray-200 rounded mb-6">
                    <h2 className="font-bold uppercase text-xs p-4 bg-gray-50 border-b border-gray-200 rounded-t">
                        Output
                    </h2>
                    <div className="p-4">
                        <textarea
                            cols="80"
                            rows="10"
                            defaultValue={messages}
                            className="bg-gray-50 rounded border border-gray-200 p-2 w-full h-full"
                        ></textarea>
                    </div>
                </div>

                <div className="border border-gray-200 rounded mt-4">
                    <h2 className="font-bold uppercase text-xs p-4 bg-gray-50 border-b border-gray-200 rounded-t">
                        Summary
                    </h2>
                    <div className="p-4">
                        {metadata.summary && (
                            <div dangerouslySetInnerHTML={{ __html: metadata.summary }} />
                        )}
                    </div>
                </div>

                <div className="border border-gray-200 rounded mt-4">
                    <h2 className="font-bold uppercase text-xs p-4 bg-gray-50 border-b border-gray-200 rounded-t">
                        Applied Smart Snippets
                    </h2>
                    <div className="p-4">
                        {Object.entries(metadata).map(([key, value]) => {
                            if (typeof value === 'object') {
                                return Object.entries(value).map(([innerKey, innerValue], index) => (
                                    <p key={innerKey}>
                                        <b> Snippet #{parseInt(innerKey) + 1}:</b> <span dangerouslySetInnerHTML={{ __html: formatValue(innerValue) }}></span>
                                    </p>
                                ));
                            }
                            return null;
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReviewReply
