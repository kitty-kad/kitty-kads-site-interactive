export default function SideMenuButton({ onClick, title, active }) {
  return (
    <button
      className={`btn btn-custom btn-lg ${active ? "active" : ""} `}
      onClick={onClick}
    >
      {title}
    </button>
  );
}
