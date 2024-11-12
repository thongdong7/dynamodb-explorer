import { AttributeValue } from "@aws-sdk/client-dynamodb";
import RecordValue from "./RecordValue";

export default function AttributesView({
  ignoreFields,
  item,
}: {
  ignoreFields: Set<string>;
  item: Record<string, AttributeValue>;
}) {
  const keys = Object.keys(item).filter((key) => !ignoreFields.has(key));
  return (
    <table className="border-collapse table-auto w-full text-sm -mt-px -mb-px">
      <thead>
        <tr>
          {keys.map((key) => (
            <th
              key={key}
              className="border border-t-0 border-b-0 text-xs p-1 bg-slate-400"
            >
              {key}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {keys.map((key) => (
            <td key={key} className="border px-1">
              <RecordValue value={item[key]} />
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}
