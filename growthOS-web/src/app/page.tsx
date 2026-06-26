import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">GrowthOS</h1>
      <p className="text-gray-500 mb-8">AI-powered personal growth operating system</p>
      <Link
        href="/dashboard"
        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
      >
        Go to Dashboard
      </Link>
    </main>
  )
}
