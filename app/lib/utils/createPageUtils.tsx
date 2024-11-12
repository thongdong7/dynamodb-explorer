import { z } from "zod";
import { headers } from "next/headers";
import { ReactNode } from "react";
import { APIError } from "./apiUtils";
import { Alert } from "antd";

type PageProps = {
  params: {};
  searchParams: {};
};

type ContextBuilderFunc<Context, NewContext> = (
  rawValues: PageProps,
  context: Context,
) => Promise<NewContext>;

class PageError extends Error {
  constructor(public message: string) {
    super(message);
  }
}

class PageErrors {
  constructor(public errors: NonNullable<APIError["errors"]>) {}
}

class PageBuilder<Context, NewContext> {
  constructor(
    private contextBuilder: ContextBuilderFunc<Context, NewContext>,
  ) {}

  check(condition: (context: NewContext) => boolean) {
    return new PageBuilder(async (rawValues: PageProps, context: Context) => {
      const nextContext = await this.contextBuilder(rawValues, context);

      if (!condition(nextContext as NewContext)) {
        throw new PageError("You are not authorized to access this page");
      }

      return nextContext;
    });
  }

  schema<Schema extends z.ZodTypeAny>(s: Schema) {
    const nextInitFunc = async (
      rawValues: PageProps,
      context: Context,
    ): Promise<NewContext & { values: z.infer<Schema> }> => {
      const validatedFields = await s.safeParseAsync(rawValues);
      if (!validatedFields.success) {
        console.log("error", validatedFields.error);
        // return toAntdFormError(validatedFields);
        throw new PageErrors(
          validatedFields.error.issues.map((issue) => ({
            name: issue.path,
            errors: [issue.message],
          })),
        );
      }

      const values = validatedFields.data;
      const nextContext = await this.contextBuilder(rawValues, context);

      return {
        ...nextContext,
        values,
      };
    };

    return new PageBuilder(nextInitFunc);
  }

  render(fn: (context: NewContext) => Promise<ReactNode>) {
    return async (rawValues: PageProps): Promise<ReactNode> => {
      try {
        const context = await this.contextBuilder(rawValues, {} as Context);

        return await fn(context);
      } catch (error) {
        let message;
        if (error instanceof PageError) {
          message = error.message;
        } else if (error instanceof PageErrors) {
          message = error.errors.map((item) => item.errors.join(", "));
        } else {
          message = (error as Error).message;
        }

        return <Alert type="error" message={message} />;
      }
    };
  }
}

export function createPage() {
  return new PageBuilder<{}, {}>(async () => ({}));
}
