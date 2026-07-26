# Spotify Now Playing Widget — Setup Guide

## 1. Spotify Developer App Configuration

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Log in with your Spotify account
3. Click **"Create App"**
4. Fill in the app details:
   - **App name**: `Portfolio Widget` (or any name)
   - **App description**: `Now playing widget for portfolio`
   - **Redirect URI**: `http://localhost:5000` (for local development)
   - **Redirect URI**: `https://your-portfolio.onrender.com` (for production)
5. Check the box for **Web API**
6. Save the app

## 2. Required OAuth Scopes

When generating the refresh token, request these scopes:
- `user-read-currently-playing`
- `user-read-recently-played`

These scopes allow the app to read your current playback state and recently played tracks.

## 3. Environment Variables

Create a `.env` file in the `backend/` directory (or project root) with the following:

```env
# Spotify API Credentials
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_REFRESH_TOKEN=your_refresh_token_here

# Optional: Cache TTL in seconds (default: 15)
SPOTIFY_CACHE_TTL=15
```

**Where to find these values:**
- **Client ID** and **Client Secret**: Spotify Developer Dashboard → Your App → Settings → Basic Information
- **Refresh Token**: See step 4 below

## 4. How to Obtain the Refresh Token

### Option A: Use Spotify's Authorization Flow (Recommended)

1. Open this URL in your browser (replace `YOUR_CLIENT_ID` with your actual Client ID):

```
https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost:5000&scope=user-read-currently-playing%20user-read-recently-played
```

2. Log in and authorize the app
3. You will be redirected to `http://localhost:5000?code=AUTH_CODE`
4. Copy the `AUTH_CODE` from the URL
5. Exchange the code for a refresh token using curl:

```bash
curl -X POST "https://accounts.spotify.com/api/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=AUTH_CODE&redirect_uri=http://localhost:5000&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET"
```

6. Copy the `refresh_token` from the response and add it to your `.env` file

### Option B: Use a Helper Script

Create a temporary script `get_refresh_token.py`:

```python
import requests

CLIENT_ID = "your_client_id"
CLIENT_SECRET = "your_client_secret"
AUTH_CODE = "code_from_step_3"

response = requests.post(
    "https://accounts.spotify.com/api/token",
    data={
        "grant_type": "authorization_code",
        "code": AUTH_CODE,
        "redirect_uri": "http://localhost:5000",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
    },
)
print(response.json())
```

Run it and extract the `refresh_token`.

## 5. Project File Structure

```
alish-portfolio/
├── backend/
│   ├── app.py                          # Main Flask app (updated)
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── chatbot.py                  # Existing chatbot routes
│   │   └── spotify.py                  # NEW: Spotify API route
│   ├── services/
│   │   ├── __init__.py
│   │   ├── portfolio_service.py
│   │   ├── ai_service.py
│   │   └── spotify_service.py          # NEW: Spotify service
│   └── .env                            # Add your Spotify credentials here
├── static/
│   ├── css/
│   │   └── spotify-widget.css          # NEW: Widget styles
│   └── js/
│       └── spotify-widget.js           # NEW: Widget controller
├── templates/
├── index.html                          # Updated with widget HTML
└── style.css                           # Existing styles
```

## 6. How to Run the Flask Application Locally

### Install dependencies

```bash
pip install flask flask-cors requests python-dotenv
```

### Run the backend

```bash
cd backend
python app.py
```

The Flask app will start at `http://localhost:5000` and serve:
- The portfolio website at `http://localhost:5000`
- The Spotify API at `http://localhost:5000/api/spotify`
- The chatbot API at `http://localhost:5000/chat`

### Or using the existing setup

If you already have a `package.json` or startup script, make sure it starts the Flask backend.

## 7. How to Deploy

### Option A: Render / Railway / Fly.io

1. Push your code to GitHub
2. Connect your repository to the hosting platform
3. Set environment variables in the platform dashboard:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `SPOTIFY_REFRESH_TOKEN`
   - `OPENROUTER_API_KEY` (if using chatbot)
   - `PORT` (usually set automatically)
4. Deploy

### Option B: Vercel / Netlify (Frontend only)

If deploying only the frontend to Vercel/Netlify:
1. Deploy the Flask backend separately (Render/Railway)
2. Update `static/js/spotify-widget.js` line 12 to point to your backend URL:

```javascript
const API_URL = "https://your-backend.onrender.com/api/spotify";
```

## 8. Frontend Configuration

### API URL

If your Flask backend runs on a different port or domain, update the `API_URL` in `static/js/spotify-widget.js`:

```javascript
const API_URL = "http://localhost:5000/api/spotify";  // Local
const API_URL = "https://your-backend.com/api/spotify";  // Production
```

### CORS

The Flask app has CORS enabled for all origins (`*`). For production, restrict this in `backend/app.py`:

```python
CORS(app, resources={r"/*": {"origins": "https://your-portfolio.com"}})
```

## 9. Security Notes

- **Never** commit `.env` to version control
- **Never** expose `client_secret` or `refresh_token` to the frontend
- All Spotify API calls happen server-side in `spotify_service.py`
- The frontend only receives sanitized track data

## 10. Troubleshooting

### "Spotify Offline" error
- Check that all three environment variables are set correctly
- Verify the refresh token hasn't expired
- Check Flask logs for detailed error messages

### No songs showing
- Make sure you have recently played tracks on your Spotify account
- Verify the OAuth scopes include `user-read-recently-played`

### Widget not loading
- Check browser console for CORS errors
- Ensure the Flask backend is running
- Verify the `API_URL` in `spotify-widget.js` matches your backend URL

### Rate limiting
- The widget caches responses for 15 seconds by default
- Adjust `SPOTIFY_CACHE_TTL` in `.env` if needed (15-30 seconds recommended)
