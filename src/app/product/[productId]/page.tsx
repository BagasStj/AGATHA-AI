'use client'

import { useParams } from 'next/navigation'
import { LemonSqueezyCheckout } from '@/components/LemonSqueezyCheckout'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ProductDetail() {
  const params = useParams()
  const productId = 316769
  if (!productId) {
    return <div className="flex items-center justify-center h-screen">Product not found</div>
  }

  // In a real application, you'd fetch the product details based on the productId
  const product = {
    id: productId,
    name: `Product ${productId}`,
    description: `This is the description for Product ${productId}. It's an amazing product with many features.`,
    variantId: '459680', // Replace with actual variant ID
    price: '$99.99',
    features: ['Feature 1', 'Feature 2', 'Feature 3'],
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="bg-gray-100 p-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-4xl font-bold text-gray-800">Product AI Retail</CardTitle>
            <Badge variant="secondary" className="text-lg bg-blue-500 text-white p-2 rounded">IDR 10,000.00</Badge>
          </div>
          <CardDescription className="text-lg mt-2 text-gray-600">{product.description}</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="text-2xl font-semibold mb-4 text-gray-700">Key Features:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            {product.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="flex justify-between items-center bg-gray-100 p-4">
          <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white">Learn More</Button>
          <LemonSqueezyCheckout 
            variantId={product.variantId}
            custom={{ product_id: product.id.toString() }}
            buttonText="Buy Now"
          />
        </CardFooter>
      </Card>
    </div>
  )
}