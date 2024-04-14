/* global chrome */
import React from 'react';
import {OpenAIChatApi } from './openai.js';

const { useState, useEffect, useRef } = React;


function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [threadId, setThreadId] = useState(null);
    const [assistantId, setAssistantId] = useState(null);
    const [lastMessageDate, setLastMessageDate] = useState(null);

    const [apiKey, setApiKey] = useState('');
    const [openAIChatApi, setOpenAIChatApi] = useState(null);
    const [waitingForResponse, setWaitingForResponse] = useState(false);

    const textareaRef = useRef(null);
    const [sendOnEnter, setSendOnEnter] = useState(false);
    let userApiKey = null;
    chrome.runtime.sendMessage({"message": "getKey"}, function(response) {
        if(response.apiKey) {
            userApiKey = response.apiKey;
            console.log("got key from background.js in App.js", userApiKey);
        }
    });

    // Initialize Assistant and Thread
    useEffect(() => {
        console.log(userApiKey);  // api key from the storage
        console.log('Initializing Assistant and Thread...');
        console.log("calling getKey from sidepanel");
        if(userApiKey) {
            setApiKey(userApiKey)
            const api = new OpenAIChatApi(userApiKey);
            setOpenAIChatApi(api);

            api.createAssistant().then(assistant => {
                setAssistantId(assistant.id);
                return api.createThread();
            }).then(thread => {
                    setThreadId(thread.id);
                }).catch(console.error);
        } {
            console.log("could not get key");
        }

    }, []);
    useEffect(() => {
        if (!waitingForResponse) {
            textareaRef.current.focus();
        }
    }, [waitingForResponse]);


    const sendMessage = async () => {
        if (!input.trim() || !threadId) return;
        try {
            setWaitingForResponse(true);
            const messageResponse = await openAIChatApi.sendMessageToThread(threadId, input);
            const newLastMessageDate = messageResponse.created_at;

            console.log(`User Message created at: ${newLastMessageDate}`);
            setMessages(prevMessages => [...prevMessages, {
                role: 'user',
                content: input,
                created_at: newLastMessageDate
            }]);
            setInput('');

            // Directly set the last message date in state
            setLastMessageDate(newLastMessageDate);

            const runStatus = await openAIChatApi.createRunAndPollStatus(threadId, assistantId);
            if(runStatus.status === "completed") {
                // Directly pass the new last message date to fetchMessages
                fetchMessages(threadId, newLastMessageDate);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setWaitingForResponse(false);
        }
    };

        const fetchMessages = async (threadId, lastMessageDateParam) => {
    try {
        const fetchedMessages = await openAIChatApi.fetchMessages(threadId);
        const sortedMessages = fetchedMessages.data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        const newMessages = lastMessageDateParam ?
                sortedMessages.filter(msg => new Date(msg.created_at) > new Date(lastMessageDateParam)) :
                sortedMessages;

        const extractedMessages = newMessages.map(msg => ({
            role: msg.role,
            content: msg.content.map(contentPiece => contentPiece.text ? contentPiece.text.value : '').join('\n'),
            created_at: msg.created_at
        }));

        setMessages(prevMessages => [...prevMessages, ...extractedMessages]);

        if(extractedMessages.length) {
            const lastNewMessageDate = extractedMessages[extractedMessages.length - 1].created_at;
            setLastMessageDate(lastNewMessageDate);
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
};

        return (
    <div style={{ height: '80vh' }} className="p-4 max-w-md mx-auto overflow-hidden flex flex-col">
        <div className="border-b-2 border-gray-300 p-2" style={{ fontSize: "24px" }}>👊 Brow, The Browser Bro.</div>
        <div className="overflow-auto p-2 space-y-2 flex-1" style={{ maxHeight: 'calc(100vh - 150px)' }}>
            {messages.map((msg, index) => (
                // Render each message. For multiline messages, split by '\n' and wrap each line in a <div>.
                <div key={index} className={`rounded p-1 ${msg.role === 'user' ? 'bg-blue-200' : 'bg-green-200'}`}>
                    {/* Display multiline messages properly */}
                    {msg.content.split('\n').map((line, lineIndex) => (
                        <div key={lineIndex}>{line}</div> // Each line of the message is wrapped in a separate <div>
                    ))}
                </div>
            ))}
        </div>
        <div>
            {waitingForResponse && <div className="text-gray-500 mt-2">Brow is typing...</div>}
            <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                    if (sendOnEnter) {
                        if (e.key === 'Enter' && !e.shiftKey) { sendMessage(); e.preventDefault(); }
                    } else {
                        if (e.key === 'Enter' && e.shiftKey) { sendMessage(); e.preventDefault(); }
                    }
                }}
                disabled={waitingForResponse} // Disabled state based on sending status
                className={`border p-2 w-full resize-none ${waitingForResponse ? 'bg-gray-300' : 'bg-white'}`} // Styling for the text area
                placeholder="Type a message..."
                rows="3"
            ></textarea>
            <div className="flex justify-between items-center px-2 py-2">
                <button onClick={sendMessage} disabled={waitingForResponse} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Send
                </button>
                <div className="flex items-center">
                    <label className="flex items-center space-x-2">
                        <span>Press Enter to send message</span>
                        <input
                            type="checkbox"
                            checked={sendOnEnter}
                            onChange={e => setSendOnEnter(e.target.checked)}
                        />
                    </label>
                </div>
            </div>
        </div>
    </div>
);
}

export default App;

