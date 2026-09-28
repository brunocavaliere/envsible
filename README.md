# Envsible

Local auditing for environment variables across Vercel projects.

Envsible compares variable metadata across projects without displaying or forwarding secret values.

## Requirements

- Node.js 20 or newer
- A Vercel access token with access to the projects you want to audit

## Usage

Run from any repository or directory:

```bash
VERCEL_TOKEN=your_token npx envsible dashboard
```

Scan the repository where the command is running and open a code-aware dashboard:

```bash
VERCEL_TOKEN=your_token npx envsible scan
```

Print variables found in the current repository without opening a browser:

```bash
npx envsible scan --print
```

Print a Vercel project comparison in the terminal:

```bash
VERCEL_TOKEN=your_token npx envsible audit
```

Use sample data while exploring the interface:

```bash
npx envsible dashboard --demo
```

## Security

Envsible uses only environment variable metadata such as names and targets. It does not display or send variable values to an Envsible server. Keep your `VERCEL_TOKEN` private and never commit it to a repository.
