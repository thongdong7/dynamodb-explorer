import { MantineReactTable } from "mantine-react-table";
import { TableScanHook } from "../table/view/tableScanHook";

const MRTSingleTable = ({ table: _table }: { table: TableScanHook }) => {
  return <MantineReactTable table={_table.table} />;
};

export default MRTSingleTable;
