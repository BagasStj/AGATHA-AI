import Link from 'next/link'

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <nav className="bg-gray-100 p-4 mb-4">
        <Link href="/product" className="text-blue-500 hover:underline">
          Back to Product List
        </Link>
      </nav>
      {children}
    </div>
  )
}