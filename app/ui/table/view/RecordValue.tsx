import { AttributeValue } from "@aws-sdk/client-dynamodb";

function cutString(str: string, length: number) {
  if (str.length > length) {
    return str.slice(0, length) + "...";
  }
  return str;
}

export default function RecordValue({ value }: { value?: AttributeValue }) {
  if (typeof value === "undefined") {
    return <center className="text-gray-300">-</center>;
  }
  if (value.S) {
    return (
      <span className="truncate max-w-28" title={value.S as string}>
        {cutString(value.S, 28)}
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
