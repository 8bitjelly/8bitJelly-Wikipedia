import { useState } from 'react'

export default function SearchBar({ onSearch, withFocusHandlers = false, darkMode = false }) {
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
        <div className="mb-4">
            <form onSubmit={handleSearch} className="relative">
                <input
                    type="text"
                    placeholder="Search documentation..."
                    className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        darkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500'
                            : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500 focus:ring-purple-400'
                    } ${isFocused ? 'ring-2 ring-purple-400' : ''}`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    {...focusProps}
                />
                <button
                    type="submit"
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                        darkMode ? 'text-gray-400 hover:text-purple-400' : 'text-gray-500 hover:text-purple-500'
                    } transition-colors`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
            </form>
        </div>
    )
}