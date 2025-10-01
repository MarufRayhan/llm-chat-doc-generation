'use client'

import { useState, useEffect, useCallback } from 'react'
import { useChat } from 'ai/react'
import { useUIState, useActions } from 'ai/rsc'

const predefinedQuestions = [
  'What is the primary function of this robot/machine?',
  'What are the key specifications of the robot/machine?',
  'In what environment will this robot/machine operate?',
  'Are there any safety considerations for this robot/machine?',
  'What are the maintenance requirements for this robot/machine?'
]

export function useRobotQuestionFlow() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [uiState, setUIState] = useUIState()
  const { submitUserMessage } = useActions()
  const { messages, input, handleInputChange, handleSubmit } = useChat()

  const askNextQuestion = useCallback(async () => {
    if (currentQuestionIndex < predefinedQuestions.length) {
      const question = predefinedQuestions[currentQuestionIndex]
      await submitUserMessage(question)
      setCurrentQuestionIndex(prevIndex => prevIndex + 1)
    } else {
      // Generate dynamic question
      const response = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      })
      const data = await response.json()
      await submitUserMessage(data.question)
    }
  }, [currentQuestionIndex, messages, submitUserMessage])

  useEffect(() => {
    if (uiState.length === 0) {
      askNextQuestion()
    }
  }, [uiState, askNextQuestion])

  const handleQuestionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim()) {
      await handleSubmit(e)
      await askNextQuestion()
    }
  }

  return {
    messages: uiState,
    input,
    handleInputChange,
    handleQuestionSubmit
  }
}
