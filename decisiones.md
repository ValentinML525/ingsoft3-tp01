# Enlaces de este TP (TP6 — CD: environments, aprobaciones y deployment patterns)

| Qué | Enlace |
|---|---|
| Paquete público del **backend** (etiquetado con el commit de un merge) | https://github.com/users/ValentinML525/packages/container/package/ingsoft3-tp01-backend — `docker pull ghcr.io/valentinml525/ingsoft3-tp01-backend:sha-⏳COMPLETAR` |
| Paquete público del **frontend** | https://github.com/users/ValentinML525/packages/container/package/ingsoft3-tp01-frontend — `docker pull ghcr.io/valentinml525/ingsoft3-tp01-frontend:sha-⏳COMPLETAR` |
| Cadena 1 — job de un **PR en verde** con «Entrar al registry» **salteado** | ⏳COMPLETAR (link al job `build-backend` de la corrida del PR) |
| Cadena 2 — **lista de pasos de una corrida de `main`**, «Construir y publicar la imagen» último | ⏳COMPLETAR (link al job `build-backend` de la corrida de `main`) |
| **QA** (front / api) | ⏳COMPLETAR `https://…-front-qa.onrender.com` · `https://…-api-qa.onrender.com` |
| **PROD** (front / api) | ⏳COMPLETAR `https://…-front-prod.onrender.com` · `https://…-api-prod.onrender.com` |

Lo demás se navega desde el repo: *Actions* (deploys, smoke, `Waiting for review`, aprobación y rechazo), *Deployments* (qué commit está en cada entorno) y *Releases* (`v6.0.0`).

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

# Decisiones TP5 — Calidad automatizada: tests, coverage y el umbral que frena un merge

## Enlaces de Evidencias en GitHub

A continuación se detallan los enlaces directos a las corridas de GitHub Actions y los Pull Requests que sustentan las decisiones técnicas tomadas:

