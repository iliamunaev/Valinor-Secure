# Security Radar CLI

A basic command-line client for the Security Radar API that allows you to assess software applications' security posture from the terminal.

## Features

- Assess software products using the `/assess` endpoint
- Support for all optional parameters (company name, URL, SHA-1 hash)
- Output in both human-readable text and JSON formats
- Clear error handling and informative messages

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure the API URL:
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and set your API URL (default is http://localhost:8088)
# API_URL=http://localhost:8088
```

3. Make the script executable (optional):
```bash
chmod +x security_radar_cli.py
```

## Configuration

The CLI uses the following priority order for determining the API URL:

1. Command-line argument `--api-url` (highest priority)
2. Environment variable `API_URL` from `.env` file
3. Default value `http://localhost:8088` (lowest priority)

You can configure the API URL in the `.env` file:
```bash
API_URL=http://localhost:8088
```

Or override it via command-line:
```bash
python security_radar_cli.py --api-url http://your-api.com:8088 assess --product "FileZilla"
```

## Usage

### Basic Assessment

Assess a product by name:
```bash
python security_radar_cli.py assess --product "FileZilla"
```

### With Additional Information

Provide company name:
```bash
python security_radar_cli.py assess --product "FileZilla" --company "Tim Kosse"
```

Include SHA-1 hash:
```bash
python security_radar_cli.py assess --product "FileZilla" --sha1 "e94803128b6368b5c2c876a782b1e88346356844"
```

Provide product URL:
```bash
python security_radar_cli.py assess --product "1Password" --url "https://1password.com"
```

### JSON Output

Get output in JSON format for programmatic use:
```bash
python security_radar_cli.py assess --product "Slack" --format json
```

### Custom API URL

If your API is running on a different host/port:
```bash
python security_radar_cli.py --api-url http://api.example.com:8088 assess --product "Slack"
```

### Force Refresh

Force a fresh assessment (bypass cache):
```bash
python security_radar_cli.py assess --product "FileZilla" --force-refresh
```

## Command Reference

### Global Options
- `--api-url URL` - Base URL of the Security Radar API (default: http://localhost:8088)

### Assess Command
```bash
python security_radar_cli.py assess [OPTIONS]
```

Options:
- `--product TEXT` - Name of the software product (required)
- `--company TEXT` - Vendor/company name (optional)
- `--url TEXT` - Product or vendor URL (optional)
- `--sha1 TEXT` - SHA-1 hash of the binary (optional)
- `--force-refresh` - Force refresh from cache (optional)
- `--format {text,json}` - Output format (default: text)

## Output Format

### Text Output
The text output provides a structured, human-readable assessment including:
- Product information (name, vendor, category, description)
- Trust score with visual indicators (HIGH/MEDIUM/LOW/CRITICAL)
- Risk and positive factors
- CVE trends and recent vulnerabilities
- Security incidents
- Compliance and data handling information
- Deployment model and admin controls
- Alternative product suggestions
- Citations and sources

### JSON Output
The JSON output returns the full API response for programmatic processing.

## Requirements

- Python 3.7+
- `requests` library
- Running Security Radar API instance

## Error Handling

The CLI provides clear error messages for common issues:
- Connection errors (API not running)
- HTTP errors (with status codes and details)
- Timeout errors (assessment taking too long)
- General exceptions

## Examples

```bash
# Simple assessment
python security_radar_cli.py assess --product "Docker Desktop"

# Comprehensive assessment with all details
python security_radar_cli.py assess \
  --product "FileZilla" \
  --company "Tim Kosse" \
  --sha1 "e94803128b6368b5c2c876a782b1e88346356844" \
  --url "https://filezilla-project.org"

# Get JSON for processing
python security_radar_cli.py assess --product "VSCode" --format json | jq '.trust_score.score'
```

## Help

Display help information:
```bash
python security_radar_cli.py --help
python security_radar_cli.py assess --help
```
