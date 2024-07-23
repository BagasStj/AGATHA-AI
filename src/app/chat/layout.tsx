export default function ChatLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        {children}
      </div>
    )
  }