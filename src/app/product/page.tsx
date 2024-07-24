import Link from 'next/link'

export default function ProductList() {
  // This is a mock product list. In a real application, you'd fetch this data from an API or database
  const products = [
    { id: 1, name: 'Product 1' },
    { id: 2, name: 'Product 2' },
    { id: 3, name: 'Product 3' },
  ]

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Product List</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id} className="mb-2">
            <Link href={`/product/${product.id}`} className="text-blue-500 hover:underline">
              {product.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}