'use client'

import React, { useState, useEffect, useRef } from 'react'

export default function ReadAloudText() {
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null)
  const text =
    'This is a sample sentence to demonstrate speech synthesis highlighting.'
  const [wordPositions, setWordPositions] = useState<
    { word: string; start: number; end: number }[]
  >([])
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    // 各単語とその開始・終了位置を取得（句読点・空白含む正確な位置）
    const regex = /\b\w+['-]?\w*\b/g
    const matches = Array.from(text.matchAll(regex))
    const wordsWithPos = matches.map((match) => {
      const word = match[0]
      const start = match.index ?? 0
      const end = start + word.length
      return { word, start, end }
    })
    setWordPositions(wordsWithPos)
  }, [text])

  const handleSpeak = () => {
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        console.log(event.charIndex);
        const charIndex = event.charIndex

        const matchIndex = wordPositions.findIndex(
          (w) => charIndex >= w.start && charIndex < w.end
        )

        if (matchIndex !== -1) {
          setHighlightIndex(matchIndex)
        } else {
          setHighlightIndex(null)
        }
      }
    }

    utterance.onend = () => {
      setHighlightIndex(null)
    }

    utteranceRef.current = utterance
    speechSynthesis.speak(utterance)
  }

  return (
    <div className="p-6">
      <div className="text-xl flex flex-wrap gap-1 mb-4">
        {wordPositions.map((w, i) => (
          <span
            key={i}
            className={
              i === highlightIndex
                ? 'text-blue-600 font-bold transition-all'
                : ''
            }
          >
            {w.word}
          </span>
        ))}
      </div>
      <button
        onClick={handleSpeak}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        🔊 Read Aloud
      </button>
    </div>
  )
}
