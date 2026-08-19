# Umapyoi Calc - Guia de Desarrollo

Proyecto frontend con React + TypeScript + Vite conectado a Firebase:

- Hosting: Firebase Hosting
- Base de datos: Firestore
- Imagenes: Firebase Storage

Este README sirve como manual de trabajo para seguir desarrollando en cualquier computadora.

## 1) Estructura del Workspace

En el workspace existen dos carpetas principales:

- `old/` -> referencia antigua con datos estaticos e imagenes locales.
- `umapyoi-calc/` -> app actual conectada a Firebase.

IMPORTANTE:

- Todos los comandos del proyecto se ejecutan dentro de `umapyoi-calc/`.
- Si ejecutas comandos npm o firebase en la carpeta padre, veras errores de contexto.

## 2) Requisitos

- Node.js 22+
- npm 11+
- Firebase CLI instalado globalmente

Instalar Firebase CLI:

```powershell
npm install -g firebase-tools
```

## 3) Primera Configuracion en una Nueva PC

### Paso 1: abrir el proyecto y dependencias

```powershell
cd C:\ruta\a\tu\workspace\umapyoi-calc
npm install
```

### Paso 2: crear archivo .env.local

Crear `umapyoi-calc/.env.local` con este formato (sin comillas):

```env
VITE_FIREBASE_API_KEY=TU_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=TU_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=umapyoi-calc-dev
VITE_FIREBASE_STORAGE_BUCKET=umapyoi-calc-dev.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=TU_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=TU_APP_ID
VITE_FIREBASE_MEASUREMENT_ID=TU_MEASUREMENT_ID
```

### Paso 3: login de Firebase CLI

```powershell
firebase login --reauth
```

### Paso 4: verificar proyecto activo

Este repo ya tiene configurado `umapyoi-calc-dev` en `.firebaserc`.

```powershell
firebase use
```

Si necesitas forzar proyecto:

```powershell
firebase use umapyoi-calc-dev
```

## 4) Comandos NPM Disponibles

### Desarrollo local

- `npm run dev` -> levanta Vite en modo desarrollo.
- `npm run build` -> compila TypeScript y genera `dist`.
- `npm run lint` -> ejecuta ESLint.
- `npm run preview` -> sirve localmente el build de `dist`.

### Datos y deploy en Firebase

- `npm run upload:storage` -> sube imagenes a Firebase Storage.
- `npm run seed:firestore` -> carga JSON a Firestore (`characters` y `cards`).
- `npm run sync:data` -> ejecuta `upload:storage` + `seed:firestore`.
- `npm run deploy:hosting` -> ejecuta `build` + deploy de Hosting.
- `npm run publish:auto` -> ejecuta `sync:data` + `deploy:hosting`.

## 5) Deploy a Produccion (Hosting)

```powershell
npm run deploy:hosting
```

Si quieres hacerlo manual:

```powershell
npm run build
firebase deploy --only hosting --project umapyoi-calc-dev
```

URL esperada del sitio:

- https://umapyoi-calc-dev.web.app

## 6) Scripts de Migracion de Datos (One-time o bajo demanda)

El proyecto incluye scripts para cargar assets, sembrar Firestore y desplegar Hosting:

- `npm run upload:storage`
- `npm run check:storage` (dry-run sin subir)
- `npm run seed:firestore`
- `npm run check:seed` (dry-run sin escribir)
- `npm run check:data` (check:storage + check:seed)
- `npm run sync:data`
- `npm run deploy:hosting`
- `npm run publish:auto`

Para `upload:storage` y `seed:firestore` en modo escritura, necesitas una Service Account Key (JSON) descargada desde Firebase Console.
El modo `--dry-run` de `upload:storage` y `seed:firestore` no escribe en Firebase y no requiere credenciales.

### Donde colocar tus datos reales

- Imagenes de personaje: `public/main/*.png`
- Banners/cards: `public/outfits/*.png`
- Racewear: `public/racewear/*.png`
- JSON de personajes: `src/data/character_data.json`
- JSON de cards: `src/data/card_imgs.json`

