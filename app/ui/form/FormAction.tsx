"use client";
import { useFormAction } from "@/app/lib/hook/action";
import { Alert, Form, FormProps } from "antd";
import { ReactNode } from "react";

export default function FormAction<TValues, Output>({
  render,
  action,
  onSuccess,
  extraValues,
  form: initForm,
  ...props
}: {
  render: (
    params: ReturnType<typeof useFormAction<TValues, Output>>,
  ) => ReactNode;
} & Parameters<typeof useFormAction<TValues, Output>>[0] &
  FormProps<TValues>) {
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