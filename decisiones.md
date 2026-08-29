Por qué Git no pudo resolver el conflicto solo — y qué habría tenido que pasar para que nunca apareciera.
    
    Git no sabe cual de los dos cambios es el correcto o si ambos estan bien y solo hay que moverlos a otra linea, por lo tanto no hay forma que resuelva este tipo de conflictos automaticamente, requiere de una revision humana para poder resolverlo.
    Para que no hubiera aparecido un conflicto hubieramos tenido que modificar distintas lineas del archivo o que la version B sea una "subrama" de A y no de main.

Qué problemas encontraste y cómo los solucionaste. Los tropiezos bien contados valen más que un camino perfecto: son los que demuestran que entendiste.

    El unico problema con el que me encontre es el tema de usar mas de una cuenta configurada de github en mi notebook porlo que a veces me tiraba error al hacer push por falta de permisos, y lo solucione agrengando un SSH de la cuenta de la facu y cambiando la autenticacion del repo de HTTPS a SSH.

Declaración de uso de IA: qué partes hiciste con ayuda de inteligencia artificial y cómo verificaste lo que te devolvió (§ Uso de IA del enunciado).

    No utilice herramientas de IA para la resolucion de este trabajo practico, fue un TP1 muy sencillo que no ameritaba usar herramientas de IA para su resolucion.

---

# Decisiones TP2 — Contenerización

## Qué app elegiste y por qué

Elegí una aplicación de gestión de reservas que había desarrollado hace unos años. La app cuenta con backend y frontend integrados en Next.js, y utiliza PostgreSQL como base de datos, por lo que cumple con los tres requisitos de la consigna (backend + frontend + base de datos). Al ser un proyecto que ya conocía en profundidad, me permitió enfocarme en la contenerización sin perder tiempo resolviendo problemas de la aplicación en sí.

## Decisiones de contenerización

- **Arquitectura de 3 contenedores y 2 imágenes personalizadas**:
  - **`reservas-db`**: Contenedor oficial de `postgres:16.2` para la persistencia de datos relacionales.
  - **`reservas-backend`**: Imagen construida desde `Dockerfile.backend`, expuesta en el puerto `4000`, encargada de la capa de API (`/api/*`), servicios de negocio y acceso a datos mediante Prisma.
  - **`reservas-frontend`**: Imagen construida desde `Dockerfile.frontend`, expuesta en el puerto `3000`, encargada de renderizar la interfaz de usuario y vistas interactivas del sistema.
- **Imagen base**: `node:20-alpine` tanto para la etapa de build como para la de ejecución. Se eligió Alpine por su tamaño reducido frente a las variantes basadas en Debian.
- **Multi-stage build**: Ambos Dockerfiles (`Dockerfile.backend` y `Dockerfile.frontend`) cuentan con dos etapas (`builder` y `runner`), copiando únicamente los artefactos necesarios (`standalone`, `.next/static`, `public`, Prisma client), reduciendo sustancialmente el tamaño de las imágenes finales.
- **Persistencia**: la base de datos PostgreSQL persiste sus datos mediante un volumen de Docker (`postgres-data`). Los datos de las aplicaciones web son stateless; se regeneran en cada build.
- **Secretos y Conectividad**: todas las credenciales, URLs de interconexión (`NEXT_PUBLIC_API_URL`, `BACKEND_URL`, `DATABASE_URL`) y configuraciones sensibles se externalizaron al archivo `.env`, consumido por `docker-compose.yml` mediante interpolación de variables.

## Problemas encontrados y cómo los resolviste

- **Prisma en Alpine**: al usar `node:20-alpine`, Prisma requería las librerías `openssl` y `libc6-compat` que no vienen instaladas por defecto. Se resolvió agregando `RUN apk add --no-cache openssl libc6-compat` en ambas etapas de los Dockerfiles.
- **Standalone output**: Next.js con `output: 'standalone'` genera un servidor autocontenido, pero no incluye la carpeta `public` ni `static` automáticamente. Se resolvió copiando explícitamente esas carpetas en la etapa `runner` de cada Dockerfile.
- **Variables de entorno hardcodeadas**: el docker-compose original tenía las credenciales escritas directamente. Se refactorizó para usar `${VARIABLE}` y un archivo `.env.example` como plantilla.
- **Separación de puertos entre contenedores**: Para evitar colisiones y permitir la ejecución simultánea de los servicios de frontend y backend, se asignó el puerto `3000` para `reservas-frontend` y el puerto `4000` para `reservas-backend`, estableciendo la dependencia `depends_on` correspondiente en Docker Compose.
