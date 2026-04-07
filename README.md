# Country & Weather App (Angular)

Search countries, view details, and fetch **live weather for the capital city**.

## Features (Assignment Checklist)

- **Countries list**: name, flag, region (cards)
- **Search**: input box + filtering using `ngModel`
- **Routing**:
  - `/` → countries list
  - `/country/:code` → details page
- **Details page**: capital, population, currency
- **Weather**: current temperature + condition for the capital (no API key)
- **Error handling**: friendly messages for failed API calls
- **UI improvements**: loader, responsive card grid, Material 3 styling, light/dark toggle
- **Bonus**: favorites feature (persisted in `localStorage`)

## APIs Used

- **Countries**: Rest Countries v3.1 (`https://restcountries.com/`)
- **Weather**: Open‑Meteo (Forecast + Geocoding) (`https://open-meteo.com/`)

## Tech Stack

- Angular (standalone components + routing)
- TypeScript
- Angular Material (Material 3)
- SCSS

## Getting Started

From the project folder:

```bash
npm install
npm start
```

Then open `http://localhost:4200/`.

### Windows PowerShell issue (`npm.ps1 cannot be loaded`)

If PowerShell blocks npm scripts, use one of these:

```powershell
npm.cmd install
npm.cmd start
```

or

```powershell
cmd /c "npm install"
cmd /c "npm start"
```

Optional (only for current PowerShell session):

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm install
npm start
```

## Build

```bash
npm run build
```

## Notes

- Weather is fetched using the country’s `capitalInfo.latlng` when available; otherwise it falls back to Open‑Meteo geocoding by capital name.
- Favorites are stored locally under the key `cw_favorites_v1`.
