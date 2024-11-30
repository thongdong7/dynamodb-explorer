import { App } from "antd";

export default function RecordValueString({ value }: { value: string }) {
  const { modal, message } = App.useApp();
  if (value.length < 40) {
    return value;
  }

  return (
    <span
      className="line-clamp-1 text-gray-500 cursor-pointer"
      title="Click to view full text. Ctrl+Click to copy"
      onClick={async (e) => {
        if (e.ctrlKey) {
          await navigator.clipboard.writeText(value);
          message.success("Copied to clipboard");
          return;
        }

        modal.info({
          content: value,
        });
      }}
    >
      {value}
    </span>
  );
}
