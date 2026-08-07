import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import StoreNavbar from "../../components/store/StoreNavbar";
import ProductImage from "../../components/store/ProductImage";
import { useAuth } from "../../lib/auth";
import { useCart } from "../../lib/cart";
import { apiRequest, ApiError } from "../../lib/api";
import { formatINR, type Category, type Product } from "../../lib/types";
import { AlertIcon, BoxIcon, CartIcon, CheckCircleIcon } from "../../components/icons";

const minPrice = (p: Product) =>
  p.variants.length > 0 ? Math.min(...p.variants.map((v) => v.price)) : null;

export default function StorePage() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    document.title = "Shop — CommerceX";

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [productData, categoryData] = await Promise.all([
          apiRequest<Product[]>("/products"),
          apiRequest<Category[]>("/categories").catch(() => [] as Category[]),
        ]);
        if (cancelled) return;
        setProducts(productData);
        setCategories(categoryData);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Could not load products.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () =>
      activeCategory === "all"
        ? products
        : products.filter((p) =>
            typeof p.category === "object" && p.category !== null
              ? p.category._id === activeCategory
              : p.category === activeCategory,
          ),
    [products, activeCategory],
  );

  const handleQuickAdd = async (p: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/login", { state: { from: `/shop/${p.id}` } });
      return;
    }

    const variant = p.variants.find((v) => v.isActive) ?? p.variants[0];
    if (!variant) return;

    setAdding(p.id);
    setNotice(null);
    try {
      await addItem(variant.id, 1);
      setNotice({ tone: "success", text: `Added “${variant.name}” to your cart` });
    } catch (err) {
      setNotice({ tone: "error", text: err instanceof ApiError ? err.message : "Could not add to cart." });
    } finally {
      setAdding(null);
    }
  };

  const categoryName = (p: Product) =>
    typeof p.category === "object" && p.category !== null ? p.category.name : "";

  return (
    <>
      <StoreNavbar />
      <main className="store-page">
        <div className="container">
          <header className="store-head">
            <div>
              <span className="kicker">CommerceX Store</span>
              <h1>Browse the catalog</h1>
              <p>Fresh products from verified sellers. Add to cart or buy instantly.</p>
            </div>
          </header>

          {notice ? (
            <div className={`alert ${notice.tone === "success" ? "alert-success" : "alert-error"}`} role="status">
              {notice.tone === "success" ? <CheckCircleIcon /> : <AlertIcon />}
              <span>{notice.text}</span>
            </div>
          ) : null}

          {categories.length > 0 ? (
            <div className="chip-row" role="tablist" aria-label="Filter by category">
              <button
                type="button"
                className={`chip ${activeCategory === "all" ? "active" : ""}`}
                onClick={() => setActiveCategory("all")}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c._id}
                  type="button"
                  className={`chip ${activeCategory === c._id ? "active" : ""}`}
                  onClick={() => setActiveCategory(c._id)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          ) : null}

          {loading ? (
            <div className="store-state">
              <span className="spinner" aria-hidden="true" />
              <p>Loading products…</p>
            </div>
          ) : error ? (
            <div className="store-state">
              <AlertIcon />
              <h2>Something went wrong</h2>
              <p>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="store-state">
              <BoxIcon />
              <h2>No products found</h2>
              <p>
                {activeCategory === "all"
                  ? "Sellers haven't listed anything yet. Check back soon."
                  : "Nothing in this category right now."}
              </p>
            </div>
          ) : (
            <div className="store-grid">
              {filtered.map((p) => {
                const price = minPrice(p);
                return (
                  <Link to={`/shop/${p.id}`} className="store-card" key={p.id}>
                    <div className="store-card-media">
                      <ProductImage src={p.images[0]} alt={p.name} fallbackChar={p.name.charAt(0)} />
                      {p.images.length > 1 ? (
                        <span className="img-count">{p.images.length} photos</span>
                      ) : null}
                    </div>
                    <div className="store-card-body">
                      <h3 className="product-name">{p.name}</h3>
                      <div className="product-meta">
                        <span>{categoryName(p)}</span>
                        <span>{p.variants.length} {p.variants.length === 1 ? "option" : "options"}</span>
                      </div>
                      <div className="price-row">
                        <span className="price">
                          {price !== null ? formatINR(price) : "—"}
                          {price !== null && p.variants.length > 1 ? (
                            <span className="price-from"> from</span>
                          ) : null}
                        </span>
                        <button
                          type="button"
                          className="add-btn"
                          title="Add to cart"
                          aria-label={`Add ${p.name} to cart`}
                          onClick={(e) => void handleQuickAdd(p, e)}
                          disabled={adding === p.id}
                        >
                          {adding === p.id ? <span className="spinner" /> : <CartIcon />}
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <span className="footer-tag">CommerceX — shop with confidence.</span>
          <span className="footer-copy">© 2026 CommerceX</span>
        </div>
      </footer>
    </>
  );
}
