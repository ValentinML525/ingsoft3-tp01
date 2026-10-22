# TP6: qué se hizo, cómo funciona y respuestas a la defensa

Este archivo explica en detalle la implementación del TP6 (CD: environments, aprobaciones y deployment patterns) sobre la app de reservas (Next.js + Prisma, dos imágenes: backend y frontend). Las decisiones con su justificación "oficial" están en `decisiones.md` (sección TP6); acá está el **recorrido completo**, los **pasos manuales** que dependen de cuentas externas, y las **respuestas a las preguntas de la defensa oral**.

---

## 1. Qué cambió en el repositorio

| Archivo | Cambio | Para qué |
|---|---|---|
| `.github/workflows/ci.yml` | Reescrito: los builds publican la imagen al final y se agregaron `deploy-qa` y `deploy-prod` | Tareas 1, 3 y 4 |
| `.github/scripts/smoke.sh` | Nuevo | Smoke test post-deploy con reintentos, compartido por QA y PROD |
| `src/app/api/health/route.ts` | Devuelve el `commit` que corre + `force-dynamic` | Que el smoke sepa **qué versión** contesta |
| `src/app/api/health/db/route.ts` | Nuevo | Que el smoke pruebe que la api llega a **su** base y que el esquema existe |
| `decisiones.md` | Sección «Enlaces de este TP» arriba de todo + sección «Decisiones TP6» al final | Entregables 2 y 3 |

### 1.1 El cierre del CI: publicar la imagen, y sólo la que pasó (Tarea 1)

En cada job de build (`build-backend`, `build-frontend`):

1. **`permissions: contents: read / packages: write` dentro del job**, no a nivel workflow. A nivel workflow reemplazaría los permisos por defecto de **todos** los jobs (incluidos los de deploy, que no publican): por mínimo privilegio, sólo los jobs que publican pueden escribir paquetes.
2. **Se eliminó el build de la imagen final que estaba ANTES de los tests** (el del TP4, con `push: false`) y se movió al **final** del job. El orden del job quedó:

   ```
   1 · Qué estamos verificando
   2 · Bajar el código al runner
   3 · Preparar el constructor (buildx)
   4 · Construir la etapa de tests
   5 · Correr los tests con coverage        ← si falla, el job muere acá
   6 · Resumen del coverage    (!cancelled)
   7 · Publicar coverage       (!cancelled)
   8 · Entrar al registry      (sólo push a main)
   9 · Construir y PUBLICAR la imagen   ← ÚLTIMO
   ```

3. **«Entrar al registry»** (`docker/login-action`) con el `GITHUB_TOKEN` de la corrida, sólo si `github.event_name == 'push' && github.ref == 'refs/heads/main'`.
4. **«Construir y publicar la imagen»** con `push: ${{ github.event_name == 'push' && github.ref == 'refs/heads/main' }}` y tag `ghcr.io/valentinml525/ingsoft3-tp01-<backend|frontend>:sha-<commit>`. El nombre va en minúsculas a mano porque `github.repository` = `ValentinML525/…` tiene mayúsculas y ghcr.io las rechaza.

**Por qué no hay un `if: success()`**: los pasos de un job corren en orden y se cortan al primer error. Si los tests fallan, los pasos 8 y 9 nunca se ejecutan. **La condición está en el orden.** Los pasos 6 y 7 llevan `!cancelled()` (para ver el coverage aunque falle), pero los que publican **no**: si lo tuvieran, publicarían con tests en rojo.

**Por qué el mismo paso construye y publica**: si publicara un job aparte, tendría que reconstruir, y lo publicado sería una reconstrucción y no lo verificado.

### 1.2 Los jobs de deploy (Tareas 2, 3 y 4)

```
build-backend ─┐
               ├─► deploy-qa ──► deploy-prod
build-frontend ┘   (env: qa)     (env: production, ⏸ required reviewer)
```

