"use client";

import { App, Form, FormInstance } from "antd";
import { useState } from "react";
import { APIResult } from "../utils/apiUtils";

type ActionValuesOf<T> = T extends (values: infer V) => Promise<APIResult<any>>
  ? V
  : never;

export interface FormActionProps<TValues, Output, TExtraValues> {
  form?: FormInstance<TValues>;
  action: (values: TValues) => Promise<APIResult<Output>>;
  onSuccess?: (data: Output, values: TValues) => void;
  extraValues?: TExtraValues;
}

export function useFormAction<TValues, Output, TExtraValues extends {}>({
  form: initForm,
  action,
  onSuccess,
  extraValues = {} as TExtraValues,
}: FormActionProps<TValues, Output, TExtraValues>) {
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

export interface UseActionHook<TValues, Result> {
  loading: boolean;
  error: string | null;
  run: (values: TValues) => Promise<Result | undefined>;
  result: Result | undefined;
  setResult: (result: Result | undefined) => void;
  params: TValues | undefined;
  setParams: (params: TValues | undefined) => void;
}
export function useAction<
  TValues extends {},
  Result,
  TExtraValues extends {} = {},
>({
  action,
  onSuccess,
  beforeRun,
  extraValues = {} as TExtraValues,
}: {
  action: (values: TValues & TExtraValues) => Promise<APIResult<Result>>;
  beforeRun?: (values: TValues) => void;
  onSuccess?: (data: Result, values: TValues) => void;
  extraValues?: TExtraValues;
}): UseActionHook<TValues, Result> {
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
      beforeRun && beforeRun(values);
      const response = await action(
        // @ts-expect-error
        extraValues ? { ...values, ...extraValues } : values,
      );
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
