import { createPage } from "@/app/lib/utils/createPageUtils";
import TableCreateForm from "@/app/ui/table/create/TableCreateForm";

export default createPage().render(async () => {
  return (
    <div>
      Table Create
      <TableCreateForm />
    </div>
  );
});
