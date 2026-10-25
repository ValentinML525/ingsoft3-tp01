terraform {
  required_version = ">= 1.5"

  required_providers {
    neon = {
      source  = "kislerdm/neon"
      version = "0.18.0" # fijada: el repo del provider esta archivado
    }
    render = {
      source  = "render-oss/render"
      version = "1.9.1"
    }
    random = {
      source  = "hashicorp/random"
      version = "3.7.2"
    }
  }
}

provider "neon" {}   # lee NEON_API_KEY
provider "render" {} # lee RENDER_API_KEY y RENDER_OWNER_ID

# --- La base de PREPROD: un proyecto de Neon propio, que se puede destruir entero ---

resource "neon_project" "preprod" {
  name   = "miapp-preprod"
  org_id = var.neon_org_id # Neon exige la organizacion en cuentas con org (error 400 "org_id is required")

  # Sin esto el primer apply falla: el default (1 dia) supera el tope del plan gratuito (6 horas).
  history_retention_seconds = 21600
}

resource "neon_role" "preprod" {
  project_id = neon_project.preprod.id
  branch_id  = neon_project.preprod.default_branch_id
  name       = "app_preprod_owner"
}

resource "neon_database" "preprod" {
  project_id = neon_project.preprod.id
  branch_id  = neon_project.preprod.default_branch_id
  name       = "app_preprod"
  owner_name = neon_role.preprod.name
}

# --- Secretos del entorno: los genera Terraform, nadie los copia ni los escribe en el HCL ---

resource "random_password" "backend_api_key" {
  length  = 48
  special = false
}

resource "random_password" "auth_secret" {
  length  = 48
  special = false
}

locals {
  # La cadena de conexion se ARMA con lo que devolvio Neon (host, rol, password, base).
  database_url = "postgresql://${neon_role.preprod.name}:${urlencode(neon_role.preprod.password)}@${neon_project.preprod.database_host}/${neon_database.preprod.name}?sslmode=require"

  # Variables de auth/api-key: las comparten el front y la api (mismo secreto en los dos).
  auth_env = {
    BACKEND_API_KEY = { value = random_password.backend_api_key.result }
    AUTH_SECRET     = { value = random_password.auth_secret.result }
    NEXTAUTH_SECRET = { value = random_password.auth_secret.result }
    AUTH_TRUST_HOST = { value = "true" }
  }
}

# Terraform crea la BASE, no el ESQUEMA: la app no migra al arrancar (lo hacen las migraciones de
# Prisma, igual que en los jobs de deploy de ci.yml). Se re-ejecuta si la base se recrea.
resource "terraform_data" "migraciones" {
  triggers_replace = [neon_database.preprod.id]

  provisioner "local-exec" {
    command     = "npx --yes prisma@5.21.1 migrate deploy --schema ${path.module}/../prisma/schema.prisma"
    environment = { DATABASE_URL = local.database_url }
  }
}

# --- Los dos servicios, corriendo la imagen del TP7 ---

resource "render_web_service" "api" {
  name   = "miapp-api-preprod"
  plan   = "free"
  region = var.region

  runtime_source = {
    image = {
      image_url = var.image_repo_api # sin la etiqueta
      tag       = var.image_tag
    }
  }

  # No se declara GIT_COMMIT: lo hornea la imagen y /api/health lo informa.
  env_vars = merge(local.auth_env, {
    DATABASE_URL = { value = local.database_url }
  })

  depends_on = [terraform_data.migraciones]
}

resource "render_web_service" "front" {
  name   = "miapp-front-preprod"
  plan   = "free"
  region = var.region

  runtime_source = {
    image = {
      image_url = var.image_repo_front
      tag       = var.image_tag
    }
  }

  env_vars = merge(local.auth_env, {
    BACKEND_URL = { value = trimsuffix(render_web_service.api.url, "/") } # sale de la api, no de un copy-paste
  })
}
