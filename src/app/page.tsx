import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Dashboard from "./dashboard/page";
import './globals.css'

export default function Home() {
  return (
      <Dashboard/>
      // <div>dsare</div>
    // <div>
    //   <SignedIn>
    //     <UserButton afterSignOutUrl="/" />
    //   </SignedIn>
    //   <SignedOut>
    //     <SignInButton />
    //   </SignedOut>
    // </div>
  )
}