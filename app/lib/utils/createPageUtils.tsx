import { Alert, Result } from "antd";
import { ReactNode } from "react";
import { z } from "zod";
import { APIError } from "./apiUtils";
import { loadDynamoConfig } from "./clientUtils";

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
        } else if (error instanceof Error) {
          if ("code" in error && error.code == "ECONNREFUSED") {
            return (
              <Result
                status="error"
                title="Connection Error"
                subTitle={
                  <div>
                    <div>
                      Could not connect to DynamoDB at{" "}
                      <b>{loadDynamoConfig().endpoint}</b>.
                    </div>
                    <div>
                      Ensure that DynamoDB is running and accessible at this
                      address.
                    </div>
                    <div>
                      You can config the DynamoDB endpoint by setting the{" "}
                      <b>DYNAMO_ENDPOINT</b> environment variable.
                    </div>
                  </div>
                }
              />
            );
          } else {
            message = error.message;
          }
        } else {
          message = String(error);
        }

        return <Alert type="error" message={message} />;
      }
    };
  }
}

class ConnectionError extends Error {}

export function createPage() {
  return new PageBuilder<{}, {}>(async () => ({}));
}
