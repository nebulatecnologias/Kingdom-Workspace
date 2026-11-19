export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <div className="app-scroll">{children}</div>
    </div>
  );
}
