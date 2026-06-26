import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">GrowthOS</h1>
      <p className="text-gray-500 mb-8">AI-powered personal growth operating system</p>
      <SignedOut>
        <SignInButton mode="modal">
          <button className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800">
            Get Started
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <div className="flex items-center gap-4">
          <UserButton />
          <a href="/dashboard" className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800">
            Go to Dashboard
          </a>
        </div>
      </SignedIn>
    </main>
  )
}
