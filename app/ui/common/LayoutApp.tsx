import { App } from "antd";

export default function LayoutApp({ children }: { children: React.ReactNode }) {
  return (
    <App>
      <div className="p-2">{children}</div>
    </App>
  );
}
