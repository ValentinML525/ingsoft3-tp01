#!/usr/bin/env bash
# Smoke test post-deploy. Lo usan deploy-qa y deploy-prod con las URLs de SU environment.
#
#   URL_API, URL_FRONT  → vienen de las variables del environment (vars.URL_API / vars.URL_FRONT)
#   COMMIT_ESPERADO     → el commit que el pipeline verificó y mandó a desplegar (github.sha)
#
# Pasa sólo si, en la misma vuelta:
#   1. la api contesta /api/health Y dice que corre COMMIT_ESPERADO (no la versión anterior),
#   2. la api llega a su base y el esquema existe (/api/health/db),
#   3. el front contesta / Y también corre COMMIT_ESPERADO.
# El commit lo hornea el pipeline en la imagen (GIT_COMMIT): si el deploy no ocurrió, el servicio
# sigue con la imagen anterior y el smoke lo ve (commit viejo). Reintenta porque Render tarda en
# bajar y levantar la imagen y el free tier duerme (cold start).
set -u

INTENTOS="${INTENTOS:-60}"
ESPERA="${ESPERA:-20}"

: "${URL_API:?falta URL_API (variable del environment)}"
: "${URL_FRONT:?falta URL_FRONT (variable del environment)}"
: "${COMMIT_ESPERADO:?falta COMMIT_ESPERADO}"

commit_de() {
  # --max-time: un servicio despertando acepta la conexión y no contesta; sin tope curl se cuelga
  curl -fsS --max-time 10 "$1/api/health" 2>/dev/null | jq -r '.commit // empty' 2>/dev/null
}

echo "Esperando a que $URL_API y $URL_FRONT corran $COMMIT_ESPERADO..."
for i in $(seq 1 "$INTENTOS"); do
  API_COMMIT="$(commit_de "$URL_API")"
  FRONT_COMMIT="$(commit_de "$URL_FRONT")"

  if [ "$API_COMMIT" = "$COMMIT_ESPERADO" ] \
     && [ "$FRONT_COMMIT" = "$COMMIT_ESPERADO" ] \
     && curl -fsS --max-time 10 "$URL_API/api/health/db" > /dev/null \
     && curl -fsS --max-time 10 "$URL_FRONT/" > /dev/null; then
    echo "✅ vuelta $i: api + BD + front responden y corren $COMMIT_ESPERADO"
    exit 0
  fi

  echo "⏳ vuelta $i/$INTENTOS: api=${API_COMMIT:-sin respuesta} · front=${FRONT_COMMIT:-sin respuesta}"
  sleep "$ESPERA"
done

echo "❌ el entorno no corrió $COMMIT_ESPERADO a tiempo ($((INTENTOS * ESPERA)) s)"
exit 1
