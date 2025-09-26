export default function ContactButton({ className = "", size = "default" }) {
  const sizeClasses = {
    small: "px-3 py-2 text-sm",
    default: "px-4 py-2 text-sm",
    large: "px-6 py-3 text-base"
  };

  return (
    <a
      href="mailto:bigmboards@gmail.com"
      className={`inline-flex items-center justify-center text-center ${sizeClasses[size]} font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${className}`}
    >
      Contact
    </a>
  );
}
