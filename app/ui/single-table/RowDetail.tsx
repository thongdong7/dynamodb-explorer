import { AttributeValue } from "@aws-sdk/client-dynamodb";
import RecordValue from "../table/view/RecordValue";

export default function RowDetail({
  obj,
  ignoreFields,
}: {
  obj: Record<string, AttributeValue>;
  ignoreFields: Set<string>;
}) {
  return (
    <ul>
      {Object.keys(obj)
        .filter((key) => !ignoreFields.has(key))
        .map((key) => (
          <li key={key}>
            {key}: <RecordValue value={obj[key]} />
          </li>
        ))}
    </ul>
  );
}