Defaults actuales de scripts:

- `upload:storage` usa `public/` por defecto (fallback: `../old/public`).
- `seed:firestore` usa `src/data/` por defecto (fallback: `../old/src/data`).

### Formato JSON esperado

`character_data.json` (array de objetos):

```json
[
  {
    "id": 1001,
    "nameEN": "Special Week",
    "nameJP": "スペシャルウィーク",
    "images": {
      "banner": "public/outfits/card-1001.png",
      "main": "public/main/main-1001.png",
      "racewear": "public/racewear/racewear-1001.png"
    },
    "stats": { "speed": 83, "stamina": 88, "power": 98, "guts": 90, "wit": 91 },
    "Track": { "Turf": "A", "Dirt": "G" },
    "Distance": { "sprint": "F", "mile": "C", "medium": "A", "long": "A" },
    "Style": { "front": "G", "pace": "A", "late": "A", "end": "C" },
    "Growth Rate": {
      "growth-speed": "-",
      "growth-stamina": "20%",
      "growth-power": "-",
      "growth-guts": "-",
      "growth-wit": "10%"
    },
    "Details": {
      "intro": "...",
      "description": "...",
      "birthday": "May 2",
      "height": "158cm",
      "measurement1": "B81",
      "measurement2": "W56",
      "measurement3": "H81",
      "weight": "...",
      "grade": "...",
      "residence": "...",
      "likes": "...",
      "dislikes": "...",
      "earsFact": "...",
      "tailFact": "...",
      "shoeSizeL": "23.5cm",
      "shoeSizeR": "23.0cm",
      "familyFact": "..."
    }
  }
]
```

`card_imgs.json` (array de objetos):

```json
[
  {
    "id": 1001,
    "caption": "Special Week Banner",
    "banner": "public/outfits/card-1001.png"
  }
]
```

Reglas practicas:

- `id` debe ser entero positivo y unico dentro de cada archivo.
- Las rutas en `images.*` y `banner` deben usar prefijo `public/`.
- Verifica que exista el archivo real correspondiente en `public/`.

### Variables de entorno para scripts (PowerShell)

```powershell
$env:FIREBASE_SERVICE_ACCOUNT_PATH="C:\ruta\a\tu\service-account.json"
$env:FIREBASE_STORAGE_BUCKET_NAME="umapyoi-calc-dev.firebasestorage.app"
```

### Cargar imagenes a Storage

```powershell
npm run upload:storage
```

Opciones disponibles (`npm run upload:storage -- -- --help`):

```powershell
# Validar sin subir archivos
npm run upload:storage -- -- --dry-run

# Usar carpeta de origen personalizada
npm run upload:storage -- -- --public-dir "C:\otra\ruta\public"

# Elegir carpetas especificas
npm run upload:storage -- -- --folders "main,outfits,racewear"

# Forzar bucket o service account
npm run upload:storage -- -- --bucket "umapyoi-calc-dev.firebasestorage.app"
npm run upload:storage -- -- --service-account "C:\ruta\a\service-account.json"
```

### Sembrar Firestore (characters y cards)

```powershell
npm run seed:firestore
```

Opciones disponibles (`npm run seed:firestore -- -- --help`):

Nota: con npm 11 en PowerShell usa doble separador `-- --` para reenviar flags al script.

```powershell
# Validar JSON sin escribir en Firestore
npm run seed:firestore -- -- --dry-run

# Cargar solo una coleccion
npm run seed:firestore -- -- --only characters
npm run seed:firestore -- -- --only cards

# Forzar error si hay IDs invalidos/duplicados
npm run seed:firestore -- -- --strict

# Usar rutas personalizadas
npm run seed:firestore -- -- --data-dir "C:\otra\ruta\data"
npm run seed:firestore -- -- --characters-file "characters.custom.json"
npm run seed:firestore -- -- --cards-file "cards.custom.json"
npm run seed:firestore -- -- --service-account "C:\ruta\a\service-account.json"
```

