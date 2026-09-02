# Decisiones TP1 — Git

## Por qué Git no pudo resolver el conflicto solo

Git no sabe cuál de los dos cambios es el correcto o si ambos están bien y solo hay que moverlos a otra línea; por lo tanto, no hay forma de que resuelva este tipo de conflictos automáticamente y requiere de una revisión humana para poder resolverlo.

Para que no hubiera aparecido un conflicto, hubiéramos tenido que modificar distintas líneas del archivo o que la versión B sea una rama derivada de A y no directamente de `main`.

## Problemas encontrados y cómo los resolviste

El único problema con el que me encontré fue el manejo de más de una cuenta configurada de GitHub en mi notebook, por lo que a veces me tiraba error al hacer push por falta de permisos. Lo solucioné agregando una clave SSH correspondiente a la cuenta de la facultad y cambiando la autenticación del repositorio de HTTPS a SSH.

## Declaración de uso de IA

No utilicé herramientas de IA para la resolución de este trabajo práctico, ya que fue un TP muy sencillo que no ameritaba el uso de estas herramientas.

# Decisiones TP2 — Contenerización

## Qué app elegiste y por qué

Elegí una aplicación de gestión de reservas que había desarrollado hace unos años. La app cumple con los cuatro criterios exigidos por la consigna:

1. **Backend** (capa de API): endpoints REST bajo `/api/*` gestionados por Next.js en modo servidor.
2. **Frontend** (capa de presentación): interfaz web interactiva renderizada desde un contenedor separado en el puerto 3000.
3. **Base de datos relacional persistente**: PostgreSQL 16.2 con un volumen Docker que sobrevive a reinicios del contenedor.
4. **Arquitectura multicapa desacoplada**: los tres servicios se comunican a través de la red interna de Compose, sin compartir proceso ni sistema de archivos.

Al ser un proyecto que ya conocía en profundidad, me permitió enfocarme en la contenerización sin perder tiempo resolviendo problemas de la aplicación en sí.

## Decisiones de contenerización

- **Arquitectura de 3 contenedores y 2 imágenes personalizadas**:
  - **`reservas-db`**: Contenedor oficial de `postgres:16.2` para la persistencia de datos relacionales.
  - **`reservas-backend`**: Imagen construida desde `Dockerfile.backend`, expuesta en el puerto `4000`, encargada de la capa de API (`/api/*`), servicios de negocio y acceso a datos mediante Prisma.
  - **`reservas-frontend`**: Imagen construida desde `Dockerfile.frontend`, expuesta en el puerto `3000`, encargada de renderizar la interfaz de usuario y vistas interactivas del sistema.
- **Imagen base**: `node:20-alpine` tanto para la etapa de build como para la de ejecución. Se eligió Alpine por su tamaño reducido frente a las variantes basadas en Debian.
- **Multi-stage build**: Ambos Dockerfiles (`Dockerfile.backend` y `Dockerfile.frontend`) cuentan con dos etapas (`builder` y `runner`), copiando únicamente los artefactos necesarios (`standalone`, `.next/static`, `public`, Prisma client), reduciendo sustancialmente el tamaño de las imágenes finales.
- **Persistencia**: la base de datos PostgreSQL persiste sus datos mediante un volumen de Docker (`postgres-data`). Los datos de las aplicaciones web son stateless; se regeneran en cada build.
- **Secretos y Conectividad**: todas las credenciales, URLs de interconexión (`NEXT_PUBLIC_API_URL`, `BACKEND_URL`, `DATABASE_URL`) y configuraciones sensibles se externalizaron al archivo `.env`, consumido por `docker-compose.yml` mediante interpolación de variables.

## `healthcheck` vs `depends_on` simple

`depends_on` sin condición sólo espera a que el proceso del contenedor arranque (PID 1 en ejecución), pero no verifica si el servicio interno está listo para aceptar conexiones. En el caso de PostgreSQL, el proceso puede iniciar pero la base de datos tarda algunos segundos más en aceptar clientes.

Por eso se configuró un `healthcheck` en el servicio `reservas-db`:

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
  interval: 5s
  timeout: 5s
  retries: 5
```

Y en los servicios dependientes se usa `condition: service_healthy`:

```yaml
depends_on:
  reservas-db:
    condition: service_healthy
```

De esta forma, `reservas-backend` sólo arranca cuando Postgres ya está listo para aceptar conexiones, evitando errores de conexión en los primeros segundos.

## Cómo se comunican los servicios entre sí

Docker Compose crea automáticamente una **red bridge interna** que comparten todos los servicios definidos en el mismo `docker-compose.yml`. Dentro de esa red, cada contenedor es alcanzable por los demás usando el **nombre del servicio como hostname** (resolución DNS automática de Docker).

En este proyecto:
- El backend accede a la base de datos como `reservas-db:5432` (variable `DATABASE_URL`).
- El frontend accede al backend como `reservas-backend:4000` (variable `BACKEND_URL`), vía resolución interna.
- El browser del usuario accede al frontend vía `localhost:3000` (puerto publicado en el host), y los assets y API calls externos usan `http://localhost:4000` (variable `NEXT_PUBLIC_API_URL`).

