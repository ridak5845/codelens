export default function ErrorBanner({ message }) {
  return (
    <div className="error-banner">
      <strong>⚠ Something went wrong.</strong> {message}
    </div>
  );
}