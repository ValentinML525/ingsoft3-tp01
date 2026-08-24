"use client"

import { authenticate } from "@/actions"
import Link from "next/link"
import { useFormState, useFormStatus } from "react-dom"
import { IoInformationOutline } from "react-icons/io5"

import clsx from "clsx"
import { useEffect } from "react"
import {
  Card,
  Input,
  Button,
  Typography,
} from "@/components/Client/MaterialTailwindClient"

export const LoginForm = () => {
  const [state, dispatch] = useFormState(authenticate, undefined)

  useEffect(() => {
    if (state === "Success") {
      window.location.replace("/dashboard/home")
    }
  })

  return (
    <Card color="transparent" shadow={false} >
      <Typography className="font-semibold text-gray-500 text-center ">
        ¡Bienvenido!         
      </Typography>
      <Typography className="font-thin text-gray-400 text-center ">
        Ingrese los datos de la cuenta para continuar.
      </Typography>

      <form action={dispatch} className="mt-10 mb-2">
        <div className="mb-10 flex flex-col gap-6">
          
          <Input
            size="lg"
            label="Correo electrónico"
            placeholder="nombre@mail.com"
            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
            type="email"
            name="email"
            labelProps={{
              className: "before:content-none after:content-none",
            }}
          />
          <Input
            type="password"
            size="lg"
            label="Contraseña"
            placeholder="********"
            name="password"
            className="!border-t-blue-gray-200 focus:!border-t-gray-900 "
            labelProps={{
              className: "before:content-none after:content-none",
            }}
          />

          {state === "Invalid credentials." && (
            <div className="flex items-center space-x-2 mt-2">
              <IoInformationOutline className="h-5 w-5 text-red-500" />
              <Typography className="text-sm text-red-500">
                Usuario o contraseña incorrecta.
              </Typography>
            </div>
          )}
          

        </div>

          <LoginButton />

          <Link
            href="/auth/new-account" 
            className="">
            <Button className="mt-6 bg-orange-300 hover:bg-orange-500 " fullWidth>Crear una nueva cuenta</Button>
          </Link>
      </form>
    </Card>
  )
}

function LoginButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      className={clsx(
        "mt-6", 
        {
          "bg-verdeIntermedio hover:bg-verdeOscuro": !pending, 
          "bg-black cursor-not-allowed": pending,  
        }
      )}
      disabled={pending}
      fullWidth
    >
      {pending ? "Ingresando..." : "Ingresar"}
    </Button>
  )
}
