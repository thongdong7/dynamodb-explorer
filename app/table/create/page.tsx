import { createPage } from "@/app/lib/utils/createPageUtils";
import TableCreateForm from "@/app/ui/table/create/TableCreateForm";

export default createPage().render(async () => {
  return (
    <div className="container-focus">
      Table Create
      <TableCreateForm />
    </div>
  );
});
