import { AttributeValue } from "@aws-sdk/client-dynamodb";
import RecordValue from "./RecordValue";
import clsx from "clsx";

export default function AttributesView({
  ignoreFields,
  item,
}: {
  ignoreFields: Set<string>;
  item: Record<string, AttributeValue>;
}) {
  const keys = Object.keys(item).filter((key) => !ignoreFields.has(key));

  return (
    <table className="table-auto w-full text-sm -mt-px -mb-px">
      <thead>
        <tr>
          {keys.map((key, i) => (
            <th
              key={key}
              className={clsx(
                "border-t-0 border-b-0 text-xs p-1 bg-slate-400",
                {
                  "border-r": i !== keys.length - 1,
                },
              )}
            >
              <div className="w-44">{key}</div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {keys.map((key, i) => (
            <td
              key={key}
              className={clsx(
                "px-1 max-w-44 text-ellipsis overflow-hidden",
                {
                  "border-r": i !== keys.length - 1,
                },
                itemTypeClass(item[key]),
              )}
            >
              <RecordValue value={item[key]} />
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

function itemTypeClass(value: any) {
  switch (typeof value) {
    case "number":
      return "text-right";
    case "boolean":
      return "text-yellow-500";
    case "object":
      return "text-red-500";
    default:
      return "";
  }
}
