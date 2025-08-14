import { useState } from 'react'

export default function SearchBar({ onSearch, withFocusHandlers = false }) {
    const [query, setQuery] = useState('')
    const [isFocused, setIsFocused] = useState(false)

    const handleSearch = (e) => {
        e.preventDefault()
        onSearch(query)
    }

    const focusProps = withFocusHandlers
        ? {
            onFocus: () => setIsFocused(true),
            onBlur: () => setTimeout(() => setIsFocused(false), 200),
        }
        : {}

    return (
        <div className="mb-6">
            <form onSubmit={handleSearch} className="relative">
                <input
                    type="text"
                    placeholder="Search documentation..."
                    className={`w-full px-5 py-3.5 rounded-xl border-2 bg-white/90 border-pink-100 text-gray-800 placeholder-gray-500
                        focus:outline-none transition-all duration-200 shadow-sm
                        ${isFocused ? 'border-pink-300 shadow-pink-100 shadow-md ring-4 ring-pink-100/50' : 'hover:border-pink-200'}`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    {...focusProps}
                />
                <button
                    type="submit"
                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-all
                        text-gray-500 hover:text-pink-500 hover:bg-pink-50
                        ${isFocused ? '!text-pink-500' : ''}`}
                    aria-label="Search"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </button>
            </form>
        </div>
    )
}