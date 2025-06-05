# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Security Setup

### Google Drive Integration
1. Copy `src/lib/config/google-drive-credentials.example.json` to `src/lib/config/google-drive-credentials.json`
2. Get your credentials from [Google Cloud Console](https://console.cloud.google.com):
   - Create a new project or select existing one
   - Enable Google Drive API
   - Create a service account
   - Download the JSON credentials
3. Replace the placeholder values in `google-drive-credentials.json` with your actual credentials
4. **NEVER** commit the actual credentials file to Git

### Environment Variables
1. Copy `.env.example` to `.env`
2. Fill in your environment variables:
   - Database connection strings
   - API keys
   - Other sensitive configuration
3. **NEVER** commit the `.env` file to Git

### Security Best Practices
- Keep all credentials and secrets in environment variables or secure credential files
- Regularly rotate API keys and credentials
- Use service accounts with minimal required permissions
- Enable 2FA for all development accounts
- Review access logs regularly
