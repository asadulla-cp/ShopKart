const CATEGORIES = ["All Categories", "Electronics", "Fashion", "Books", "Home", "Sports", "Beauty"];

export default function SearchBar({ search, category, sort, onSearchChange, onCategoryChange, onSortChange }) {
  return (
    <div className="search-bar-wrapper">
      {/* Search input */}
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search products..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search products"
        />
        {search && (
          <button
            className="search-clear"
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category dropdown */}
      <select
        className="category-select"
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        aria-label="Filter by category"
      >
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat === "All Categories" ? "" : cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* Sort dropdown */}
      <select
        className="sort-select"
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        aria-label="Sort products"
      >
        <option value="">Sort: Default</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  );
}
