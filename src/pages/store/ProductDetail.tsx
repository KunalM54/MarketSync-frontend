import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import StoreNavbar from "../../components/store/StoreNavbar";
import ProductImage from "../../components/store/ProductImage";
import QuantityStepper from "../../components/store/QuantityStepper";
import { useAuth } from "../../lib/auth";
import { useCart } from "../../lib/cart";
import { apiRequest, ApiError } from "../../lib/api";
import { payForOrder } from "../../lib/checkout";
import { formatINR, type CheckoutResponse, type Product } from "../../lib/types";
import { AlertIcon, BoltIcon, CartIcon, CheckCircleIcon } from "../../components/icons";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem, refresh: refreshCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState<"add" | "buy" | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiRequest<Product>(`/products/${id}`);
        if (cancelled) return;
        setProduct(data);
        setActiveImage(0);
        const firstVariant = data.variants.find((v) => v.isActive) ?? data.variants[0];
        setSelectedVariantId(firstVariant ? firstVariant.id : null);
        setQuantity(1);
        document.title = `${data.name} — CommerceX`;
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Could not load product.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const variant = useMemo(
    () => product?.variants.find((v) => v.id === selectedVariantId) ?? null,
    [product, selectedVariantId],
  );

  const categoryName =
    product && typeof product.category === "object" && product.category !== null
      ? product.category.name
      : "";
  const brandName =
    product && typeof product.brand === "object" && product.brand !== null
      ? product.brand.name
      : "";

  const requireLogin = () => {
    navigate("/login", { state: { from: `/shop/${product?.id}` } });
    return false;
  };

  const handleAddToCart = async () => {
    if (!user) return requireLogin();
    if (!variant || !product) return;

    setBusy("add");
    setNotice(null);
    try {
      await addItem(variant.id, quantity);
      setNotice({ tone: "success", text: `Added ${quantity} × ${variant.name} to your cart` });
    } catch (err) {
      setNotice({ tone: "error", text: err instanceof ApiError ? err.message : "Could not add to cart." });
    } finally {
      setBusy(null);
    }
  };

  const handleBuyNow = async () => {
    if (!user) return requireLogin();
    if (!variant || !product) return;

    setBusy("buy");
    setNotice(null);
    try {
      const checkout = await apiRequest<CheckoutResponse>("/payment/checkout-direct", {
        method: "POST",
        body: JSON.stringify({ items: [{ variantId: variant.id, quantity }] }),
      });

      await payForOrder(checkout, {
        name: user.name,
        email: user.email,
        contact: user.phone,
      });

      await refreshCart();

      navigate(
        `/checkout/success?order=${checkout.order._id}&payment=${checkout.razorpayOrder.id}&amount=${checkout.order.totalAmount}`,
      );
    } catch (err) {
      setNotice({
        tone: "error",
        text: err instanceof ApiError ? err.message : "Payment could not be completed.",
      });
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <>
        <StoreNavbar />
        <main className="store-page">
          <div className="container">
            <div className="store-state">
              <span className="spinner" aria-hidden="true" />
              <p>Loading product…</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <StoreNavbar />
        <main className="store-page">
          <div className="container">
            <div className="store-state">
              <AlertIcon />
              <h2>Product unavailable</h2>
              <p>{error ?? "This product could not be found."}</p>
              <Link to="/shop" className="btn btn-primary">
                Back to shop
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  const images = product.images.length > 0 ? product.images : [""];

  return (
    <>
      <StoreNavbar />
      <main className="store-page">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to="/shop">Shop</Link>
            {categoryName ? (
              <>
                <span aria-hidden="true">/</span>
                <span className="muted">{categoryName}</span>
              </>
            ) : null}
          </nav>

          <div className="detail-grid">
            {/* Gallery */}
            <div className="gallery">
              <div className="gallery-main">
                <ProductImage
                  src={images[activeImage]}
                  alt={`${product.name} photo ${activeImage + 1}`}
                  fallbackChar={product.name.charAt(0)}
                  className="gallery-img"
                />
                {images.length > 1 ? (
                  <span className="img-count dark">{activeImage + 1} / {images.length}</span>
                ) : null}
              </div>
              {images.length > 1 ? (
                <div className="gallery-thumbs">
                  {images.map((src, i) => (
                    <button
                      type="button"
                      key={i}
                      className={`gallery-thumb ${i === activeImage ? "active" : ""}`}
                      onClick={() => setActiveImage(i)}
                      aria-label={`View photo ${i + 1}`}
                    >
                      <ProductImage src={src} alt="" fallbackChar={product.name.charAt(0)} />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Info */}
            <div className="detail-info">
              <div className="detail-meta">
                {brandName ? <span className="brand-chip">{brandName}</span> : null}
                <span className="cell-muted">{categoryName}</span>
              </div>

              <h1>{product.name}</h1>

              <div className="detail-price">
                {variant ? formatINR(variant.price) : "—"}
                <span className="detail-sku">SKU: {variant?.sku ?? "—"}</span>
              </div>

              {product.description ? <p className="detail-desc">{product.description}</p> : null}

              {product.variants.length > 1 ? (
                <div className="variant-picker">
                  <span className="variant-label">Select option</span>
                  <div className="variant-list">
                    {product.variants.map((v) => (
                      <button
                        type="button"
                        key={v.id}
                        className={`variant-chip ${selectedVariantId === v.id ? "active" : ""}`}
                        onClick={() => {
                          setSelectedVariantId(v.id);
                          setActiveImage(0);
                        }}
                      >
                        <span className="variant-name">{v.name}</span>
                        <span className="variant-price">{formatINR(v.price)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="buy-row">
                <QuantityStepper value={quantity} onChange={setQuantity} />
                <div className="buy-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => void handleAddToCart()}
                    disabled={busy !== null || !variant}
                  >
                    {busy === "add" ? <span className="spinner" /> : <CartIcon />}
                    Add to cart
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => void handleBuyNow()}
                    disabled={busy !== null || !variant}
                  >
                    {busy === "buy" ? <span className="spinner" /> : <BoltIcon />}
                    Buy now
                  </button>
                </div>
              </div>

              {notice ? (
                <div className={`alert ${notice.tone === "success" ? "alert-success" : "alert-error"}`} role="status">
                  {notice.tone === "success" ? <CheckCircleIcon /> : <AlertIcon />}
                  <span>{notice.text}</span>
                </div>
              ) : null}

              <ul className="detail-perks">
                <li><CheckCircleIcon /> Secure payment via Razorpay</li>
                <li><CheckCircleIcon /> Easy returns within 7 days</li>
                <li><CheckCircleIcon /> Ships from verified sellers</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
