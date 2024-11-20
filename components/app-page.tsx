'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Book {
  id: string
  title: string
  authors: string[]
  isbn: string
  thumbnail: string
  location: string
  ownerId?: string
}

export function BlockPage() {
  const [books, setBooks] = useState<Book[]>([])

  useEffect(() => {
    fetch('http://localhost:3001/books')
      .then(response => response.json())
      .then(data => setBooks(data))
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Books</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map(book => (
          <div key={book.id} className="border rounded-lg p-4 shadow-md">
            <div className="flex items-center mb-4">
              <Image
                src={book.thumbnail || '/placeholder.png'}
                alt={book.title}
                width={80}
                height={120}
                className="object-cover mr-4"
              />
              <div>
                <h2 className="text-xl font-semibold">{book.title}</h2>
                <p className="text-gray-600">{book.authors.join(', ')}</p>
              </div>
            </div>
            <p><strong>ISBN:</strong> {book.isbn}</p>
            <p><strong>Location:</strong> {book.location}</p>
            {book.ownerId && <p><strong>Owner ID:</strong> {book.ownerId}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}