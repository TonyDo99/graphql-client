"use client";
import { isEmpty } from "@/ultis/helpers";
import React, { ReactNode, useEffect, useRef, useState } from "react";

type Props = {
  form:
    | {
        formRef: React.LegacyRef<HTMLFormElement>;
        dataRef: React.RefObject<HTMLFormElement>;
      }
    | any;
  onSubmit?: (e: any) => void;
  onChange?: (e: any) => void;
  className?: string;
  children?: ReactNode;
  defaultValue?: {};
};

const Form = ({
  form,
  onSubmit = () => {},
  onChange,
  className,
  children,
  defaultValue,
}: Props) => {
  const _chidlren = React.Children.map(children, (el: any) => {
    return React.cloneElement(el, {
      // child props
    });
  });

  const setDefaultsValue = (fieldValue: any) => {
    const { current: cData } = form?.dataRef ?? {};
    const { current: cForm = {} as any } = form?.formRef ?? {};

    if (!isEmpty(cData) || cForm === null) return;
    form.dataRef.current = {
      ...cData,
      ...fieldValue,
    };

    const _cForm = Object.keys(cForm?.elements) ?? [];

    _cForm?.forEach((e: any) => {
      if (isNaN(+e)) return;
      const item = cForm.elements?.[e];
      if (!isEmpty(item?.name)) {
        const getElementByName = form?.formRef.current?.[item?.name];

        if (getElementByName !== undefined) {
          const getValueByName = fieldValue?.[item?.name];

          const handleType = {
            SELECT: (value: any) => {
              return (item.selectedIndex = value ?? "");
            },
            INPUT: (value: any) => {
              if (getValueByName?.value !== "") return;
              return (item.value = value ?? "");
            },
          } as any;

          return (
            handleType?.[getElementByName?.nodeName]?.(getValueByName) ?? {}
          );
        }
      }
    });
  };

  useEffect(() => {
    if (isEmpty(defaultValue)) return;

    setDefaultsValue(defaultValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue, form, form?.formRef, form?.formRef.current]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    form?.DisplayValidating();

    return onSubmit(form?.getFieldsValue());
  };

  return (
    <form
      ref={form?.formRef}
      className={`${className}`}
      onSubmit={handleSubmit}
      onChange={onChange}
    >
      {_chidlren}
    </form>
  );
};

export default Form;
