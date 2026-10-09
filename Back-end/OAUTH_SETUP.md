# Local social sign-in setup

The login page supports Google OAuth and GitHub OAuth. Provider credentials must stay in the backend `.env`; do not put client secrets in Angular.

## Google

Set these backend variables and register the exact callback URL with the Google OAuth client:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/E-learning/users/google/callback
OAUTH_FRONTEND_URL=http://localhost:4200
```

The server also keeps compatibility with the previous callback path `/flight-booking/users/google/callback` if that is the URL currently registered with the Google client.

## GitHub

Create a GitHub OAuth App, set its callback URL to `http://localhost:3000/E-learning/users/github/callback`, and add:

```env
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/E-learning/users/github/callback
OAUTH_FRONTEND_URL=http://localhost:4200
```

The OAuth App homepage should be the Angular app origin, normally `http://localhost:4200`. GitHub sign-in requests `read:user` and `user:email`; the user must have a verified email address.

After changing `.env`, restart the backend. The provider callback must exactly match the URL registered in that provider's developer console.
