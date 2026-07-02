# GenieCivil

A civil engineering project management web app built with React and Firebase.

## Stack
- **Frontend**: React 19 (Create React App / react-scripts)
- **Backend**: Firebase (Firestore, Auth, Storage) — project: `geniecivil-954a8`
- **UI**: MUI, Bootstrap, styled-components, recharts, chart.js
- **Run command**: `npm start` (serves on port 5000)

## How to run
```
npm install
npm start
```

## Notes
- `jspdf` and `html2pdf.js` are blocked by Replit's security policy and have been stubbed out. PDF export features will show an alert instead of generating a file.
- The following package overrides are in place to work around Replit security policy blocks:
  - `shell-quote` → `^1.8.3`
  - `protobufjs` → `^7.6.0`
  - `form-data` → `^4.0.0`
- Firebase config is hardcoded in `src/firebase.js` (normal for client-side Firebase apps).
- The app runs on port 5000 (set via `PORT` env var in `.replit`).

## User preferences
