import {
    ClerkProvider,
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton
} from '@clerk/nextjs'

export default function LoginPage() {
    return (
        <ClerkProvider>
            <div>
                <SignedOut>
                    <SignInButton />
                </SignedOut>
                <SignedIn>
                    <UserButton />
                </SignedIn>
                <h1>Login Page Content</h1>
            </div>
        </ClerkProvider>
    )
}