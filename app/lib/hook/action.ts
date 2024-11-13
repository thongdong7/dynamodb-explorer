"use client";

import { App, Form, FormInstance } from "antd";
import { useState } from "react";
import { APIResult } from "../utils/apiUtils";

type ActionValuesOf<T> = T extends (values: infer V) => Promise<APIResult<any>>
  ? V
  : never;

export function useFormAction<TValues, Output>({
  form: initForm,
  action,
  onSuccess,
  extraValues = {},
}: {
  action: (values: TValues) => Promise<APIResult<Output>>;
  form?: FormInstance<ActionValuesOf<typeof action>>;
  onSuccess?: (data: Output, values: TValues) => void;
  extraValues?: Partial<TValues>;
}) {
  const { message } = App.useApp();
  const [form] = Form.useForm<ActionValuesOf<typeof action>>(initForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFinish(values: TValues) {
    try {
      setLoading(true);
      setError(null);
      const result = await action(
        extraValues ? { ...values, ...extraValues } : values,
      );
      if (result.ok === false) {
        if (result.errors) {
          // @ts-expect-error
          form.setFields(result.errors);
          console.log(result.errors);
        }

        if (result.error) {
          setError(result.error);
        }
        return;
      } else {
        onSuccess && onSuccess(result.data, values);
      }
    } catch (error) {
      setError((error as Error).message);
      message.error("Error: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return {
    form,
    loading,
    error,
    onFinish,
  };
}

export function useAction<TValues, Result>({
  action,
  onSuccess,
}: {
  action: (values: TValues) => Promise<APIResult<Result>>;
  onSuccess?: (data: Result, values: TValues) => void;
}) {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | undefined>(undefined);
  const [params, setParams] = useState<TValues | undefined>(undefined);

  async function run(values: TValues): Promise<Result | undefined> {
    try {
      setLoading(true);
      setError(null);
      setParams(values);
      const response = await action(values);
      if (response.ok === false) {
        let error;
        if (response.errors) {
          error = response.errors[0].errors[0];
        } else if (response.error) {
          error = response.error;
        } else {
          error = "Unknown error";
        }
        message.error("Error: " + error);
        return;
      } else {
        setResult(response.data);
        onSuccess && onSuccess(response.data, values);

        return response.data;
      }
    } catch (error) {
      setError((error as Error).message);
      message.error("Error: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    run,
    result,
    setResult,
    params,
    setParams,
  };
}
