import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Dashboard from "./dashboard/page";

export default function Home() {
  return (
    <Dashboard/>
  )
}