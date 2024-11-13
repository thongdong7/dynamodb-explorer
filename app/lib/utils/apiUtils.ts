import { z } from "zod";

type ContextBuilderFunc<Input, Context, NewContext> = (
  rawValues: Input,
  context: Context,
) => Promise<NewContext>;

class ActionError extends Error {
  constructor(public message: string) {
    super(message);
  }
}

class ActionErrors {
  constructor(public errors: APIError["errors"]) {}
}

class ActionBuilder<Input, Context, NewContext> {
  constructor(
    private contextBuilder: ContextBuilderFunc<Input, Context, NewContext>,
  ) {}

  check(condition: (context: NewContext) => boolean) {
    return new ActionBuilder(async (rawValues: Input, context: Context) => {
      const nextContext = await this.contextBuilder(rawValues, context);

      if (!condition(nextContext as NewContext)) {
        throw new ActionError("You are not authorized to access this page");
      }

      return nextContext;
    });
  }

  schema<Schema extends z.ZodTypeAny>(s: Schema) {
    return {
      inputType: <InputType extends Input = z.input<Schema>>() => {
        const nextInitFunc = async (
          rawValues: InputType,
          context: Context,
        ): Promise<NewContext & { values: z.infer<Schema> }> => {
          const validatedFields = await s.safeParseAsync(rawValues);
          if (!validatedFields.success) {
            console.log("error", validatedFields.error);
            // return toAntdFormError(validatedFields);
            throw new ActionErrors(
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

        return new ActionBuilder(nextInitFunc);
      },
    };
  }

  onExecute<Result>(fn: (context: NewContext) => Promise<Result>) {
    return async (rawValues: Input): Promise<APIResult<Result>> => {
      try {
        const context = await this.contextBuilder(rawValues, {} as Context);

        const data = await fn(context);
        return {
          ok: true,
          data,
        };
      } catch (error) {
        if (error instanceof ActionError) {
          return { ok: false, error: error.message };
        }

        if (error instanceof ActionErrors) {
          return { ok: false, errors: error.errors };
        }

        return {
          ok: false,
          error: (error as Error).message,
        };
      }
    };
  }
}

export function apiAction() {
  return new ActionBuilder<{}, {}, {}>(async () => ({}));
}

export interface APIError {
  ok: false;
  error?: string;
  errors?: {
    name: (string | number)[];
    errors: string[];
  }[];
}
export type APIResult<Output> = { ok: true; data: Output } | APIError;
