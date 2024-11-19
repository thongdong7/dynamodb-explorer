import { deleteItemAPI } from "@/app/lib/actions/item/delete";
import { useAction } from "@/app/lib/hook/action";
import { DeleteOutlined } from "@ant-design/icons";
import { App, Button } from "antd";

export default function DeleteItemButton({
  tableName,
  itemKey,
  onDeleted,
}: {
  tableName: string;
  itemKey: Record<string, any>;
  onDeleted?: () => void;
}) {
  const { modal } = App.useApp();

  const { loading, run: _deleteItem } = useAction({
    action: deleteItemAPI,
    onSuccess: async () => {
      onDeleted && onDeleted();
    },
  });
  return (
    <Button
      danger
      icon={<DeleteOutlined />}
      loading={loading}
      onClick={() => {
        modal.confirm({
          title: "Are you sure?",
          content: "Do you want to delete this item?",
          onOk: () => {
            _deleteItem({ tableName, key: itemKey });
          },
        });
      }}
    >
      Delete
    </Button>
  );
}