### Automatizar en un solo comando

Sin deploy (solo Storage + Firestore):

```powershell
npm run sync:data
```

Con deploy de Hosting incluido:

```powershell
npm run publish:auto
```

`publish:auto` ejecuta este flujo:

1. `upload:storage`
2. `seed:firestore`
3. `deploy:hosting` (`build` + `firebase deploy --only hosting --project umapyoi-calc-dev`)

Requisitos para automatizar:

- Tener `FIREBASE_SERVICE_ACCOUNT_PATH` y `FIREBASE_STORAGE_BUCKET_NAME` cargadas en la sesion.
- Haber iniciado sesion en Firebase CLI (`firebase login --reauth`).

Notas:

- `upload:storage` toma archivos desde `public` por defecto (fallback: `../old/public`).
- `seed:firestore` toma JSON desde `src/data` por defecto (fallback: `../old/src/data`).
- Si ejecutas desde otra carpeta, usa `--data-dir`, `--characters-file` y `--cards-file`.

Variables opcionales para rutas custom:

```powershell
$env:PUBLIC_DIR="C:\otra\ruta\public"
$env:DATA_DIR="C:\otra\ruta\data"

# Compatibilidad legacy (todavia soportadas)
$env:OLD_PUBLIC_DIR="C:\otra\ruta\public"
$env:OLD_DATA_DIR="C:\otra\ruta\data"
```

## 7) Reglas Recomendadas (Estado Actual)

### Firestore Rules

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /characters/{characterId} {
      allow read: if true;
      allow write: if false;
    }

    match /cards/{cardId} {
      allow read: if true;
      allow write: if false;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Storage Rules

```txt
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## 8) Archivos Clave del Proyecto

- `src/lib/firebase.ts` -> inicializacion de Firebase App/Firestore/Storage.
- `src/services/characters.ts` -> consultas de personajes y cards en Firestore.
- `src/services/storage.ts` -> conversion de paths a download URLs de Storage.
- `scripts/upload-storage.mjs` -> subida de assets locales a Storage.
- `scripts/seed-firestore.mjs` -> carga de datos JSON a Firestore.
- `firebase.json` -> config de Hosting (public dist + SPA rewrites).
- `.firebaserc` -> proyecto Firebase por defecto (`umapyoi-calc-dev`).

## 9) Troubleshooting Rapido

### Error: "firebase use must be run from a Firebase project directory"

Causa:

- Se ejecuto el comando fuera de `umapyoi-calc/` o faltan `.firebaserc/firebase.json`.

Solucion:

```powershell
cd C:\ruta\a\workspace\umapyoi-calc
firebase init hosting
```

### Error: "Failed to list Firebase projects" (401)

Causa:

- Token de Firebase CLI expirado.

Solucion:

```powershell
firebase logout
firebase login --reauth
firebase projects:list
```

### Error: "The specified bucket does not exist"

Causa:

- Bucket incorrecto o Storage no inicializado.

Solucion:

- Revisar en Firebase Console > Storage > nombre real del bucket.
- Usar valor exacto en `FIREBASE_STORAGE_BUCKET_NAME`.

### Error npm por package.json no encontrado

Causa:

- Comando ejecutado desde carpeta equivocada.

Solucion:

```powershell
cd C:\ruta\a\workspace\umapyoi-calc
```

## 10) Seguridad y Buenas Practicas

- No subir `service-account.json` a GitHub.
- No subir `.env.local` a GitHub.
- Usar llaves de servicio solo para scripts de administracion (nunca en frontend).
- Si una llave se expone, revocarla y generar una nueva de inmediato.

## 11) Flujo Diario Recomendado

1. `npm run dev`
2. Hacer cambios y validar en local
3. `npm run build`
4. `npm run deploy:hosting` (solo si quieres publicar cambios de frontend)
5. `npm run publish:auto` (si tambien actualizaste datos desde JSON/imagenes)

---
