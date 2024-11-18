import Editor from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { useRef, useState } from "react";

export default function JSONEditor<Value>({
  value,
  onChange,
}: {
  value?: Value;
  onChange?: (value: Value) => void;
}) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [error, setError] = useState<string | null>(null);
  return (
    <Editor
      height="80vh"
      defaultLanguage="json"
      defaultValue={value ? JSON.stringify(value, null, 2) : ""}
      onMount={(editor, monaco) => (editorRef.current = editor)}
      onChange={(_value) => {
        try {
          const json = _value ? JSON.parse(_value) : {};
          onChange?.(json);
        } catch (e) {}
      }}
      options={{
        minimap: { enabled: false },
        theme: "vs-dark",
      }}
    />
  );
}
