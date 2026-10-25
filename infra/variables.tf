variable "image_repo_api" {
  type    = string
  default = "ghcr.io/valentinml525/ingsoft3-tp01-backend" # SIN la etiqueta
}

variable "image_repo_front" {
  type    = string
  default = "ghcr.io/valentinml525/ingsoft3-tp01-frontend" # SIN la etiqueta
}

variable "image_tag" {
  type    = string
  default = "sha-eb8fed74aa497779bbb759ea7e396df3b1cb3beb" # merge del TP7 (release v7.0.0)
}

variable "region" {
  type    = string
  default = "oregon" # frankfurt | ohio | oregon | singapore | virginia
}

variable "neon_org_id" {
  type    = string
  default = "org-old-shadow-96443749" # no es secreto: identifica la organizacion, no da acceso
}
