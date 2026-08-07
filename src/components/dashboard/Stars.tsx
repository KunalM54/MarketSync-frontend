export default function Stars({ rating }: { rating: number }) {
  return (
    <span className="stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= Math.round(rating) ? "on" : ""} aria-hidden="true">
          ★
        </span>
      ))}
      <em>{rating.toFixed(1)}</em>
    </span>
  );
}
