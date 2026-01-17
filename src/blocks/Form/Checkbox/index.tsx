import type { CheckboxField } from '@payloadcms/plugin-form-builder/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { useFormContext } from 'react-hook-form'

import { Checkbox as CheckboxUi } from '@/base/checkbox'
import { Label } from '@/base/label'
import React from 'react'

import { Error } from '../Error'
import { Width } from '../Width'

export const Checkbox: React.FC<
  CheckboxField & {
    errors: Partial<FieldErrorsImpl<FieldValues>>
    getValues: () => Record<string, string> // Replace `any` based on your form schema
    register: UseFormRegister<FieldValues>
    setValue: (
      name: string,
      value: unknown,
      options?: { shouldValidate?: boolean; shouldDirty?: boolean },
    ) => void
  }
> = ({ name, defaultValue, errors, label, register, required: requiredFromProps, width }) => {
  const props = register(name, { required: requiredFromProps })
  const { setValue } = useFormContext()

  return (
    <Width width={width}>
      <div className="flex items-center gap-2">
        <CheckboxUi
          defaultChecked={defaultValue}
          id={name}
          {...props}
          onCheckedChange={(checked) => {
            setValue(props.name, checked)
          }}
        />
        <Label htmlFor={name}>{label}</Label>
      </div>
      {requiredFromProps && errors[name] && <Error />}
    </Width>
  )
}
