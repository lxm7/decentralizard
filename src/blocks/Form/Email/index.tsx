import type { EmailField } from '@payloadcms/plugin-form-builder/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { Input } from '@/base/input'
import { Label } from '@/base/label'
import React from 'react'

import { Error } from '../Error'
import { Width } from '../Width'

// type CustomFieldValues = {
//   email: string
//   password?: string
//   rememberMe: boolean
// }

export const Email: React.FC<
  EmailField & {
    errors: Partial<FieldErrorsImpl<FieldValues>>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required: requiredFromProps, width }) => {
  return (
    <Width width={width}>
      <Label htmlFor={name}>{label}</Label>
      <Input
        defaultValue={defaultValue}
        id={name}
        type="text"
        {...register(name, { pattern: /^\S[^\s@]*@\S+$/, required: requiredFromProps })}
      />

      {requiredFromProps && errors[name] && <Error />}
    </Width>
  )
}
