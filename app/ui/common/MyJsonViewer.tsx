import JsonView from "@uiw/react-json-view";
import { darkTheme } from "@uiw/react-json-view/dark";

// gray-950
darkTheme.backgroundColor = "#030712";

export default function MyJsonViewer({ value }: { value: any }) {
  return (
    <div className="p-4 bg-gray-950 rounded">
      <JsonView
        value={value}
        displayDataTypes={false}
        displayObjectSize={false}
        style={darkTheme}
        shortenTextAfterLength={0}
      />
    </div>
  );
}