**`deploy-qa`**:
- `needs: [build-backend, build-frontend]`: sin los dos builds en verde no se despliega.
- `if: github.event_name == 'push' && github.ref == 'refs/heads/main'`: en un PR sale *skipped*.
- `environment: qa`: recibe los secrets y variables de QA y queda registrado en *Deployments* (con el link a la URL del front).
- `concurrency: deploy-qa` (sin cancelar): dos deploys a QA no se pisan.
- Pasos:
  1. checkout (para tener `prisma/` y el script del smoke);
  2. **`prisma migrate deploy`** contra `DATABASE_URL` (la base `app_qa`). Mi app crea el esquema con migraciones de Prisma, no al arrancar: si no se migra, la base queda vacía y la app «levanta» pero falla;
  3. **dispara los dos deploy hooks de Render con `&ref=$GITHUB_SHA`**: Render despliega **ese** commit y no la punta de `main`;
  4. **smoke test** (`.github/scripts/smoke.sh`).

**`deploy-prod`**: igual, pero con `needs: deploy-qa` y `environment: production`. Al llegar a este job, el workflow **se pausa** («Waiting for review») hasta que el reviewer aprueba o rechaza. Recién después de aprobar, GitHub le entrega los secrets de PROD. No repite el `if` de la rama porque depende de `deploy-qa`, que ya lo tiene.

### 1.3 El smoke test

`smoke.sh` reintenta hasta 60 veces cada 20 s (20 min como máximo; cada `curl` con `--max-time 10`). Pasa sólo si, **en la misma vuelta**:

1. `API/api/health` → 200 y `commit == github.sha`;
2. `API/api/health/db` → 200 (hace un `count()` real sobre la tabla `Servicio`: base conectada **y** migrada);
3. `FRONT/api/health` → `commit == github.sha` (el front también se redesplegó);
4. `FRONT/` → contesta.

Mientras Render construye, sigue sirviendo la versión anterior: el smoke imprime `api=<sha viejo>` y espera. Si el build de Render falla, el commit nuevo nunca aparece y el job termina **en rojo**. Así se mitiga la «limitación honesta» de la guía (un smoke que sólo pide `/health` da verde contra la versión vieja).

El commit sale de `RENDER_GIT_COMMIT`, una variable que Render inyecta en los servicios que construye desde el repo (con `GIT_COMMIT` como alternativa para otros entornos). `/api/health` lleva `export const dynamic = 'force-dynamic'` porque Next.js 14 prerenderiza en el build los route handlers que no usan el `request`: sin eso, la respuesta quedaba congelada.

Las URLs no están escritas en el YAML: son **variables del environment** (`vars.URL_API`, `vars.URL_FRONT`), y cada environment tiene las suyas. El mismo script sirve para QA y para PROD.

### 1.4 La dirección del backend fuera de la imagen

La guía usa una plantilla de nginx porque su front son estáticos. Mi front es un **servidor Next.js** que llama al backend del lado del servidor con `process.env.BACKEND_URL`, que se lee **en runtime**. Next.js sólo inyecta en el build las variables `NEXT_PUBLIC_*`. Por eso la misma imagen del front sirve en QA y en PROD: lo único que cambia es la variable `BACKEND_URL` del servicio de Render. No hizo falta tocar el código del front.

---

## 2. Pasos manuales (cuentas externas): la checklist

Estos pasos no se pueden hacer desde el repositorio. El orden importa.

### 2.1 Neon (base de datos)
1. neon.com → *Sign up* con GitHub → crear proyecto `reservas`.
2. *Databases → Add database*: `app_qa` y `app_prod`.
3. *Connect* → elegir cada database → copiar la **connection string directa (sin `-pooler`)** en formato URI: `postgresql://usuario:pass@ep-xxx.region.aws.neon.tech/app_qa?sslmode=require`. Usar la directa porque `prisma migrate deploy` necesita una conexión no pooleada.

### 2.2 Render (cuatro Web Services, todos *Docker*, *Free*)