La diferencia clave es que la comunicación contenedor–contenedor usa nombres de servicio (red interna), mientras que la comunicación browser–contenedor usa `localhost` con el puerto publicado por Docker.

## Problemas encontrados y cómo los resolviste

- **Acoplamiento de Frontend y Backend en Next.js**: Al estar desarrollada con Next.js (framework fullstack), tanto la interfaz visual (frontend) como los endpoints de la API (`/api/*`) residían originalmente juntos en el mismo proyecto y servidor monolítico. Para cumplir con los requerimientos del trabajo práctico de tener frontend y backend contenerizados por separado, tuve que desacoplar la arquitectura en dos imágenes Docker independientes (`Dockerfile.backend` y `Dockerfile.frontend`), exponiéndolas en puertos distintos (3000 para frontend y 4000 para backend) y configurando variables de entorno de red para que el frontend consuma los servicios del backend a través de Docker Compose.

## Declaración de uso de IA

Se uso la IA para el formateo de los archivos, refactorizacion de codigo, resolucion de los problemas encontrado y para la separacion del front y backend.

# Decisiones TP3 — Metodologías Ágiles

## Análisis y redefinición de la Historia de Usuario

Crear una tabla en la base de datos es una **tarea técnica** que no aporta valor de negocio directo ni perceptible para el usuario final. Por lo tanto, no corresponde plantearla como una Historia de Usuario (HU), sino como una tarea técnica derivada de una necesidad funcional de negocio. El rol en una HU debe ser siempre quien recibe el valor (un cliente, un usuario del sistema), no quien programa.

La propuesta original presentaba además las siguientes inconsistencias:

- **Estructura**: La plantilla *"Como... Quiero... Para..."* corresponde al cuerpo de la descripción de la historia y no a su título. El título debe ser conciso y orientador.
- **Actor incorrecto**: Usar *"Como desarrollador"* convierte la historia en una tarea técnica interna; el desarrollador no es quien recibe el valor de negocio.
- **Criterios de aceptación**: Carecía por completo de criterios de aceptación (*acceptance criteria*), lo cual es crítico dado que el desarrollador no tendría forma de determinar objetivamente cuándo la historia está finalizada (*Definition of Done*).

### Historia de Usuario correcta (necesidad de negocio)

La Historia de Usuario que da origen a la tarea técnica de "crear la tabla usuarios" sería:

- **Título**: Registro e inicio de sesión de usuarios
- **Descripción**: *Como cliente del sistema de reservas, quiero poder registrarme con mi email y contraseña e iniciar sesión para acceder a mis reservas y gestionar mi cuenta de forma segura.*
- **Criterios de aceptación**:
  - [ ] El cliente puede registrarse con nombre, email y contraseña.
  - [ ] El sistema rechaza emails duplicados con un mensaje de error claro.
  - [ ] Las contraseñas se almacenan cifradas (BCrypt/Argon2); nunca en texto plano.
  - [ ] El cliente puede iniciar sesión con su email y contraseña y accede a su panel de reservas.
  - [ ] El sistema asigna un rol por defecto (`'user'`) al registrarse.
  - [ ] Todos los campos obligatorios (nombre, email, contraseña) se validan antes de guardar.

### Tarea técnica derivada

De la historia anterior se desprende la tarea técnica *"Crear la tabla `usuarios` en la base de datos"*, con los siguientes criterios de implementación:

- [ ] **Estructura**: Campos `id` (PK, auto-incremental o UUID), `nombre`, `email`, `password_hash`, `rol`, `estado`, `created_at`, `updated_at`.
- [ ] **Campos obligatorios**: Restricción `NOT NULL` en `nombre`, `email`, `password_hash`, `rol` y `estado`.
- [ ] **Unicidad de email**: Restricción `UNIQUE` sobre `email` para evitar duplicados.
- [ ] **Seguridad**: `password_hash` almacena contraseñas cifradas (BCrypt/Argon2), nunca en texto plano.
- [ ] **Valores por defecto**: `rol` = `'user'`, `estado` = `'activo'`.
- [ ] **Auditoría temporal**: `created_at` con `CURRENT_TIMESTAMP` en inserción; `updated_at` actualizable en modificaciones.
- [ ] **Migración versionada**: Script ejecutable con `up` (creación) y `down` (rollback).
- [ ] **Validación de errores**: La base rechaza emails duplicados o campos requeridos nulos.

