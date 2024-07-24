'use client'

import { useParams } from 'next/navigation'

export default function ProductDetail() {
  const params = useParams()
  const productId = params?.productId

  if (!productId) {
    return <div>Product not found</div>
  }

  // In a real application, you'd fetch the product details based on the productId
  const product = {
    id: productId,
    name: `Product ${productId}`,
    description: `This is the description for Product ${productId}.`,
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
      <p>{product.description}</p>
    </div>
  )
}