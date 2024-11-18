"use client";
import { FormActionProps, useFormAction } from "@/app/lib/hook/action";
import { Alert, Form, FormProps } from "antd";
import { ReactNode } from "react";

export default function FormAction<TValues, Output, TExtraValues extends {}>({
  render,
  action,
  onSuccess,
  extraValues,
  form: initForm,
  ...props
}: {
  render: (
    params: ReturnType<typeof useFormAction<TValues, Output, TExtraValues>>,
  ) => ReactNode;
} & FormActionProps<TValues, Output, TExtraValues> &
  Omit<FormProps<TValues>, "action">) {
  const { form, onFinish, error, loading } = useFormAction({
    form: initForm,
    action,
    onSuccess,
    extraValues,
  });
  return (
    <Form form={form} onFinish={onFinish} layout="vertical" {...props}>
      {error && (
        <div className="mb-2">
          <Alert message={error} type="error" />
        </div>
      )}
      {render({ form, error, loading, onFinish })}
    </Form>
  );
}
