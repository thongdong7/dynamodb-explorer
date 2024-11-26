import { deleteItemsAPI } from "@/app/lib/actions/item/delete";
import { useAction } from "@/app/lib/hook/action";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";

// import "@mantine/core/styles.css";
// import "@mantine/dates/styles.css"; //if using mantine date picker features
import { App, Button, Popconfirm } from "antd";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_SortingState,
  type MRT_Virtualizer,
} from "mantine-react-table";
// import "mantine-react-table/styles.css"; //make sure MRT styles were imported in your app root (once)
import { useState } from "react";
import {
  RecordType,
  RecordWithID,
  TableScanHook,
} from "../table/view/tableScanHook";
import RowDetail from "./RowDetail";
import { $id } from "./common";

const MRTSingleTable = ({ table: _table }: { table: TableScanHook }) => {
  // console.log("MRTSingleTable");
  // const pk = _table.tableInfo.pk;
  // const sk = _table.tableInfo.sk;
  // const { message } = App.useApp();
  // const { loading: deletingItems, run: _deleteItems } = useAction({
  //   action: deleteItemsAPI,
  // });

  // const [data, setData] = useState<RecordType[]>(_table.items ?? []);

  return <MantineReactTable table={_table.table} />;
};

export default MRTSingleTable;
