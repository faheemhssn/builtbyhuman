import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'

export default function App() {
  return (
    <div>
      <header style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>BuiltByHuman</h1>
        <div>
          <SignedOut>
            <SignInButton mode="modal" />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>

      <main style={{ padding: '32px' }}>
        <SignedOut>
          <p>Sign in to start scanning websites for AI-generated code.</p>
        </SignedOut>
        <SignedIn>
          <p>You're signed in! The scan form will go here.</p>
        </SignedIn>
      </main>
    </div>
  )
}