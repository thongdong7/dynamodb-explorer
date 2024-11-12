import { AttributeValue } from "@aws-sdk/client-dynamodb";

export default function RecordValue({ value }: { value?: AttributeValue }) {
  if (typeof value === "undefined") {
    return <span className="text-orange-900">undefined</span>;
  }
  if (value.S) {
    return (
      <span className="truncate" title={value.S as string}>
        {value.S}
      </span>
    );
  }
  if (value.N) {
    return <span title={value.N}>{value.N}</span>;
  }
  if (value.B) {
    return <span>{value.B}</span>;
  }
  if (value.BOOL) {
    return <span>{value.BOOL}</span>;
  }
  if (value.NULL) {
    return <span>null</span>;
  }
  if (value.L) {
    return <span>{JSON.stringify(value.L)}</span>;
  }
  if (value.M) {
    return <span>{JSON.stringify(value.M)}</span>;
  }

  return <span>{JSON.stringify(value)}</span>;
}

export function getValue(value: AttributeValue) {
  if (value.S) {
    return value.S;
  }
  if (value.N) {
    return value.N;
  }
  if (value.B) {
    return value.B;
  }
  if (value.BOOL) {
    return value.BOOL;
  }
  if (value.NULL) {
    return null;
  }
  if (value.L) {
    return value.L;
  }
  if (value.M) {
    return value.M;
  }

  return value;
}