## Duración del sprint y justificación

Generalmente en la industria se adoptan sprints de 2 semanas de duración. Sin embargo, para el desarrollo de la materia se definió utilizar **sprints de 1 semana**, dado que la cursada presenta una nueva entrega y trabajo práctico semanalmente, haciendo necesario trabajar con ciclos cortos, iteraciones rápidas y feedback continuo al cierre de cada semana.

## Límite de trabajo en curso (WIP)

Se configuró un límite de **2 tareas en simultáneo** para el estado *In Progress* en GitHub Projects. Al tratarse de un trabajo individual, establecer un WIP bajo evita la dispersión y la sobrecarga de cambios abiertos, promoviendo avanzar y completar tareas de principio a fin con commits pequeños, continuos y frecuentes en lugar de integraciones grandes y esporádicas.

## Problemas encontrados y cómo los resolviste

No se presentaron dificultades técnicas ni bloqueos durante la configuración del tablero ni en la carga de tareas en GitHub Projects.

## Declaración de uso de IA

No se utilizó IA para la configuración y gestión del proyecto en GitHub Projects, ya que todo el flujo de trabajo se realizó de forma directa sobre la interfaz web de GitHub. Únicamente se recurrió a la asistencia de IA para el formateo de este documento de decisiones.

# Decisiones TP4 — CI: Pipelines as Code

## Estructura elegida del pipeline

Se definieron **dos jobs independientes** en el workflow: `build-backend` y `build-frontend`. Cada uno corre en su propio runner de Ubuntu y construye la imagen correspondiente usando su Dockerfile (`Dockerfile.backend` y `Dockerfile.frontend`). Al no existir dependencia entre ellos, GitHub Actions los ejecuta **en paralelo**, reduciendo el tiempo total de la corrida.

La app está desarrollada en Next.js como monorepo: el frontend y el backend comparten el mismo código base pero se empaquetan como imágenes independientes con configuración de puertos distinta. Por eso ambos jobs usan `context: .` (raíz del repositorio) y apuntan al Dockerfile correspondiente con la clave `file:`.

## Qué cachea el pipeline y qué pasa si el cache desaparece

El cache almacena las **capas intermedias de Docker** (resultado de cada instrucción `RUN`, `COPY`, `ADD` del Dockerfile) en el almacén de GitHub Actions (`type=gha`). Si una capa no cambió respecto a la corrida anterior, se reutiliza directamente — en el log se ve la palabra `CACHED` junto a ese step.

Las capas que más se reutilizan en esta app son las de instalación de dependencias (`npm ci`), ya que `package.json` y `package-lock.json` cambian con menor frecuencia que el código fuente. La capa de `COPY . .` y las de build (`npm run build`) se invalidan casi siempre que hay un commit de código.

Cada job tiene su propio `scope` (`scope=backend` y `scope=frontend`) para evitar que se pisen mutuamente en el almacén compartido.

El cache **puede desaparecer** en cualquier momento (por límite de espacio de GitHub, por expiración, o tras un período sin uso). El pipeline funciona exactamente igual sin él — sólo tarda más, porque reconstruye todas las capas desde cero. Si fallara sin cache, significaría que había una dependencia escondida, no que el cache era necesario.

## Por qué el pipeline construye con el Dockerfile en vez de compilar por su cuenta

Si el pipeline compilara directamente con `npm run build` o instalando Node en el runner, existirían **dos definiciones de build** distintas: la del runner y la del Dockerfile. Con el tiempo estas divergen inevitablemente (versiones de Node, variables de entorno, dependencias del sistema), y el pipeline estaría verificando una cosa distinta de lo que después se despliega.

Al usar el Dockerfile del TP2, el pipeline verifica exactamente el mismo proceso de construcción que se usa en producción. Un build verde en CI garantiza que la imagen que se va a desplegar funciona.

## Problemas encontrados y cómo los resolviste

- **Contexto del Dockerfile**: como ambos Dockerfiles hacen `COPY . .` y necesitan los archivos de la raíz, el `context` del job tiene que ser `.` (raíz del repo) en vez de un subdirectorio. Se especifica el Dockerfile con la clave `file:` de `docker/build-push-action`.
- **El job `build` del TP3**: el workflow anterior tenía un único job llamado `build` que solo hacía checkout. Fue reemplazado completamente por `build-backend` y `build-frontend`. El required status check del gate debe apuntar a estos nuevos nombres.

## Declaración de uso de IA

Se utilizó IA (Antigravity) para generar el archivo `ci.yml` y esta sección de `decisiones.md`, adaptando el template de la guía a la estructura particular del proyecto (monorepo Next.js con Dockerfiles en la raíz). Se verificó el resultado revisando que el contexto y las rutas de los Dockerfiles fueran correctas para esta app.


