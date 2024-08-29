import Header from './components/Header'
import AIChatHistory from './components/Ref'

export default function Home() {
  return (
    <main className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 overflow-hidden">
        <AIChatHistory />
      </div>
    </main>
  )
}