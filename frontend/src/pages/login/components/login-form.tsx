import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Mail } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { loginSchema, type LoginFormValues } from '@/types/auth/login.schema'

type LoginFormProps = {
  onSubmit: (values: LoginFormValues) => void
  isPending?: boolean
  errorMessage?: string
}

export function LoginForm({ onSubmit, isPending = false, errorMessage }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: true },
  })

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-5">
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-email" className="font-semibold">E-mail institucional</FieldLabel>
              <InputGroup className="h-11 bg-background">
                <InputGroupAddon>
                  <Mail aria-hidden="true" />
                </InputGroupAddon>
                <InputGroupInput
                  {...field}
                  id="login-email"
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  placeholder="nome@universidade.br"
                  aria-invalid={fieldState.invalid}
                />
              </InputGroup>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-password" className="font-semibold">Senha</FieldLabel>
              <InputGroup className="h-11 bg-background">
                <InputGroupInput
                  {...field}
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  aria-invalid={fieldState.invalid}
                  className="pl-3"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-sm"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((visible) => !visible)}
                  >
                    {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <div className="flex items-center justify-between gap-4">
          <Controller
            name="rememberMe"
            control={control}
            render={({ field }) => (
              <Field orientation="horizontal" className="w-auto">
                <Checkbox
                  id="login-remember"
                  name={field.name}
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
                <FieldLabel htmlFor="login-remember" className="font-normal">
                  Manter conectado
                </FieldLabel>
              </Field>
            )}
          />
          <button
            type="button"
            disabled
            title="Recuperação de senha indisponível no momento"
            className="text-sm font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            Esqueci minha senha
          </button>
        </div>

        {errorMessage && (
          <p role="alert" className="text-sm text-destructive">
            {errorMessage}
          </p>
        )}

        <Button type="submit" disabled={isPending} className="h-12 w-full text-base font-semibold">
          {isPending ? 'Entrando…' : 'Entrar'}
        </Button>
      </FieldGroup>
    </form>
  )
}
