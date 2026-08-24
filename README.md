# StudentLunch FI

Individual Assignment – Web

A vanilla JavaScript web application for browsing student restaurants in Finland and viewing daily and weekly menus.

## Features

- Restaurant list from the Metropolia REST API
- Daily and weekly menu view
- Search
- City filter
- Service-provider filter
- Customer registration and login
- Favourite restaurants
- Profile editing
- Profile picture upload
- Restaurant map using OpenStreetMap embed
- Geolocation and nearest restaurant highlighting
- Responsive HTML/CSS
- LocalStorage for the student-project account/profile features
- Demo data fallback for UI testing if the API is temporarily unavailable

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- REST API
- Browser LocalStorage
- Browser Geolocation API
- OpenStreetMap iframe

No React, Angular, Vue, jQuery, Bootstrap or other front-end framework/library is used.

## API

The application is configured to use:

`https://media2.edu.metropolia.fi/restaurant`

The API adapter tries several common REST endpoint patterns because the exact endpoint paths can vary by course/API version. If your teacher's API documentation gives exact endpoint paths, update the candidate URLs in `js/app.js` inside `loadRestaurants()` and `loadMenu()`.

## Important note about login

This assignment version stores demo account information in `localStorage` so the front-end can demonstrate registration, login, favourites and profile editing without a separate backend.

This is NOT secure production authentication. Do not use real passwords or sensitive personal data.

## Publishing

1. Upload the whole project to your GitHub repository.
2. Validate `index.html` and test the application.
3. Upload the files to your `users.metropolia.fi` web space (or another public static server).
4. Open the public URL and test:
   - restaurant loading
   - daily/weekly menus
   - filters
   - login/register
   - favourites
   - profile picture
   - map
   - nearest restaurant

## Git practice example

```bash
git init
git add .
git commit -m "Initial StudentLunch FI application"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Then use small, meaningful commits such as:

- `feat: add restaurant API integration`
- `feat: add daily and weekly menus`
- `feat: add authentication and favourites`
- `feat: add restaurant filters`
- `feat: add map and nearest restaurant`
- `style: improve responsive layout`
- `fix: handle unavailable API response`

## Assignment mapping

### Grade 1
- Restaurants listed: yes
- Daily/weekly menu selection: yes
- Public-server ready: yes
- GitHub-ready: yes
- Good Git practice documented: yes

### Grade > 2
- Login/registration: yes
- Favourite restaurants: yes
- Update own information: yes
- Profile picture: yes
- City/provider filters: yes
- Logical restaurant listing: yes
- Map: yes
- Nearest restaurant: yes
- Extra features: search, responsive design, API fallback and menu modal

## Disclaimer

The demo fallback data is only for testing the interface when the API is unavailable. For the submitted version, the Metropolia API should be available and provide the restaurant/menu data.
