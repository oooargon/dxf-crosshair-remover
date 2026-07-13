# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly:

1. **Do not** open a public GitHub issue for security vulnerabilities
2. Email security concerns to the maintainers (contact information available on the repository profile)
3. Include as much detail as possible:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Response Time

We aim to respond to security reports within **48 hours** and will work with you to:

- Confirm the vulnerability
- Develop a fix
- Release a patch in a timely manner
- Credit you for the discovery (if desired)

## Security Best Practices

When using this tool:

- **Input validation**: Process only trusted DXF files from known sources
- **File size limits**: Very large DXF files may consume significant memory
- **Local processing**: The CLI processes files locally; no data is sent to external servers
- **Dependencies**: Keep dependencies up to date by running `npm audit` regularly

## Known Security Considerations

- This is a local CLI tool that reads and writes DXF files on disk
- No network requests are made during normal operation
- The packaged `.exe` embeds a Node.js runtime via caxa

## Disclosure Policy

- Security vulnerabilities will be disclosed after a fix is available
- We will credit security researchers who responsibly disclose vulnerabilities
- Public disclosure will be coordinated with the reporter

Thank you for helping keep this project secure!
