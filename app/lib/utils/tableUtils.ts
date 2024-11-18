import { TableDescription } from "@aws-sdk/client-dynamodb";

export interface TableInfo {
  name: string;
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
    name: table.TableName!,
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

export function tableInfoKeyQueryString(
  tableInfo: TableInfo,
  item: Record<string, any>,
) {
  const params = new URLSearchParams();
  params.append(tableInfo.pk, item[tableInfo.pk]);
  if (tableInfo.sk) {
    params.append(tableInfo.sk, item[tableInfo.sk]);
  }
  return params.toString();
}