| Servicio | Dockerfile Path | Docker Context | Variables de entorno |
|---|---|---|---|
| `reservas-api-qa` | `./Dockerfile.backend` | `.` | `DATABASE_URL` (app_qa), `AUTH_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`=URL de esta api, `AUTH_TRUST_HOST=true`, `BACKEND_API_KEY`, `GEO_API_KEY` |
| `reservas-front-qa` | `./Dockerfile.frontend` | `.` | `BACKEND_URL`=URL de api-qa (**sin barra final**), `BACKEND_API_KEY` (la misma que api-qa), `AUTH_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`=URL de este front, `AUTH_TRUST_HOST=true` |
| `reservas-api-prod` | ídem api | `.` | ídem, con `DATABASE_URL` de **app_prod** |
| `reservas-front-prod` | ídem front | `.` | ídem, con `BACKEND_URL` = api-**prod** |

- **Settings → Auto-Deploy: Off** en los cuatro (si queda en On, el pipeline es decorado).
- **Settings → Deploy Hook**: copiar la URL de cada servicio (es un secret).
- Comprobar en el Dashboard que la columna *Runtime* diga `Docker` en los cuatro.
- **Antes del primer deploy, las bases están vacías**: el primer arranque de la api va a fallar en `/api/health/db` hasta que el pipeline corra `prisma migrate deploy`. Es esperado.

### 2.3 GitHub (environments, secrets y variables)

```bash
# Environments (qa sin reglas; production con required reviewer, sin "prevent self-review")
#   → Settings → Environments, o por API (ver más abajo)

# Secrets de QA (gh los pide por stdin: no quedan en el historial)
gh secret set RENDER_HOOK_API   --env qa
gh secret set RENDER_HOOK_FRONT --env qa
gh secret set DATABASE_URL      --env qa
gh variable set URL_API   --env qa --body https://reservas-api-qa.onrender.com
gh variable set URL_FRONT --env qa --body https://reservas-front-qa.onrender.com

# Secrets de PROD, dentro del environment production
gh secret set RENDER_HOOK_API   --env production
gh secret set RENDER_HOOK_FRONT --env production
gh secret set DATABASE_URL      --env production
gh variable set URL_API   --env production --body https://reservas-api-prod.onrender.com
gh variable set URL_FRONT --env production --body https://reservas-front-prod.onrender.com
```

### 2.4 Recorrido para generar la evidencia
1. PR `feature/tp6-cd` → checks en verde → **ésa es la corrida de la cadena 1** (job `build-backend`, «Entrar al registry» *skipped*).
2. *Squash and merge* → corrida de `main` → **cadena 2** (lista de pasos con «Construir y publicar» último) → `deploy-qa` → smoke → `deploy-prod` en *Waiting for review*.
3. **Rechazar** esa primera corrida con un motivo propio y específico de lo que se vio en ella.
4. Hacer públicos los dos paquetes (perfil → *Packages* → *Package settings* → *Change visibility* → *Public*) y probar `docker logout ghcr.io && docker pull …`.
5. Otro PR con un cambio **visible** en el front (por ejemplo, un texto del home) → merge → QA → **aprobar** → PROD verde y el cambio visible en la URL de PROD.
6. Comprobar que las bases son distintas: en el SQL Editor de Neon, sobre `app_prod`: `insert into "Servicio" (nombre, icon) values ('SOY PROD', 'test');`, y comparar `/api/health/db` (`servicios`) entre QA y PROD.
7. Release: `export SHA_PROD=$(gh api 'repos/{owner}/{repo}/deployments?environment=production' --jq '.[0].sha')`, `git tag v6.0.0 $SHA_PROD`, `git push origin v6.0.0`, `gh release create v6.0.0 --generate-notes --verify-tag`.
8. Rollback cronometrado: mergear y aprobar un cambio más, y volver a `v6.0.0` disparando los hooks de PROD con `&ref=$(git rev-list -n1 v6.0.0)`. Anotar las horas de inicio y *live* que muestra Render → *Deploys*.
9. Completar los `⏳COMPLETAR` de `decisiones.md`.

---

## 3. Respuestas a las preguntas de la defensa oral

