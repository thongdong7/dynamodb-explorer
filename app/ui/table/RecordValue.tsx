import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { values } from "lodash";

export default function RecordValue({ value }: { value?: AttributeValue }) {
  if (typeof value === "undefined") {
    return <div className="text-orange-900">undefined</div>;
  }
  if (value.S) {
    return (
      <div className="text-green-600" title={value.S as string}>
        {value.S}
      </div>
    );
  }
  if (value.N) {
    return <div title={value.N}>{value.N}</div>;
  }
  if (value.B) {
    return <div>{value.B}</div>;
  }
  if (value.BOOL) {
    return <div>{value.BOOL}</div>;
  }
  if (value.NULL) {
    return <div>null</div>;
  }
  if (value.L) {
    return <div>{JSON.stringify(value.L)}</div>;
  }
  if (value.M) {
    return <div>{JSON.stringify(value.M)}</div>;
  }

  return <div>{JSON.stringify(value)}</div>;
}
