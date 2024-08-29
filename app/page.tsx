import React from 'react'
import Header from './components/Header'
import AIChatHistory from './components/Ref'
import Image from 'next/image'

export default function Home() {
  return (
    <main>
      <h1>Excalidraw Animator</h1>
      <Image src="/favicon.ico" alt="Favicon" width={32} height={32} />
    </main>
  )
}