### ¿Qué produce tu pipeline y dónde queda? Mostrame la imagen publicada y decime de qué commit salió.
Produce **dos imágenes Docker**: `ghcr.io/valentinml525/ingsoft3-tp01-backend` y `…-frontend`, en GitHub Container Registry, públicas. El tag es `sha-<commit>`: el commit de `main` (el del squash merge) cuya corrida las construyó y verificó. Para mostrarlo: perfil → *Packages* → el paquete → la versión `sha-…`, y ese SHA se busca en el historial de `main` (`git log`) o en la corrida de Actions que dice «commit <sha>» en su primer paso.

### ¿Cómo probás que lo que está publicado es exactamente lo que pasó la verificación?
No hay un control único: son **tres eslabones** que, encadenados, lo hacen imposible por accidente:
1. **Nada entra a `main` sin verde**: la protección de rama exige los checks de build/tests/coverage.
2. **Sólo `main` publica**: el login y el `push:` están condicionados a `push` en `refs/heads/main`. Se ve en un PR verde con «Entrar al registry» *skipped*.
3. **Publicar es el último paso del mismo job que testea**: si los tests fallan, el job muere antes. Se ve en la lista de pasos de una corrida de `main`.

Lo que **no** garantiza: un `docker push` manual con credenciales entra igual, y los tags son mutables. La garantía fuerte sería desplegar por **digest** (`@sha256:…`, inmutable) y firmar las imágenes.

### CI, Continuous Delivery, Continuous Deployment: definí las tres y decime cuál implementaste. ¿Qué te faltaría para la tercera? ¿La querrías?
- **CI**: cada cambio se integra seguido a la rama principal y se verifica automáticamente (build + tests).
- **Continuous Delivery**: todo cambio verificado queda **desplegable** y llega solo hasta un entorno previo; el paso a producción es una **decisión humana** (un botón).
- **Continuous Deployment**: todo cambio verificado llega a **producción sin intervención humana**.

Implementé **Continuous Delivery** (QA automático, PROD con aprobación). Para Continuous Deployment me faltarían tests e2e contra QA, observabilidad en PROD (errores, latencia, métricas de negocio), rollback automático ante degradación, y migraciones siempre compatibles hacia atrás. Hoy **no** la querría: sin esa red de seguridad, el humano es el único control que mira algo más que «contesta 200», y es una app que maneja reservas y plata.

### ¿Qué es un environment de GitHub? Nombrá las tres cosas que te da y mostrámelas en TU repo.
Es un objeto de GitHub que representa un destino de deploy (`qa`, `production`) y al que un job se ata con `environment:`. Da:
1. **Secrets y variables con alcance propio**: *Settings → Environments → production → Environment secrets* (`RENDER_HOOK_API`, `RENDER_HOOK_FRONT`, `DATABASE_URL`) y variables (`URL_API`, `URL_FRONT`).
2. **Reglas de protección**: *Required reviewers* en `production` (yo, con *Prevent self-review* desactivado).
3. **Historial de deployments**: link *Deployments* en la home del repo, filtrable por environment, con qué commit está en cada entorno y desde cuándo.

### ¿Por qué QA se despliega solo y PROD no? ¿Qué "compra" la aprobación humana? ¿Cuándo NO agregaría valor?
QA es para **detectar problemas**: si se rompe, el costo es bajo y conviene que siempre tenga lo último. PROD tiene usuarios reales: un error cuesta plata y confianza.

La aprobación compra **juicio y contexto** que la máquina no tiene: mirar QA a mano, evaluar si el momento es oportuno (si hay alguien para reaccionar), detectar que una migración es riesgosa, ordenar dos corridas que esperan, y además deja **trazabilidad** (quién aprobó qué y cuándo).

**No agrega valor** cuando se vuelve un trámite: si el aprobador aprueba sin mirar (*rubber stamp*), sólo agrega demora. Tampoco cuando la verificación automática ya es mejor que lo que un humano puede ver (buena suite e2e + canary con métricas + rollback automático), o con cambios triviales de bajo riesgo y deploys muy frecuentes: ahí el gate frena el flujo y agranda los lotes, que es justamente lo que aumenta el riesgo.

