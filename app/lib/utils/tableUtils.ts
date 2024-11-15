import { TableDescription } from "@aws-sdk/client-dynamodb";

export interface TableInfo {
  pk: string;
  pkType: "S" | "N" | "B";
  sk?: string;
  skType?: "S" | "N" | "B";
}

export function getTableInfo(table: TableDescription): TableInfo {
  const pk = table.KeySchema!.find(
    (key) => key.KeyType === "HASH",
  )?.AttributeName;
  const pkType = table.AttributeDefinitions!.find(
    (attr) => attr.AttributeName === pk,
  )?.AttributeType;

  let ret: TableInfo = {
    pk: pk!,
    pkType: pkType!,
  };

  const sk = table.KeySchema!.find(
    (key) => key.KeyType === "RANGE",
  )?.AttributeName;
  if (sk) {
    const skType = table.AttributeDefinitions!.find(
      (attr) => attr.AttributeName === sk,
    )?.AttributeType;
    ret = {
      ...ret,
      sk,
      skType: skType!,
    };
  }

  return ret;
}
