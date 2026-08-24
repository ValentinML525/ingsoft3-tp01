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

- **Imagen base**: `node:20-alpine` tanto para la etapa de build como para la de ejecución. Se eligió Alpine por su tamaño reducido frente a las variantes basadas en Debian.
- **Multi-stage build**: el Dockerfile tiene dos etapas. La primera (`builder`) instala dependencias, genera el cliente de Prisma y compila la app con `npm run build`. La segunda (`runner`) copia solo los artefactos necesarios (standalone, static, Prisma client), reduciendo significativamente el tamaño de la imagen final.
- **Persistencia**: la base de datos PostgreSQL persiste sus datos mediante un volumen de Docker (`postgres-data`). Los datos de la aplicación Next.js no se persisten porque son stateless; se regeneran en cada build.
- **Secretos**: todas las credenciales y configuraciones sensibles se externalizaron a un archivo `.env` que no se commitea, consumido por el `docker-compose.yml` mediante interpolación de variables.

## Problemas encontrados y cómo los resolviste

- **Prisma en Alpine**: al usar `node:20-alpine`, Prisma requería las librerías `openssl` y `libc6-compat` que no vienen instaladas por defecto. Se resolvió agregando `RUN apk add --no-cache openssl libc6-compat` en ambas etapas del Dockerfile.
- **Standalone output**: Next.js con `output: 'standalone'` genera un servidor autocontenido, pero no incluye la carpeta `public` ni `static` automáticamente. Se resolvió copiando explícitamente esas carpetas en la segunda etapa del Dockerfile.
- **Variables de entorno hardcodeadas**: el docker-compose original tenía las credenciales escritas directamente. Se refactorizó para usar `${VARIABLE}` y un archivo `.env.example` como plantilla.