### ¿Por qué los secrets de PROD viven en el environment y no en el repo? ¿Qué pasaría si estuvieran en el repo?
En el environment `production`, GitHub **sólo** se los entrega a un job que declara `environment: production` **y fue aprobado**. Si estuvieran en el repo, **cualquier** job de cualquier workflow que corra en `main` podría leerlos: alguien podría agregar un `curl $HOOK_PROD` en otro job y desplegar PROD sin pasar por el reviewer. El gate quedaría como decoración. Además, en mi diseño los secrets tienen **el mismo nombre** en los dos environments, así que el job de QA físicamente no puede leer el hook de PROD.

### ¿Qué es un smoke test? ¿Por qué el tuyo reintenta? Mostrame qué pasa si el deploy "termina" pero la app no responde.
Es una prueba **mínima y rápida post-deploy** que confirma que lo esencial está vivo (la app levanta, contesta, llega a la base), sin probar funcionalidades en detalle. Si falla, el deploy se considera fallido.

Reintenta porque el hook de Render responde **al instante** y el build ocurre en background (varios minutos para Next.js), y además el free tier duerme los servicios (**cold start** de hasta ~1 min). Un `curl` seco daría falsos rojos. Cada `curl` lleva `--max-time 10` para que un servicio que acepta la conexión y no contesta no cuelgue la vuelta.

Si el deploy «termina» pero la app no responde (o responde con la versión vieja porque el build falló), el smoke imprime en cada vuelta `api=sin respuesta` o `api=<sha viejo>`, y después de 60 vueltas sale con `exit 1`: el job queda **rojo** y `deploy-prod` no corre. Si la api contesta pero la base no está migrada o la connection string está mal, `/api/health/db` da **503** y también queda rojo.

### Mostrame el rechazo documentado: ¿por qué se rechazó y qué pasó con ese run?
(Se muestra en *Actions* → la corrida → job `deploy-prod` → el comentario del rechazo.) El motivo tiene que ser mío y concreto sobre esa corrida. Qué pasó con el run: el job `deploy-prod` queda como **failed/rejected**, **no se ejecuta ningún paso** (los secrets de PROD nunca se entregaron, el hook no se llamó) y PROD sigue con la versión anterior. Una corrida rechazada **no se puede aprobar después**: para desplegar hace falta otra corrida.

### Blue-green vs canary: explicá ambos, y por qué elegiste el de tu `decisiones.md` para TU app. ¿Qué te falta hoy para hacer canary en serio?
- **Blue-green**: dos entornos de producción idénticos. Uno (blue) atiende el tráfico y en el otro (green) se despliega y se prueba la versión nueva; después se cambia el router de golpe a green. El rollback es volver el router a blue (segundos). Cuesta el doble de infraestructura mientras conviven.
- **Canary**: la versión nueva recibe primero un porcentaje chico del tráfico (por ejemplo, 5 %), se comparan sus métricas con la vieja y se va subiendo de a poco si están bien. Limita el «radio de explosión», pero requiere división de tráfico y métricas.

Elegí **blue-green** porque mi app de reservas tiene **poco tráfico**: un 5 % de usuarios es casi nadie, y un canary no juntaría señal estadística en un tiempo razonable. Blue-green me da probar contra la infraestructura real de PROD antes de exponer a nadie, y un rollback instantáneo. Su riesgo es la base compartida: exige migraciones expand/contract.

Para canary en serio me falta: un router/load balancer con división de tráfico por porcentaje (Render Free no lo tiene), métricas por versión (tasa de 5xx, latencia p95, reservas exitosas), alertas, un criterio automático de promoción o rollback, y tráfico suficiente.

### Deploy ≠ release: explicalo con feature flags. ¿Para qué usarías un flag en tu app?
**Deploy** es poner código nuevo a correr en un entorno; **release** es exponer una funcionalidad a los usuarios. Con un **feature flag**, el código se despliega **apagado** (un `if (flags.nuevoCalculoPrecios)`) y se «libera» cambiando una configuración, sin otro deploy; también se puede prender para un grupo (un propietario de prueba) o apagar al instante si falla, sin rollback.

