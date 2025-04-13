// This function is required for static export
export function generateStaticParams() {
  // Since the ID is dynamic and generated at runtime, we'll provide a placeholder
  // The actual content will be loaded from localStorage on the client side
  return [{ id: "placeholder" }]
} 