import { BoxIcon } from "../icons";

export default function ModulePlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div className="module-empty">
      <span className="module-empty-ico">
        <BoxIcon />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      <span className="pill">Coming soon</span>
    </div>
  );
}