En mi app lo usaría para un **nuevo cálculo de precios o de disponibilidad** (donde un bug provoca overbooking o cobros mal hechos), o para un nuevo medio de pago: lo despliego apagado, lo prendo para una propiedad de prueba, comparo y recién después lo abro a todos.

### PROD está roto tras un deploy aprobado: ¿qué hacés? (paso a paso, con tiempos). ¿Qué métrica DORA estás ejercitando?
1. **Detectar y confirmar** (abrir PROD, mirar `/api/health`, logs de Render): ~1-2 min.
2. **Decidir rollback, no fix hacia adelante**: primero restauro el servicio, después investigo.
3. **Identificar el último SHA bueno**: *Deployments → production* o `git rev-list -n1 v6.0.0`: ~1 min.
4. **Disparar los hooks de PROD con ese SHA**: `curl "$HOOK_API_PROD&ref=$SHA"` y `curl "$HOOK_FRONT_PROD&ref=$SHA"` (los hooks se copian de Render porque el secret de GitHub no se relee): ~1 min.
5. **Esperar a que Render lo muestre *live*** en *Deploys* (rebuild de Next.js + arranque): **el tiempo medido está en `decisiones.md`** (⏳ completar con la medición real).
6. **Verificar** que `/api/health` informe el SHA anterior y que el flujo roto funcione.
7. **Después**: revertir o arreglar el commit en `main` por PR, para que el próximo deploy no vuelva a subir el problema; y revisar si hubo una migración o datos dañados (el rollback de código no los deshace).

La métrica DORA es el **tiempo de restauración del servicio** (MTTR, hoy *failed deployment recovery time*). Indirectamente también la **tasa de fallas de cambios** (*change failure rate*), porque este deploy cuenta como fallido.

### ¿Por qué `v1.2.0` y no `v2.0.0`? ¿Qué prometés con ese número?
Es **SemVer** (`MAJOR.MINOR.PATCH`):
- **MAJOR** (`2.0.0`): cambio **incompatible** (rompe la API o el contrato: se saca un endpoint, cambia un formato), y quien te usa tiene que adaptarse.
- **MINOR** (`1.2.0`): agrega funcionalidad **compatible hacia atrás**: todo lo que andaba con `1.1` sigue andando.
- **PATCH** (`1.2.1`): sólo corrige bugs, sin funcionalidad nueva.

Pasar de `1.1.x` a `1.2.0` promete «hay cosas nuevas y no rompí nada»; `2.0.0` avisaría «hay un cambio que te rompe». En este TP el tag es `v6.0.0` porque lo **fija el práctico** (TP6 → v6), no por SemVer: es una marca de entrega, no una versión de producto.

### Si Render desaparece mañana, ¿qué partes de tu TP sobreviven sin cambios y cuáles migran?
**Sobreviven sin cambios**: los Dockerfiles, las imágenes del registry, los jobs de build y su orden, la cadena `needs`/`if`, los environments con reviewers, el alcance de los secrets, el smoke test (sólo cambian los valores de `URL_API`/`URL_FRONT`), las migraciones de Prisma contra Neon, la release y el plan de rollback (conceptualmente).

**Migran**: el paso «Disparar deploy» de cada job (el `curl` al hook se reemplaza por `flyctl deploy --image …`, `railway up`, `az webapp deploy`, `kubectl set image …`), los valores de los secrets de deploy, y `RENDER_GIT_COMMIT` (pasaría a `GIT_COMMIT`, que el endpoint ya acepta). Sobrevive casi todo porque el pipeline está escrito contra **contratos** (una imagen OCI, un endpoint HTTP que contesta su versión, un environment que aprueba), y el proveedor es un detalle intercambiable. Con un proveedor que despliega **por imagen**, incluso se ganaría la garantía que hoy falta (correr la imagen verificada en vez de reconstruirla).
