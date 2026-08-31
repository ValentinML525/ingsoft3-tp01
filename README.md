[![CI](https://github.com/ValentinML525/ingsoft3-tp01/actions/workflows/ci.yml/badge.svg)](https://github.com/ValentinML525/ingsoft3-tp01/actions/workflows/ci.yml)

# Reservas App — Sistema de Reservas

Aplicación web de gestión de reservas construida con Next.js, Prisma y PostgreSQL.

## Requisitos previos

- [Docker](https://docs.docker.com/get-docker/) y [Docker Compose](https://docs.docker.com/compose/install/) instalados.

## Arranque rápido

### 1. Clonar el repositorio

```bash
git clone https://github.com/ValentinML525/ingsoft3-tp01.git
cd ingsoft3-tp01
```

### 2. Configurar las variables de entorno

```bash
cp .env.example .env
```

Editá el archivo `.env` y completá los valores (contraseñas, secretos, API keys).

### 3. Levantar el sistema (build local)

```bash
docker compose up -d
```

Esto construye la imagen de la app localmente y levanta todos los servicios (app + base de datos).

### 4. Levantar el sistema (desde registry)

Si preferís usar las imágenes pre-construidas publicadas en GitHub Container Registry:

```bash
docker compose -f docker-compose.registry.yml up -d
```

### 5. Acceder a la aplicación

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## Comandos útiles

```bash
# Ver logs de los contenedores
docker compose logs -f

# Detener los servicios (conserva datos)
docker compose down

# Detener los servicios y eliminar los volúmenes (borra datos de la BD)
docker compose down -v
```
