The Challenge

Build an AI assessor that turns a application name or URL into a CISO-ready trust brief with sources in minutes.

Security teams and CISOs (Chief Information Security Officer) are constantly asked to approve new tools they’ve never seen before. They need accurate, concise, and source-grounded snapshots of a product’s security posture, fast. This challenge asks participants to build a GenAI-powered assessor that fetches reliable signals from the web and synthesizes them into a decision-ready brief. Help us move security from reactive firefighting to proactive enablement.

Note: Teams may optionally evaluate emerging integration frameworks (e.g., MCP services) as targets of assessment, but MCP is not required.

Given minimal input (product name, vendor, or URL), build a system that:

    Resolves the entity and vendor identity.
    Classifies the software into a clear taxonomy (e.g., File sharing, GenAI tool, SaaS CRM, Endpoint agent).
    Produces a concise security posture summary with citations.
    Covers: description, usage, vendor reputation, CVE trend summaries (Common Vulnerabilities and Exposures), incidents/abuse signals, data handling/compliance, deployment/admin controls, and transparent 0–100 trust/risk score with rationale and confidence.
    Suggests 1–2 safer alternatives with short rationale.

Deliverables can be a CLI (Command Line Interface), service, or bonus web UI with compare-view. A lightweight local cache with timestamps and reproducibility is required.

Insight

Focus on high-signal sources: vendor security/PSIRT pages (Product Security Incident Response Team), Terms of Service/Data Processing Agreement, (System and Organization Controls Type II), ISO attestations, reputable advisories/CERTs (Notices from Computer Emergency Response Teams or vendors), and CISA KEV (CISA Known Exploited Vulnerabilities catalog). Guard against hallucinations by labeling vendor-stated vs. independent claims. When data is scarce, return “Insufficient public evidence.”

Resources

Withsecure will provide:

    Pre-prepared list of applications (names, optional binary hashes).

    Guidance on source prioritization and claim–evidence mapping.

    Public references: CVE/CVSS (Common Vulnerability Scoring System) databases, CISA KEV, vendor security pages, disclosure/bug bounty sites.

    Example prompts for entity resolution and categorization.

    Mentors on-site during the weekend (technical + domain expertise).

    Bonus theme: assessing MCP-style integrations.

    Required: lightweight local cache (JSON/SQLite), snapshot mode, deterministic parameters.

Example data: data/example.csv