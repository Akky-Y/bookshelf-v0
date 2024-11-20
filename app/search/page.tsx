"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	// DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

interface Book {
	id: string;
	volumeInfo: {
		title: string;
		authors: string[];
		publishedDate: string;
		industryIdentifiers: { type: string; identifier: string }[];
		imageLinks?: { thumbnail: string };
		description: string;
		publisher: string;
	};
}

export default function SearchPage() {
	const [query, setQuery] = useState("");
	const [books, setBooks] = useState<Book[]>([]);
	const [selectedBook, setSelectedBook] = useState<Book | null>(null);
	const [location, setLocation] = useState("");
	const [error, setError] = useState("");

	const searchBooks = async () => {
		if (!query.trim()) {
			setError("検索条件を入力してください");
			return;
		}
		setError("");
		const response = await fetch(
			`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`,
		);
		const data = await response.json();
		setBooks(data.items || []);
	};

	const addBook = async () => {
		if (!selectedBook || !location) return;

		const bookData = {
			title: selectedBook.volumeInfo.title,
			authors: selectedBook.volumeInfo.authors,
			isbn:
				selectedBook.volumeInfo.industryIdentifiers?.find(
					(id) => id.type === "ISBN_13",
				)?.identifier || "",
			thumbnail: selectedBook.volumeInfo.imageLinks?.thumbnail || "",
			location,
		};

		await fetch("http://localhost:3001/books", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(bookData),
		});

		setSelectedBook(null);
	};

	return (
		<div>
			<h1 className="text-3xl font-bold mb-6">Search Books</h1>
			<div className="flex gap-4 mb-6">
				<Input
					type="text"
					placeholder="Enter title or ISBN"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className="flex-grow"
				/>
				<Button onClick={searchBooks}>Search</Button>
			</div>
			{error && <p className="text-red-500 mb-4">{error}</p>}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{books.map((book) => (
					<Card key={book.id}>
						<CardContent className="p-4">
							<div className="flex items-center mb-4">
								<Image
									src={
										book.volumeInfo.imageLinks?.thumbnail || "/placeholder.png"
									}
									alt={book.volumeInfo.title}
									width={80}
									height={120}
									className="object-cover mr-4"
								/>
								<div>
									<h2 className="text-xl font-semibold">
										{book.volumeInfo.title}
									</h2>
									<p className="text-gray-600">
										{book.volumeInfo.authors?.join(", ")}
									</p>
									<p className="text-gray-500">
										{book.volumeInfo.publishedDate}
									</p>
								</div>
							</div>
							<Button onClick={() => setSelectedBook(book)}>Select</Button>
						</CardContent>
					</Card>
				))}
			</div>
			<Dialog open={!!selectedBook} onOpenChange={() => setSelectedBook(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{selectedBook?.volumeInfo.title}</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4">
						<Image
							src={
								selectedBook?.volumeInfo.imageLinks?.thumbnail ||
								"/placeholder.png"
							}
							alt={selectedBook?.volumeInfo.title || ""}
							width={200}
							height={300}
							className="object-cover mx-auto"
						/>
						<p>
							<strong>ISBN:</strong>{" "}
							{
								selectedBook?.volumeInfo.industryIdentifiers?.find(
									(id) => id.type === "ISBN_13",
								)?.identifier
							}
						</p>
						<p>
							<strong>Authors:</strong>{" "}
							{selectedBook?.volumeInfo.authors?.join(", ")}
						</p>
						<p>
							<strong>Published:</strong>{" "}
							{selectedBook?.volumeInfo.publishedDate}
						</p>
						<p>
							<strong>Publisher:</strong> {selectedBook?.volumeInfo.publisher}
						</p>
						<p>
							<strong>Description:</strong>{" "}
							{selectedBook?.volumeInfo.description}
						</p>
						<Select onValueChange={setLocation}>
							<SelectTrigger>
								<SelectValue placeholder="Select location" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="bookshelf">本棚</SelectItem>
								<SelectItem value="owner">所有者</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<DialogFooter>
						<Button onClick={() => setSelectedBook(null)}>Cancel</Button>
						<Button onClick={addBook}>Add Book</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
