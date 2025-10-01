import 'server-only'

import {
  createAI,
  getMutableAIState,
  getAIState,
  streamUI,
  createStreamableValue
} from 'ai/rsc'
import { openai } from '@ai-sdk/openai'
import {
  spinner,
  BotCard,
  BotMessage,
  SystemMessage,
  Stock,
  Purchase
} from '@/components/stocks' // Updated import to include EditableReportDisplay

import { nanoid } from '@/lib/utils'
import { saveChat } from '@/app/actions'
import { Chat, Message } from '@/lib/types'
import { auth } from '@/auth'

import { SpinnerMessage, UserMessage } from '@/components/stocks/message'

async function submitUserMessage(content: string, files?: File[]) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  if (files && files.length > 0) {
    console.log('Processing files:', files)
    for (const file of files) {
      if (file.type === 'application/pdf') {
        console.log(`Processing PDF file: ${file.name}`)
        // Limit file size (e.g., 5 MB per file)
        const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
        if (file.size > MAX_FILE_SIZE) {
          throw new Error(`File ${file.name} exceeds the 5 MB size limit.`)
        }

        const arrayBuffer = await file.arrayBuffer()
        const { summary, pageCount, processedPages } =
          await processPDF(arrayBuffer)
        allContent += `\n\nSummary from ${file.name}:\n${summary}`
      }
    }
  }

  // Update the state with the user's message
  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content
      }
    ]
  })

  let finalReport = '' // To accumulate the final report content
  let isFinalReport = false // Flag to detect if it's the final report
  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
  let textNode: undefined | React.ReactNode

  // Process the user's message and generate the bot response
  const result = await streamUI({
    model: openai('gpt-4'),
    initial: <SpinnerMessage />,
    system: `You are a friendly and helpful assistant helping users create a report. T
    he report should include sections like Introduction, Objectives, Methodology, Results, and Conclusion.
    Interact with the user in a casual and engaging manner.
    Ask open-ended questions to gather information for each section, and make the conversation enjoyable.
    If the user mentions wanting to include media (like images, audio, or video), 
    apologize and inform them that this feature isn't available right now.
    If the user wants to skip a question or doesn't have information for a section, 
    they can type 'skip' or 'I prefer not to answer', and you should move on to the next section.
    After gathering enough information, generate a detailed report (at least 100 words) using the information provided, and present it to the user.

Remember to make the conversation flow naturally, and avoid sounding robotic.
`,
    messages: [
      ...aiState.get().messages.map((message: any) => ({
        role: message.role,
        content: message.content,
        name: message.name
      }))
    ],
    text: ({ content, done, delta }) => {
      if (!textStream) {
        textStream = createStreamableValue('')
        textNode = <BotMessage content={textStream.value} />
      }

      // Check if the content contains the final report marker
      if (
        content.includes('FINAL REPORT:') ||
        content.includes('FINAL_REPORT:')
      ) {
        console.log('Detected FINAL REPORT:', content)
        isFinalReport = true // Set the flag that we are processing the final report
      }

      // If it's the final report, accumulate the content
      if (isFinalReport) {
        finalReport += delta
        if (done) {
          textStream.done()

          // Clean up the final report marker
          finalReport = finalReport.replace(/FINAL[_ ]REPORT:/, '').trim()

          // Add the final report as a message in the AI state
          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: finalReport
              }
            ]
          })

          // Render the final report in the textarea UI
          return <EditableReportDisplay content={finalReport} />
        }
      } else {
        // For intermediate messages, continue streaming them normally
        textStream.update(delta)

        if (done) {
          textStream.done()
          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content
              }
            ]
          })
          console.log('Intermediate message done:', content)
        }
      }

      return textNode
    }
  })

  return {
    id: nanoid(),
    display: result.value
  }
}

export type AIState = {
  chatId: string
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode
}[]

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
  onGetUIState: async () => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const aiState = getAIState() as Chat

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState)
        return uiState
      }
    } else {
      return
    }
  },
  onSetAIState: async ({ state, done }) => {
    'use server'

    if (!done) return

    const session = await auth()
    if (!session || !session.user) return

    const { chatId, messages } = state

    const createdAt = new Date()
    const userId = session.user.id as string
    const path = `/chat/${chatId}`

    const firstMessageContent = messages[0].content as string
    const title = firstMessageContent.substring(0, 100)

    const chat: Chat = {
      id: chatId,
      title,
      userId,
      createdAt,
      messages,
      path
    }

    await saveChat(chat)
  }
})

function EditableReportDisplay({ content }: { content: string }) {
  console.log('content in editable report', content)
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Generated Report</h2>
      <textarea
        defaultValue={content} // Use defaultValue to set the initial content
        rows={15} // Increased rows for better viewability
        className="w-full p-2 border rounded-md shadow-sm"
      />
      <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
        Save Report
      </button>
    </div>
  )
}

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter(message => message.role !== 'system')
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === 'user' ? (
          <UserMessage>{message.content as string}</UserMessage>
        ) : message.role === 'assistant' &&
          typeof message.content === 'string' ? (
          message.content.startsWith('FINAL REPORT:') ||
          message.content.startsWith('FINAL_REPORT:') ? (
            <EditableReportDisplay
              content={message.content.replace(/FINAL[_ ]REPORT:/, '').trim()}
            />
          ) : (
            <BotMessage content={message.content} />
          )
        ) : null
    }))
}
