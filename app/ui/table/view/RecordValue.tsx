import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { ReactNode } from "react";

export default function RecordValue({
  value,
}: {
  value?: AttributeValue | string;
}): ReactNode {
  if (typeof value === "undefined") {
    return <center className="text-gray-300">-</center>;
  }

  if (typeof value === "string") {
    return value;
  }

  if (value.S) {
    return <span style={{ color: "#CE9178" }}>{value.S}</span>;
  }
  if (value.N) {
    return (
      <span title={value.N} style={{ color: "#B5CEA8" }}>
        {value.N}
      </span>
    );
  }
  if (value.B) {
    return <span style={{ color: "#569CD6" }}>{value.B}</span>;
  }
  if (value.BOOL) {
    return <span style={{ color: "#569CD6" }}>{value.BOOL}</span>;
  }
  if (value.NULL) {
    return <span style={{ color: "#569CD6" }}>null</span>;
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
