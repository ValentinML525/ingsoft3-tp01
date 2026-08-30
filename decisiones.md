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

- **Acoplamiento de Frontend y Backend en Next.js**: Al estar desarrollada con Next.js (framework fullstack), tanto la interfaz visual (frontend) como los endpoints de la API (`/api/*`) residían originalmente juntos en el mismo proyecto y servidor monolítico. Para cumplir con los requerimientos del trabajo práctico de tener frontend y backend contenerizados por separado, tuve que desacoplar la arquitectura en dos imágenes Docker independientes (`Dockerfile.backend` y `Dockerfile.frontend`), exponiéndolas en puertos distintos (3000 para frontend y 4000 para backend) y configurando variables de entorno de red para que el frontend consuma los servicios del backend a través de Docker Compose.

## Declaración de uso de IA

Se uso la IA para el formateo de los archivos, refactorizacion de codigo, resolucion de los problemas encontrado y para la separacion del front y backend.

# Decisiones TP3 — Metodologías Ágiles

## Análisis y redefinición de la Historia de Usuario

En primer lugar, crear una tabla en la base de datos es una tarea técnica que no aporta valor de negocio directo ni perceptible para el cliente/usuario final, por lo que no corresponde plantearla como una Historia de Usuario (HU), sino como una tarea técnica derivada de una necesidad funcional. No obstante, asumiendo el escenario en el que deba formularse como HU, la propuesta original presentaba inconsistencias:

- **Estructura**: La plantilla *"Como... Quiero... Para..."* corresponde al cuerpo de la descripción de la historia y no a su título. El título debe ser conciso y orientador.
- **Criterios de aceptación**: Carecía por completo de criterios de aceptación (*acceptance criteria*), lo cual es crítico dado que el desarrollador no tendría forma de determinar objetivamente cuándo la historia está finalizada (*Definition of Done*).

### Reformulación propuesta

- **Título**: Tabla de usuarios
- **Descripción**: *Como desarrollador, quiero crear la tabla `usuarios` en la base de datos para almacenar y gestionar de forma persistente y segura los datos de los usuarios.*
- **Criterios de aceptación**:
  - [ ] **Estructura de la tabla**: Definir la tabla `usuarios` con los campos `id` (PK, auto-incremental o UUID), `nombre`, `email`, `password_hash`, `rol`, `estado`, `created_at` y `updated_at`.
  - [ ] **Campos obligatorios**: Configurar restricción `NOT NULL` en `nombre`, `email`, `password_hash`, `rol` y `estado`.
  - [ ] **Unicidad de email**: Aplicar restricción `UNIQUE` sobre la columna `email` para evitar duplicados.
  - [ ] **Seguridad de contraseñas**: Asegurar que el campo `password_hash` almacene contraseñas cifradas mediante algoritmos seguros (ej. BCrypt, Argon2), nunca en texto plano.
  - [ ] **Valores por defecto**: Asignar valores por defecto para `rol` (ej. `'user'`) y `estado` (ej. `'activo'`).
  - [ ] **Auditoría temporal**: Configurar `created_at` con la fecha y hora actual de inserción (`CURRENT_TIMESTAMP`) y `updated_at` para actualizarse en modificaciones.
  - [ ] **Script de migración**: Proveer un script de migración versionado y ejecutable que soporte creación (`up`) y reversión (`down` / rollback).
  - [ ] **Validación de errores**: Validar que la base de datos rechace inserciones con emails duplicados o campos requeridos nulos.

## Duración del sprint y justificación

Generalmente en la industria se adoptan sprints de 2 semanas de duración. Sin embargo, para el desarrollo de la materia se definió utilizar **sprints de 1 semana**, dado que la cursada presenta una nueva entrega y trabajo práctico semanalmente, haciendo necesario trabajar con ciclos cortos, iteraciones rápidas y feedback continuo al cierre de cada semana.

## Límite de trabajo en curso (WIP)

Se configuró un límite de **2 tareas en simultáneo** para el estado *In Progress* en GitHub Projects. Al tratarse de un trabajo individual, establecer un WIP bajo evita la dispersión y la sobrecarga de cambios abiertos, promoviendo avanzar y completar tareas de principio a fin con commits pequeños, continuos y frecuentes en lugar de integraciones grandes y esporádicas.

## Problemas encontrados y cómo los resolviste

No se presentaron dificultades técnicas ni bloqueos durante la configuración del tablero ni en la carga de tareas en GitHub Projects.

## Declaración de uso de IA

No se utilizó IA para la configuración y gestión del proyecto en GitHub Projects, ya que todo el flujo de trabajo se realizó de forma directa sobre la interfaz web de GitHub. Únicamente se recurrió a la asistencia de IA para el formateo de este documento de decisiones.