| Lo que se prueba | Enlace directo |
|---|---|
| **Resumen de cobertura (Summary) y reportes descargables** | [Ver Corrida Verde Exitosa #38444444023](https://github.com/ValentinML525/ingsoft3-tp01/actions/runs/38444444023) |
| **Corrida roja bloqueada por umbral en CI** | [Ver Corrida Roja por Umbral #38443558853](https://github.com/ValentinML525/ingsoft3-tp01/actions/runs/38443558853) |
| **Secuencia completa: rojo → tests → verde → merge (PR #1)** | [Ver Pull Request Mergeado #23](https://github.com/ValentinML525/ingsoft3-tp01/pull/23) |
| **Quality gate activo: freno vigente en rojo (PR #2 abierto hasta la defensa)** | [Ver Pull Request Bloqueado Abierto #24](https://github.com/ValentinML525/ingsoft3-tp01/pull/24) |

---

## 1. Qué lógica elegiste testear y por qué ESA (¿dónde duele un bug en tu app?)

En un sistema de alquiler y gestión de reservas, los errores se traducen directamente en pérdidas financieras, sobreventa de alojamientos (*overbooking*) y pérdida de confianza de los clientes:

1. **Backend — Dominio de Reservas y Pagos (`src/lib/reservas/reglas-reserva.ts`)**:
   - **Cálculo del estado de la reserva (`determinarEstadoReserva`)**: Si un bug permite que una reserva con pago parcial figure como `PAGADA`, el sistema asume que no hay saldo adeudado y habilita el check-in sin liquidar el monto total. De forma inversa, si el sistema no rechaza un pago parcial mayor al total o montos negativos, se generan inconsistencias contables graves. Además, una reserva previamente `CANCELADA` jamás debe reactivarse automáticamente por un registro de cobro tardío.
   - **Rango de fechas y noches (`validarFechasReserva`)**: Un error en la comparación temporal (permitir fecha fin anterior o igual a inicio, o menos de 1 noche) generaría reservas nulas o con cálculo de noches negativo, rompiendo la facturación diaria.
   - **Control de aforo (`validarCapacidadUnidad`)**: Alojar más huéspedes que la capacidad máxima de una propiedad viola normativas de seguridad y genera penalizaciones legales y quejas operativas.
   - **Solapamiento y disponibilidad (`hayConflictoFechas` y `ServicioReservas`)**: Es la regla medular del negocio. Si dos reservas coincidentes se aprueban para la misma unidad, dos familias intentarán ingresar a la misma cabaña simultáneamente.

2. **Frontend — Validación de datos y consumo de API (`src/lib/validaciones-usuario.ts`, `src/actions/auth/register.ts`, `src/actions/funciones-globales/funciones-globales.ts`)**:
   - **Validación temprana de entradas**: Rechazar contraseñas débiles (< 6 caracteres) o emails con formato incorrecto antes de impactar el backend ahorra latencia y previene errores 400 innecesarios.
   - **Generación de slugs (`generarSlug`)**: Vital para las rutas públicas de propiedades; caracteres especiales, acentos o espacios mal transformados rompen el routing de Next.js y el posicionamiento SEO.
   - **Cliente API desacoplado (`registerUser`)**: Verificar que la capa de cliente agregue los headers requeridos (`x-api-key`, `Content-Type`), serialice el body correctamente y maneje de forma elegante tanto códigos de conflicto (409) como fallos imprevistos de red sin quebrar la interfaz visual.

---

## 2. Umbral de coverage elegido y justificación

- **Umbral definido**: **80% de líneas (`lines`)** y **80% de ramas (`branches`)**.
- **Sobre qué métrica se aplica**: Se exige en **ambas métricas (`lines` y `branches`)** mediante la configuración de `coverage.thresholds: { lines: 80, branches: 80 }` en Vitest.
- **Justificación del número**:
  - Un umbral del 80% exige que toda lógica de negocio nueva no solo ejecute su camino feliz (*happy path*), sino que cubra obligatoriamente sus bifurcaciones condicionales (`if/else`, validaciones de borde y excepciones).
  - No se fijó en 100% como regla obligatoria inicial porque en proyectos reales un 100% rígido fomenta el antipatrón de escribir tests triviales sin aserciones útiles solo para "pintar líneas", desvirtuando el propósito de la calidad. Sin embargo, el 80% actúa como un suelo firme que prohíbe subir código nuevo sin su correspondiente red de contención.
- **Valores reales de cobertura obtenidos hoy**:
  - **Backend**:
    - **Líneas (`lines`)**: **100%**
    - **Ramas (`branches`)**: **94.73%** (supera con holgura el umbral exigido de 80%).
    - **Funciones (`functions`)**: **100%**
    - **Sentencias (`statements`)**: **100%**
  - **Frontend (suite completa)**:
    - **Líneas (`lines`)**: **100%**
    - **Ramas (`branches`)**: **100%**
    - **Funciones (`functions`)**: **100%**
    - **Sentencias (`statements`)**: **100%**

---

## 3. Qué dejamos afuera de la cuenta de cobertura y por qué

Tanto en el backend como en el frontend se utilizaron filtros explícitos (`include` y `exclude`) para concentrar la medición exclusivamente en el código donde reside la lógica de negocio y las reglas de dominio:

### Backend
- **Archivos excluidos / no incluidos en `include`**:
  - `src/lib/prisma.ts`: Es un archivo de infraestructura que inicializa el cliente singleton de Prisma con la variable de entorno `DATABASE_URL`. Probar este archivo unitariamente solo verificaría si la librería externa `PrismaClient` sabe instanciarse, lo cual corresponde a tests de integración.
  - `src/seed/**`: Scripts de inicialización de datos de prueba en la base de datos local.
  - `**/*.d.ts`: Archivos de definiciones de tipos de TypeScript sin código ejecutable en runtime.

### Frontend
- **Archivos excluidos / no incluidos en `include`**:
  - Componentes visuales de React (`src/app/**`, `src/components/**`): Como fundamenta la consigna (§3.3), testear componentes de UI mediante jsdom y Testing Library añade un alto costo de mantenimiento por renderizado. En la pirámide de testing de la materia, la verificación de la interfaz completa se realiza de forma **end-to-end (e2e) en el TP7** sobre la aplicación desplegada de verdad.
  - Archivos de configuración de frameworks (`next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`).

---

## 4. Por qué coverage alto no garantiza calidad (con nuestro ejemplo concreto)

**Coverage mide qué líneas de código se ejecutaron durante la corrida de tests, pero NO mide si el test está verificando que el comportamiento sea correcto.**

### Ejemplo en nuestra aplicación:
Consideremos la función `determinarEstadoReserva`:

```ts
// Test con 100% de coverage pero NINGUNA calidad de verificación:
it('ejecuta determinarEstadoReserva sin asserts', () => {
  // Act: ejecuta la función cubriendo el 100% de sus líneas
  determinarEstadoReserva({ pagoParcial: 500, precioTotal: 1000 });
  // NO HAY ASSERT: No verificamos si devolvió PAGO_PARCIAL, PENDIENTE o lanzó error
});
```

Si alguien accidentalmente modifica la regla de negocio para que siempre retorne `'PENDIENTE'` o invierta la lógica a `pagoParcial > precioTotal`:
- La cobertura seguirá marcando **100% de líneas ejecutadas**.
- El pipeline seguirá en **verde**.
- Sin embargo, **el sistema está roto y acepta pagos incorrectos en producción**.

Por este motivo, nuestros unit tests no solo recorren las líneas, sino que validan aserciones rigurosas de comportamiento: verifican el valor devuelto (`expect(estado).toBe(EstadoReserva.PAGO_PARCIAL)`), que las excepciones se lancen con el mensaje exacto (`toThrow('El pago parcial no puede exceder el precio total')`), y que los dobles de riesgo (*mocks*) hayan sido invocados exactamente las veces necesarias y con los argumentos precisos (`toHaveBeenCalledTimes(1)`).

---

## 5. El Pull Request bloqueado: análisis del freno

### Pull Request #23 (Secuencia demostrada: Rojo → Tests agregados → Verde → Merge)
- [Enlace al Pull Request #23](https://github.com/ValentinML525/ingsoft3-tp01/pull/23)
- [Enlace a la corrida roja #38443558853](https://github.com/ValentinML525/ingsoft3-tp01/actions/runs/38443558853)
- **Check en rojo**: `build-frontend`
- **Métrica que falló**: **Líneas (`lines`)**, arrojando **70.21%** frente al umbral obligatorio del **80%**.
- **Log exacto del fallo**:
  ```text
  ✓ tests/frontend/frontend.test.ts (14 tests) 24ms
  ...
  -------------------|---------|----------|---------|---------|-------------------
  All files          |   70.21 |      100 |   71.42 |   70.21 |                   
  -------------------|---------|----------|---------|---------|-------------------
  ERROR: Coverage for lines (70.21%) does not meet global threshold (80%)
  ##[error]Process completed with exit code 1.
  ```
- **Por qué falló**: Se incorporaron deliberadamente las funciones `prioridadDeReserva` y `clasificarTipoEstadia` (40 líneas de código sin tests unitarios). Aunque el código compilaba a la perfección y todos los 14 tests existentes pasaban en verde, el required check de `main` bloqueó el merge.
- **Qué escribimos para arreglarlo**: Agregamos tests parametrizados (`it.each`) cubriendo cada uno de los caminos y casos de borde de ambas funciones (`dias < 0`, `<= 1`, `<= 7`, `<= 30`, `> 30` y `noches <= 0`, `=== 1`, etc.). Con esto, la cobertura de líneas subió al 100% ([ver corrida verde #38444444023](https://github.com/ValentinML525/ingsoft3-tp01/actions/runs/38444444023)) y se habilitó el merge a `main`.

### Pull Request #24 (Freno permanente abierto hasta la defensa)
- [Enlace al Pull Request #24](https://github.com/ValentinML525/ingsoft3-tp01/pull/24)
- [Enlace a la corrida en rojo #38445258261](https://github.com/ValentinML525/ingsoft3-tp01/actions/runs/38445258261)
- **Check en rojo**: `build-frontend`
- **Motivo**: Introduce las funciones de negocio `calcularDescuentoPorTemporada` y `calcularRecargoMetodoPago` sin tests, provocando una caída de cobertura de líneas a **72.18%**.
- **Estado**: Queda **abierto y bloqueado en rojo** para que los docentes constaten en la defensa que el quality gate impide la integración de código sin pruebas.

---

## 6. Refactorización para poder mockear (Inyección de Dependencias)

Para cumplir con la consigna de aislar la unidad de sus dependencias externas:

1. **Backend (`src/lib/reservas/reglas-reserva.ts`)**:
   - **Antes**: La lógica de creación de reservas dependía rígidamente de `prisma.reserva`, impidiendo ejecutar tests sin tener una base de datos PostgreSQL conectada y corriendo en la red.
   - **Refactor**: Se desacopló la persistencia extrayendo la interfaz `IReservaRepository`:
     ```ts
     export interface IReservaRepository {
       buscarConflicto(unidadId: number, inicio: Date, fin: Date): Promise<boolean>;
       crearReserva(datos: any): Promise<any>;
     }
     ```
   - Se implementó la clase `ServicioReservas(repo: IReservaRepository)` que **recibe la dependencia por constructor**.
   - **En el test**: Se utiliza `vi.fn()` para instanciar un doble de riesgo (*mock*), verificando que si `buscarConflicto` devuelve `true`, `crearReserva` **nunca es invocado** (`expect(mockRepo.crearReserva).not.toHaveBeenCalled()`), comprobando la interacción y no solo el resultado.

2. **Frontend (`src/actions/auth/register.ts`)**:
   - **Antes**: La acción `registerUser` realizaba una llamada `fetch` directa a la red.
   - **Refactor / Mock**: En el test se intercepta la llamada global (`globalThis.fetch = vi.fn()`) simulando respuestas 200 OK y 409 Conflict, verificando que el cliente envíe los headers de seguridad (`x-api-key`) y el endpoint correcto sin abrir sockets reales.

---

## 7. Reglas de negocio formalizadas y testeadas

Se formalizaron cuatro reglas de negocio sustanciales:
1. **Determinación de Estado de Reserva según Pagos**: Transición entre `PENDIENTE`, `PAGO_PARCIAL` y `PAGADA`; validación estricta de pagos parciales negativos o mayores al precio total; inmunidad de reservas `CANCELADA`.
2. **Validación de Rangos de Fechas y Noches**: Rechazo de reservas con fecha fin previa o igual a inicio; cálculo exacto de días y noches de estadía; exigencia de al menos 1 noche.
3. **Control de Aforo y Capacidad de Unidades**: Validación de cantidad de personas entera positiva y rechazo si supera la capacidad máxima de la unidad alquilada.
4. **Disponibilidad Cronológica y Creación Aislada**: Detección de solapamiento cronológico entre reservas y orquestación con repositorio de persistencia mockeado.

---

## 8. Mapeo de herramientas de nuestro Stack (TypeScript / Next.js)

De acuerdo a la tabla *«Tu stack, de un vistazo»* (§3 del enunciado), nuestra implementación en TypeScript utiliza las siguientes herramientas equivalentes:

| Requisito de la Cátedra | Herramienta utilizada en este proyecto |
|---|---|
| **Dónde viven los tests** | Carpetas estructuradas `tests/backend/` y `tests/frontend/` |
| **Test parametrizado** | `it.each` / `test.each` de Vitest |
| **Inyección de dependencia** | Inyección de interfaces por constructor (`IReservaRepository`) |
| **Fabricar el doble (mock)** | `vi.fn()` de Vitest |
| **Medir la cobertura** | `vitest run --coverage` con proveedor `@vitest/coverage-v8` |
| **Umbral que rompe el build** | `coverage.thresholds: { lines: 80, branches: 80 }` en `vitest.config.backend.ts` y `vitest.config.frontend.ts` |
| **Qué entra en la cuenta** | Claves `include` y `exclude` en la configuración de Vitest |
| **Reporte legible del resultado** | Reporter `['text', 'html', 'lcov', 'json-summary']` volcado a `$GITHUB_STEP_SUMMARY` |
| **Herramientas dentro de Docker** | Multi-stage build con etapa `FROM builder AS test` en `Dockerfile.backend` y `Dockerfile.frontend` ejecutando `npm run test:*:ci` |

---

## 9. Ejercicio del camino sin cubrir (la rama sin cubrir)

Al analizar el reporte detallado generado por el motor V8 en el backend:

- **Archivo y Línea**: `src/lib/reservas/reglas-reserva.ts`, línea 179:
  ```ts
  pagoParcial: datos.pagoParcial ?? 0,
  ```
- **Entrada concreta que la recorrería**: Un objeto `NuevaReservaDTO` donde la propiedad opcional `pagoParcial` no esté definida (`pagoParcial: undefined`). Actualmente los tests siempre proporcionan un número explícito (ej. `0` u `800`), por lo que el camino alternativo del operador coalescente nulo (`??`) que asigna el valor por defecto `0` no se llega a bifurcar.
- **Qué decidimos hacer**: **Decidimos no agregar un test adicional para este camino**. La regla central de determinación de estados ya está 100% testeada con valores numéricos explícitos en `determinarEstadoReserva`. Agregar un test solo para ejecutar el operador `??` no aportaría valor de verificación de negocio adicional; documentamos la existencia de la rama identificada tras inspeccionar el reporte HTML generado.

---

## 10. Problemas encontrados y cómo se resolvieron

1. **Resolución de dependencias de Vitest con Node 20**: La última versión mayor de Vitest (Vitest 5) requería definiciones de tipos `@types/node >= 22`, lo que generaba errores de `ERESOLVE` con el `@types/node@20` del proyecto. Se resolvió fijando la versión en `vitest@3.2.7` y `@vitest/coverage-v8@3.2.7`, compatible con Node 20 y coincidente con la versión de referencia de la cátedra.
2. **Extracción de cobertura desde dentro del contenedor Docker**: Al ejecutar las pruebas en la etapa `test` de Docker en GitHub Actions, los archivos de cobertura se generaban dentro del contenedor efímero. Se resolvió configurando la variable `COVERAGE_DIR=/salida/reporte` y mapeando un volumen del host runner `-v "${{ github.workspace }}/frontend-coverage:/salida"`, permitiendo que el step posterior de GitHub Actions lea `coverage-summary.json` y publique el artefacto HTML descargable.
3. **Comportamiento de Vitest 3 con funciones no invocadas**: En Vitest 3, si una función nunca es llamada, no se computan sus ramas condicionales sino sus líneas no cubiertas. Al diseñar el escenario de bloqueo, fue necesario asegurar suficiente volumen de código nuevo sin testear para provocar la caída de la métrica de líneas por debajo del 80%.

---

## 11. Declaración de uso de IA

Se utilizó asistencia de IA (Antigravity con Gemini 3.8 Flash) para:
- Diseñar la arquitectura desacoplada de `reglas-reserva.ts` con inyección de dependencias (`IReservaRepository`).
- Generar la estructura AAA y los casos parametrizados de los tests unitarios.
- Configurar las etapas `test` en los Dockerfiles y los steps de extracción de cobertura en `.github/workflows/ci.yml`.
- Redactar la documentación técnica detallada en este archivo.

**Verificación humana**: Se verificó manualmente cada assert, asegurando que cubran casos de error reales (como fechas invertidas, pagos excesivos y solapamientos), comprobando que invertir las condiciones lógicas falle los tests, y corroborando el correcto bloqueo del build en GitHub Actions tanto en local como en remoto.




# Decisiones TP6 — CD: environments, aprobaciones y deployment patterns

## 0. Infraestructura elegida y cómo cumple el contrato

Usé el riel de la cátedra: **GitHub Actions + ghcr.io + Render (app) + Neon (base)**.

| Punto del contrato | Cómo lo cumplo |
|---|---|
| 1. Dos entornos separados con URL pública | Cuatro *Web Services* Docker en Render: `api-qa`, `front-qa`, `api-prod`, `front-prod` |
| 2. Una base por entorno | Un proyecto Neon con dos databases: `app_qa` y `app_prod` |
| 3. Front y back como contenedores desde mis Dockerfiles | Render construye `Dockerfile.backend` y `Dockerfile.frontend` (contexto `.`, raíz del repo) |
| 4. El deploy lo dispara el pipeline con el commit verificado | Auto-Deploy **Off** en los cuatro servicios; los jobs `deploy-qa`/`deploy-prod` llaman al deploy hook con `&ref=$GITHUB_SHA` |
| 5. PROD detrás de la aprobación | Job `deploy-prod` con `environment: production`, que tiene *Required reviewers* |

No usé el Postgres de Render porque su plan gratuito **expira a los 30 días**; el de Neon es permanente (con límites de almacenamiento y cómputo).

**Mi app tiene dos Dockerfiles, así que se entregan dos paquetes.** Las dos imágenes salen del mismo código Next.js: el backend expone la API (`/api/*`, con Prisma y acceso a la base) y el frontend renderiza la interfaz y le habla al backend del lado del servidor.

## 1. El artefacto: por qué se publica sólo con la verificación en verde

El pipeline publica `ghcr.io/valentinml525/ingsoft3-tp01-backend:sha-<commit>` y `…-frontend:sha-<commit>`. El nombre va escrito a mano en minúsculas porque `github.repository` es `ValentinML525/ingsoft3-tp01` y ghcr.io no acepta mayúsculas.

La garantía de que lo publicado es lo verificado sale de **tres eslabones encadenados**, y no de un control único:

1. **Nada entra a `main` sin verde.** La protección de rama del TP4/TP5 exige los checks `build-backend` y `build-frontend` (tests + umbral de coverage).
2. **Sólo `main` publica.** «Entrar al registry» y el `push:` del build final llevan `github.event_name == 'push' && github.ref == 'refs/heads/main'`. Exijo las dos condiciones y no sólo el evento: si mañana agrego otra rama al disparador, un push a esa rama tampoco publicaría.
3. **Publicar es el ÚLTIMO paso del mismo job que corre los tests.** No hay ningún `if: success()`: los pasos de un job corren en orden y se cortan al primer error, así que si los tests fallan, el paso de publicar nunca se ejecuta. Para lograrlo saqué el build de la imagen final que estaba **antes** de los tests (TP4) y lo puse al final del job. Los pasos de reporte llevan `!cancelled()` (a propósito, para ver el coverage aunque falle), pero los que publican no llevan ninguna función de estado.

**Qué dejaría de significar el registry si se publicara igual:** hoy, que exista `sha-X` en el registry quiere decir «el commit X pasó los tests y el umbral, y estaba integrado en `main`». Si se publicara con tests en rojo o desde un PR, el registry pasaría a ser un depósito de «cosas que compilaron alguna vez», y cualquiera que haga `docker pull` (o un deploy futuro, en el TP7) podría estar levantando código roto o nunca revisado.

**Qué NO garantiza la cadena:** alguien con permisos de escritura puede hacer `docker push` a mano con un tag `sha-…` inventado y el registry lo acepta igual: la cadena evita el error **por accidente**, no por malicia. Además, un tag es **mutable** (se puede volver a pushear el mismo `sha-X` con otro contenido). Lo inmutable es el **digest** (`sha256:…`), el hash del contenido de la imagen: desplegar por digest garantiza que corre exactamente esos bytes. Cerrar esto del todo requeriría firmar la imagen y verificar la procedencia (por ejemplo, cosign o las *attestations* de GitHub).

**El permiso `packages: write` va por job y no a nivel workflow**: a nivel workflow reemplaza el default de **todos** los jobs, incluidos los de deploy, que no publican nada. Por mínimo privilegio, sólo lo reciben los dos jobs que publican. No hizo falta ningún secret nuevo: se usa el `GITHUB_TOKEN` efímero de la corrida.

## 2. Continuous Delivery vs Continuous Deployment: cuál implementé

- **CI**: cada cambio se integra y se verifica automáticamente (build + tests + coverage).
- **Continuous Delivery**: cada cambio verificado queda **listo para salir** a producción, y el paso final es una **decisión humana**.
- **Continuous Deployment**: cada cambio verificado llega a producción **sin intervención humana**.

Implementé **Continuous Delivery**: QA se despliega solo y PROD espera una aprobación explícita. Corresponde a mi contexto porque:

- la app maneja reservas y pagos, y un bug en PROD es overbooking o plata mal cobrada;
- mis tests cubren reglas de negocio pero no hay tests end-to-end, ni monitoreo, ni alertas: la máquina sola no tiene información suficiente para decidir;
- el free tier no permite rollout gradual (canary) que limite el daño automáticamente.

**Qué me faltaría para Continuous Deployment:** tests e2e automáticos contra QA, observabilidad en PROD (tasa de errores, latencia, logs centralizados) con rollback automático cuando se degrade, y migraciones siempre compatibles hacia atrás. Hoy no lo querría: el gate humano es lo que compensa la falta de esa red de seguridad.

## 3. Diseño de la cadena (`needs` / `if` / environments) y alcance de cada secret

```
build-backend   (sin needs)  → tests + coverage + publica (sólo main)
build-frontend  (sin needs)  → ídem
deploy-qa       needs: [build-backend, build-frontend] · if: push a main · environment: qa
deploy-prod     needs: deploy-qa                        · environment: production (required reviewer)
```

- **`needs`** es la compuerta de calidad: sin los dos builds en verde no hay deploy a QA, y sin QA con el smoke en verde no hay deploy a PROD.
- **`if`** limita los deploys a los push a `main`. Los PRs verifican pero no despliegan, así que en un PR `deploy-qa` sale *skipped*. `deploy-prod` no repite el `if` y no es un olvido: depende de `deploy-qa`, y si ése se saltea, él también. La condición se hereda por la cadena.
- **`environment`** conecta cada job con su environment de GitHub, que me da tres cosas: **secrets y variables con alcance propio**, **reglas de protección** (el reviewer de `production`) e **historial de deployments** (qué commit está en cada entorno y desde cuándo).
- **`concurrency`** (`deploy-qa` / `deploy-prod`, sin cancelar) evita dos deploys al mismo entorno pisándose. No ordena la cola de aprobaciones: si quedan dos corridas esperando aprobación, rechazo la vieja a mano (aprobarla haría retroceder PROD).
- **`&ref=$GITHUB_SHA` en el hook**: el hook pelado despliega la punta de `main`. Con dos merges seguidos (A y B), la corrida de A desplegaría B, que todavía no pasó por nada; y en PROD, aprobaría A y subiría B. Con `&ref` cada corrida despliega **su** commit.

| Secret / variable | Dónde vive | Quién lo ve |
|---|---|---|
| `RENDER_HOOK_API`, `RENDER_HOOK_FRONT` (hooks de QA) | environment `qa` | sólo `deploy-qa` |
| `DATABASE_URL` (base `app_qa`) | environment `qa` | sólo `deploy-qa` (para las migraciones) |
| `RENDER_HOOK_API`, `RENDER_HOOK_FRONT` (hooks de PROD) | environment `production` | sólo `deploy-prod`, **y recién después de la aprobación** |
| `DATABASE_URL` (base `app_prod`) | environment `production` | ídem |
| `URL_API`, `URL_FRONT` (variables, no secretas) | una por environment | el job de ese environment (smoke + link del deployment) |
| `GITHUB_TOKEN` | lo genera GitHub por corrida | los jobs de build (`packages: write`) |

Los secrets se llaman **igual** en los dos environments a propósito: el job usa `secrets.RENDER_HOOK_API` y es el environment el que decide si eso es el hook de QA o el de PROD. Así es imposible que el job de QA dispare PROD por un error de nombre.

**Por qué los secrets de PROD viven en el environment y no en el repo:** un secret de repositorio lo puede leer **cualquier** job de **cualquier** workflow que corra en `main`, incluido uno que alguien agregue mañana sin pasar por el gate. Dentro del environment `production`, el secret sólo se entrega a un job que declaró ese environment **y fue aprobado**. Si estuviera en el repo, el required reviewer sería decorativo: cualquier `curl $HOOK` en otro job desplegaría PROD sin aprobación.

**Migraciones en el pipeline.** Mi app crea el esquema con **migraciones de Prisma** (no tiene `EnsureCreated` ni migra al arrancar). Cada job de deploy corre `prisma migrate deploy` contra **su** base antes de disparar el hook, así el código nuevo arranca contra un esquema que ya existe. En PROD, la migración también está detrás de la aprobación.

## 4. La dirección del backend no va adentro de la imagen

La guía usa una plantilla de nginx porque la app de la cátedra sirve el front como estáticos. Mi front es un **servidor Next.js** (`node server.js`): las llamadas al backend se hacen **del lado del servidor** (server actions y el `authorize` de NextAuth), con `process.env.BACKEND_URL`, que se lee **al ejecutar**, no al construir. Next.js sólo «hornea» en el build las variables `NEXT_PUBLIC_*`, y ninguna llamada al backend depende de ésas (`NEXT_PUBLIC_API_URL` es apenas un fallback que queda indefinido en Render). La prueba es que la **misma imagen** del frontend sirve en QA y en PROD: lo único que cambia es la variable `BACKEND_URL` de cada servicio.

| Queda **por variable** (cambia por entorno) | Queda **adentro de la imagen** (igual en todos) |
|---|---|
| `BACKEND_URL` (a qué api habla el front) | El código compilado (`.next/standalone`, `.next/static`) |
| `DATABASE_URL` (a qué base habla la api) | El cliente de Prisma generado y el esquema/migraciones |
| `AUTH_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `AUTH_TRUST_HOST` | Node 20 alpine, openssl, `sharp` |
| `BACKEND_API_KEY` (front↔back), `GEO_API_KEY` | Assets de `public/` |
| `PORT` (Render inyecta el suyo) | `NEXT_PUBLIC_*` (inlined en el build; hoy no se usa para llamar al backend) |

Esto es lo que hace posible el TP7: desplegar en los dos entornos **la imagen** publicada, configurándola sólo por variables.

## 5. Qué mira el aprobador antes de aprobar (criterios del gate)

Antes de tocar *Approve and deploy* reviso:

1. **Qué commit es** y qué PR lo trajo (título, diff). Si hay otra corrida más nueva esperando, rechazo la vieja.
2. **El smoke de QA en verde para ESE commit** (el log dice `corren <sha>`), y cuántas vueltas tardó: si tardó mucho más que lo habitual, miro por qué antes de seguir.
3. **QA a mano**: abro el front de QA y pruebo el flujo que tocó el cambio (por ejemplo, login, búsqueda o crear una reserva).
4. **Migraciones**: si el PR agrega una migración, que sea compatible hacia atrás (que no borre ni renombre columnas que el código viejo usa), porque el rollback de código no la deshace.
5. **Momento**: que yo esté disponible para reaccionar si PROD se rompe.

**Qué NO puede ver el aprobador:** cómo se comporta con datos y tráfico reales de PROD (QA tiene otra base y casi sin datos), la performance bajo carga, ni errores que no rompan `/api/health` (un 500 en una pantalla puntual). Le falta observabilidad: tasa de errores y latencia por endpoint, logs centralizados, métricas de negocio (reservas creadas por hora) y una comparación con la versión anterior.

## 6. La letra chica del free tier y cómo la maneja el pipeline

- **Render Free**: 750 horas de instancia por mes **por workspace** (cuatro servicios dormidos casi siempre entran); el servicio **se duerme tras ~15 min sin tráfico** y el primer request lo despierta con un **cold start** de hasta ~1 minuto; los **minutos de build** del plan gratuito son limitados, y cada merge aprobado son **cuatro builds de Next.js** (api y front, en QA y en PROD), así que no conviene mergear por cualquier cosa.
- **Neon Free**: 0.5 GB por proyecto, horas de cómputo mensuales limitadas; el cómputo **se suspende tras ~5 min idle** y se despierta solo en el primer query (en general menos de un segundo).
- **GitHub Actions**: el repo es público, así que los minutos son gratis y las *environment protection rules* también.

**Cómo lo maneja el pipeline:** el smoke **reintenta** (60 vueltas × 20 s = 20 min como máximo) con `curl --max-time 10` en cada request, para que un servicio que acepta la conexión pero no contesta (despertándose) no cuelgue el job. El tope es alto porque, además del cold start, incluye el **build de Next.js en Render**, que tarda minutos. Además, cada job de deploy tiene `timeout-minutes: 30`, para que un entorno roto no consuma el runner hasta el límite de 6 h.

## 7. Qué garantía pierdo porque Render reconstruye desde el repo

El pipeline publica la imagen que verificó, pero Render **no la usa**: con el hook + `&ref=<sha>` vuelve a construir los Dockerfiles **del mismo commit**. Despliego **el commit verificado, pero no la imagen verificada**. Entre los dos builds pueden cambiar cosas:

- `node:20-alpine` es un tag móvil: si se actualizó entre el build de CI y el de Render, corre otra base de sistema operativo/Node;
- `npm install --no-package-lock sharp` en el `runner` no está fijado por el lockfile y puede bajar otra versión;
- un paquete del registry de npm que se despublicó o cambió, o una falla de red en el build de Render (y entonces Render sigue sirviendo la versión anterior).

Además, el registry y lo que corre dejan de estar atados: no puedo decir «en PROD corre `ghcr.io/…:sha-X`», sólo «corre un build del commit X». El TP7 cierra esto haciendo que Render **ejecute la imagen del registry** en vez de construirla.

## 8. Qué prueba mi smoke test y qué NO

El smoke (`.github/scripts/smoke.sh`, el mismo para QA y PROD, con las URLs de las variables del environment) pasa sólo si, **en la misma vuelta**:

1. `api/api/health` contesta 200 **y su campo `commit` es igual a `github.sha`**;
2. `api/api/health/db` contesta 200: la api llega a **su** base y la tabla existe (hace un `count()` sobre una tabla real, no un `SELECT 1`; si la base no está migrada o la connection string está mal, da 503);
3. `front/api/health` informa el mismo commit (el front también se redesplegó);
4. `front/` contesta.

`/api/health` devuelve el commit desde `RENDER_GIT_COMMIT`, que Render inyecta al construir desde el repo. Ésta es la mitigación de la «limitación honesta» de la guía: el hook responde al instante y Render construye en background **mientras sigue sirviendo la versión anterior**. Un smoke que sólo pide `/health` daría verde contra la versión **vieja**; el mío sigue reintentando (`api=<sha viejo>`) hasta que corre el commit correcto, y si el build de Render falla, nunca llega y el job termina en rojo. Además le agregué `dynamic = 'force-dynamic'` a la ruta: sin eso, Next.js la renderizaba una vez en el build y devolvía siempre el mismo JSON.

**Qué NO prueba:**

- que el front **llegue al backend** (que `BACKEND_URL` y `BACKEND_API_KEY` estén bien configurados en el front): `front/` contesta aunque esa conexión esté rota;
- que funcionen los flujos de negocio (login, búsqueda, reserva) ni la performance;
- que las variables de auth (`AUTH_SECRET`, `NEXTAUTH_URL`) sean correctas;
- que la imagen corriendo sea la del registry (ver punto 7).

**Cómo comprobé que cada entorno usa su propia base:** inserté un servicio con un nombre inconfundible **sólo en `app_prod`** desde el SQL Editor de Neon y comprobé que el conteo de `/api/health/db` de PROD sube y el de QA no (⏳COMPLETAR con los números observados).

## 9. Deployment pattern para producción real

**Elijo blue-green** (con feature flags para las funcionalidades riesgosas).

- **Cómo funciona:** hay dos entornos de producción idénticos; uno (blue) recibe el tráfico y el nuevo (green) se despliega y se prueba aparte. Después se cambia el router para que green reciba todo el tráfico, y blue queda encendido como respaldo.
- **Por qué ése para MI app:** es una app de reservas con poco tráfico. Canary necesita **volumen de tráfico** para que el 5 % de usuarios sea estadísticamente significativo, y métricas para comparar las dos versiones; con pocas reservas por día, un canary no detecta nada en un tiempo razonable. Rolling no aporta mucho con una o dos instancias, y durante el rollout conviven dos versiones mezcladas. Blue-green me da un **smoke contra PROD real antes de exponer usuarios** y un **rollback instantáneo** (volver el router a blue, segundos en vez de un rebuild de minutos).
- **Costo:** el doble de infraestructura mientras conviven los dos entornos (en un plan pago, dos instancias por servicio). Para una app chica es aceptable; la base es compartida, no se duplica.
- **Riesgo y rollback:** el riesgo está en la **base compartida**: blue y green leen la misma. Exige migraciones **expand/contract** (primero agregar columnas compatibles, y recién en un deploy posterior sacar lo viejo), para que blue siga funcionando si hay que volver.
- **Feature flags** (deploy ≠ release): el código nuevo llega desactivado y se prende por configuración, sin deploy. Lo usaría, por ejemplo, para un nuevo cálculo de precios o un nuevo medio de pago: lo despliego apagado, lo prendo para un propietario de prueba y, si algo falla, lo apago sin rollback.
- **Qué observabilidad me falta hoy para ejecutarlo:** métricas de errores 5xx y latencia por versión, logs centralizados, una métrica de negocio (reservas creadas/fallidas) y alertas. Sin eso, después del switch no sabría si green está peor que blue. Y para canary, además, un router con división de tráfico por porcentaje, que Render Free no tiene.

## 10. Plan de rollback actual (medido)

Como cada deploy se dispara con un commit explícito, **volver atrás es disparar los hooks de PROD con el SHA del último deploy bueno**:

1. Detectar el problema (hoy: a mano, abriendo PROD o por aviso de un usuario).
2. Buscar el SHA bueno anterior: *Deployments → production*, o `git rev-list -n1 v6.0.0`.
3. Copiar los deploy hooks de PROD desde Render (*Settings → Deploy Hook*; el secret de GitHub no se puede volver a leer).
4. `curl "$HOOK_API_PROD&ref=$SHA_ANTERIOR"` y `curl "$HOOK_FRONT_PROD&ref=$SHA_ANTERIOR"`.
5. Esperar a que en Render → servicio de PROD → *Deploys* ese commit figure como **live**, y comprobar `/api/health` (que informe el SHA anterior).

Alternativa con la interfaz: *Actions* → corrida de ese commit → re-correr sólo el job `deploy-prod` (vuelve a pedir aprobación; sólo para corridas de menos de 30 días).

**Tiempo medido:** ⏳COMPLETAR. Lo hice una vez de verdad: hook disparado a las ⏳`HH:MM:SS`; en Render → `api-prod` → *Deploys*, el deploy del commit `⏳sha` empezó a las ⏳ y quedó **live** a las ⏳ → **⏳ minutos**. (El front: ⏳.)

**Lo que el rollback de código NO deshace:** los **datos** y el **esquema**. Si la versión mala ejecutó una migración que borró o renombró una columna, volver al código anterior no la recupera, y además el código viejo puede romper contra el esquema nuevo. Tampoco deshace las reservas creadas o modificadas mal por la versión rota. Para eso haría falta: migraciones expand/contract (nunca destructivas en el mismo deploy), backups o el *point-in-time restore* de Neon (branches/restore a un instante) y scripts de corrección de datos. La métrica DORA que ejercito es el **MTTR / tiempo de restauración del servicio** (*failed deployment recovery time*).

## 11. La release

La llegada a PROD está etiquetada como **`v6.0.0`** (el número lo fija el práctico, TP6 → v6.0.0, no SemVer) y publicada como Release de GitHub con notas generadas desde los PRs. El tag apunta al **commit que figura en Deployments → production**, no a la punta de `main`.

## 12. Si Render desaparece mañana

Sobrevive casi todo sin cambios: los Dockerfiles, las imágenes del registry, los jobs de build, la cadena de compuertas (`needs`/`if`), los environments con sus reviewers y secrets, el smoke (sólo cambian las variables `URL_*`), las migraciones y la release. Lo que migra es **una línea por job**: el «cómo» del deploy (el `curl` del hook se reemplaza por `flyctl deploy --image`, `railway up`, `kubectl set image`, etc.) y los valores de los secrets. Sobrevive porque el pipeline depende de **contratos** (una imagen, una URL que contesta `/api/health`, un environment que aprueba) y no del proveedor.

## 13. Problemas encontrados y cómo los resolví

- **La app no es .NET + nginx**: tuve que traducir la guía. La plantilla de nginx no aplica porque el front es un servidor Next.js; el equivalente es leer `BACKEND_URL` en runtime (ver punto 4). `EnsureCreated` tampoco existe: el esquema lo crean las migraciones de Prisma, que agregué como paso de cada job de deploy.
- **`/api/health` congelado**: un route handler de Next.js 14 sin uso de `request` se prerenderiza en el build. Le agregué `export const dynamic = 'force-dynamic'`, si no el `timestamp` y el `commit` salían del build.
- **No había endpoint de BD sin API key**: los endpoints de datos exigen `x-api-key`. En vez de darle la API key al smoke, agregué `/api/health/db`, que sólo devuelve un conteo.
- **Nombre del paquete en minúsculas**: `github.repository` tiene mayúsculas; escribí el nombre a mano.
- ⏳COMPLETAR con lo que aparezca al configurar Render/Neon.

## 14. Declaración de uso de IA

Usé Claude Code (Claude Opus 5.5) para leer la consigna y adaptar la guía a mi stack: el workflow (`ci.yml`: reorden del build, publicación, jobs de deploy, migraciones, environments), el script de smoke test, los endpoints `/api/health` y `/api/health/db`, y la redacción de esta sección.

**Cómo lo verifiqué:** validé que el YAML tenga los cuatro jobs al mismo nivel y que «Construir y publicar la imagen» sea el último paso de cada build; probé el smoke contra un servidor local falso (espera mientras el commit es el viejo, pasa cuando aparece el nuevo, falla si no hay respuesta); y en Actions comprobé el deploy a QA disparado tras el merge, el `Waiting for review`, la aprobación y el rechazo. Puedo explicar qué pasa entre el merge y PROD: merge → corrida de `main` → tests → publicar → `deploy-qa` (migración, hook con `&ref`, smoke) → pausa en `production` → aprobación → secrets de PROD → migración, hook, smoke.
