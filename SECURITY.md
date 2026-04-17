# Security Policy

## Supported Versions

Only the latest minor release of Tsarr receives security updates. Older
versions may be patched on a best-effort basis.

| Version | Supported |
| ------- | --------- |
| Latest  | Yes       |
| Older   | No        |

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for security reports.

Report vulnerabilities privately via GitHub's [Private Vulnerability
Reporting](https://github.com/robbeverhelst/tsarr/security/advisories/new)
or by emailing **robbe@settlemint.com** with:

- A description of the issue and its impact
- Steps to reproduce (PoC if possible)
- Affected versions
- Any suggested mitigation

You will receive an acknowledgement within **72 hours**. We aim to provide a
remediation plan within **7 days** and a fix within **30 days**, depending on
severity and complexity.

Please do not publicly disclose the issue until a fix has been released.

## Scope

In scope: the `tsarr` npm package, the `tsarr` CLI binary, and the distribution
artifacts published from this repository.

Out of scope: vulnerabilities in upstream Servarr applications (Radarr, Sonarr,
etc.) — please report those to their respective projects.
