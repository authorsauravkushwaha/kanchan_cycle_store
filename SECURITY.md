# Security Policy

## Scope

The current repository builds the Kanchan Cycle Stores static website. It has no
customer login, payment processing or server-side enquiry endpoint. The optional
Supabase catalogue and its RLS policies are documented in
[`docs/SUPABASE.md`](docs/SUPABASE.md). The `/owner` route is a public, device-local
stock-draft tool, not an authenticated administrator panel.

Only the latest reviewed version on the default branch is supported. No security
fixes are promised for old builds or unsupported forks.

## Reporting a vulnerability

Please do not publish exploit details, credentials, private keys or personal data
in a public issue. Report concerns privately to the repository owner through
GitHub's private vulnerability reporting if it is enabled. If it is not enabled,
contact the shop through the website's official contact channel and ask for the
owner; do not send passwords, authentication codes or customer records.

Include the affected page/component, impact, reproduction steps and a safe proof
of concept. The owner will acknowledge and assess the report as soon as practical.
There is no public bug bounty or guaranteed response SLA. Do not test against a
production site or third-party service without the owner's written permission.

For leaked credentials, rotate/revoke them immediately at the provider before
sharing any report. Never put the secret value itself in a report.
