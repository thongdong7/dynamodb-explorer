import { TableDescription } from "@aws-sdk/client-dynamodb";

type FieldType = "S" | "N" | "B";

interface Field {
  name: string;
  type: FieldType;
}

export interface MyAttribute extends Field {
  kind: "pk" | "sk" | "gsiPk" | "gsiSk" | "attribute";
}

interface GSIIndex {
  name: string;
  pk: string;
  pkType: FieldType;
  sk?: string;
  skType?: FieldType;
}

export interface TableInfo {
  name: string;
  pk: string;
  pkType: FieldType;

  // $pk: Field;
  // $sk?: Field;
  attributes: MyAttribute[];

  sk?: string;
  skType?: FieldType;
  gsiIndexes: GSIIndex[];
  ItemCount?: number;
  TableSizeBytes?: number;
}

export function getTableInfo(table: TableDescription): TableInfo {
  const pk = table.KeySchema!.find(
    (key) => key.KeyType === "HASH",
  )?.AttributeName;
  const pkType = table.AttributeDefinitions!.find(
    (attr) => attr.AttributeName === pk,
  )?.AttributeType;

  let attributes: MyAttribute[] = [
    {
      name: pk!,
      type: pkType!,
      kind: "pk",
    },
  ];

  let ret: TableInfo = {
    name: table.TableName!,
    pk: pk!,
    pkType: pkType!,
    attributes,
    // $pk: { name: pk!, type: pkType! },
    gsiIndexes: [],
    ItemCount: table.ItemCount,
    TableSizeBytes: table.TableSizeBytes,
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
    attributes.push({
      name: sk,
      type: skType!,
      kind: "sk",
    });
  }

  table.GlobalSecondaryIndexes?.forEach((gsi) => {
    const pk = gsi.KeySchema!.find(
      (key) => key.KeyType === "HASH",
    )?.AttributeName;
    const pkType = table.AttributeDefinitions!.find(
      (attr) => attr.AttributeName === pk,
    )?.AttributeType;

    attributes.push({
      name: pk!,
      type: pkType!,
      kind: "gsiPk",
    });

    let gsiInfo: GSIIndex = {
      name: gsi.IndexName!,
      pk: pk!,
      pkType: pkType!,
    };

    const sk = gsi.KeySchema!.find(
      (key) => key.KeyType === "RANGE",
    )?.AttributeName;
    if (sk) {
      const skType = table.AttributeDefinitions!.find(
        (attr) => attr.AttributeName === sk,
      )?.AttributeType;
      gsiInfo = {
        ...gsiInfo,
        sk,
        skType: skType!,
      };
      attributes.push({
        name: sk,
        type: skType!,
        kind: "gsiSk",
      });
    }

    ret.gsiIndexes.push(gsiInfo);
  });

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

export function getTableKey(tableInfo: TableInfo, item: Record<string, any>) {
  const key: Record<string, any> = {};
  key[tableInfo.pk] = item[tableInfo.pk];
  if (tableInfo.sk) {
    key[tableInfo.sk] = item[tableInfo.sk];
  }
  return key;
}
