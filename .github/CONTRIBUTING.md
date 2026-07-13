# Contributing to dxf-crosshair-remover

Thank you for investing your time in improving dxf-crosshair-remover. This document describes the recommended workflow for reporting issues, proposing enhancements, and submitting pull requests.

## Code of Conduct

By participating in this project you agree to uphold our [Code of Conduct](../CODE_OF_CONDUCT.md). Breaches can be reported privately via GitHub Discussions or by emailing the maintainers listed on the repository profile.

## How to get help

- **Bug reports** – open an issue using the *Bug Report* template.
- **Feature ideas** – open an issue using the *Feature Request* template.
- **Security vulnerabilities** – please refer to [`SECURITY.md`](../SECURITY.md) for the responsible disclosure process.

Before filing a new issue, search the existing issues to avoid duplicates.

## Development workflow

1. **Fork the repository**
   ```bash
   git clone https://github.com/oooargon/dxf-crosshair-remover.git
   cd dxf-crosshair-remover
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Create a feature branch**
   ```bash
   git switch -c feature/my-enhancement
   ```
4. **Develop and test**
   - `npm run typecheck` to verify TypeScript types.
   - `npm run process -- examples --dry-run` to test DXF processing.
   - `npm run build` to verify exe packaging.
5. **Commit with context**
   ```bash
   git commit -m "feature: describe the change"
   ```
6. **Push and open a Pull Request**
   ```bash
   git push origin feature/my-enhancement
   ```
   Then create a PR against `main` on [GitHub](https://github.com/oooargon/dxf-crosshair-remover/pulls) and fill in the template.

## Staying up to date

Keep your fork current to reduce conflicts:

```bash
git remote add upstream https://github.com/oooargon/dxf-crosshair-remover.git
git fetch upstream
git switch main
git merge upstream/main
```

## Coding guidelines

- Use TypeScript for all new code.
- Follow existing module structure (`src/commands/`, `src/dxf.ts`, etc.).
- Keep pull requests small and focused.

## Commit & PR conventions

- Commit message format: `<type>: <summary>` (e.g. `fix: correct hole diameter detection`).
- Reference related issues (e.g. `Closes #42`) in your PR description.

## License

By contributing, you agree that your contributions will be licensed under the [MIT](../LICENSE.md) license that covers this repository.
