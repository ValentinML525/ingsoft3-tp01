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



