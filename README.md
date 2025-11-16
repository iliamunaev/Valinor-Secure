# Valinor-Secure

# 🛡️ Valinor-Secure

**Valinor-Secure** is an AI-powered security assessment platform that provides comprehensive security analysis for websites, cloud services, and SaaS applications. The platform leverages multiple AI models to analyze vendor trustworthiness, CVE trends, compliance status, and security incidents to generate detailed risk assessments.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)
![React](https://img.shields.io/badge/react-19.2.0-blue.svg)
![FastAPI](https://img.shields.io/badge/fastapi-latest-green.svg)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Development](#-development)
- [API Endpoints](#-api-endpoints)
- [Configuration](#-configuration)
- [License](#-license)

## 🎯 Application Components

CLI Tool ✅ Fully Working
Use the command-line interface for immediate security assessments. All features are operational and ready for production use.

Web Application 🚧 Under Development
A future browser-based interface. The React frontend and FastAPI backend are set up but not yet functional for security assessments.

Visit https://valinor.ink for ui demonstration. 

# Security Radar CLI

Command-line tool for assessing software security posture using the Security Radar API.

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/iliamunaev/Valinor-Secure.git
   cd Valinor-Secure/security-radar-cli
   ```

2. **Install dependencies:**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Run assessment:**
   ```bash
   python security_radar_cli.py assess --product "Slack"
   ```

## Usage

### Basic Assessment
```bash
# Simple product assessment
python security_radar_cli.py assess --product "FileZilla"

# With company name
python security_radar_cli.py assess --product "FileZilla" --company "Tim Kosse"

# With URL
python security_radar_cli.py assess --product "Slack" --url "https://slack.com"

# Force refresh (bypass cache)
python security_radar_cli.py assess --product "Slack" --force-refresh
```

### Output Formats
```bash
# Human-readable text (default)
python security_radar_cli.py assess --product "Docker Desktop"

# JSON output for scripting
python security_radar_cli.py assess --product "VSCode" --format json
```

## Help

```bash
python security_radar_cli.py --help
python security_radar_cli.py assess --help
```

### Custom API URL
```bash
# Override default API URL
python security_radar_cli.py --api-url http://api.example.com:8088 assess --product "Slack"
```

## Command Options

**Required:**
- `--product TEXT` - Software product name

**Optional:**
- `--company TEXT` - Vendor/company name
- `--url TEXT` - Product or vendor URL
- `--sha1 TEXT` - SHA-1 hash of binary
- `--force-refresh` - Bypass cache
- `--format {text|json}` - Output format (default: text)
- `--api-url URL` - API base URL (default: http://localhost:8088)

## Examples

```bash
# Quick assessment
python security_radar_cli.py assess --product "1Password"

# Full assessment with all details
python security_radar_cli.py assess \
  --product "FileZilla" \
  --company "Tim Kosse" \
  --url "https://filezilla-project.org" \
  --sha1 "e94803128b6368b5c2c876a782b1e88346356844"

# JSON output for parsing trust score
python security_radar_cli.py assess --product "GitHub" --format json | jq '.trust_score.score'
```

### 🔍 Security Assessment
- **Vendor Analysis**: Comprehensive vendor reputation and history analysis
- **CVE Tracking**: Real-time vulnerability database monitoring and trend analysis
- **Incident History**: Track and analyze past security incidents
- **Compliance Verification**: SOC2, ISO, GDPR compliance status checking
- **Trust Scoring**: AI-generated trust scores (0-100) with confidence levels

### 🤖 AI-Powered Analysis
- **Intelligent Risk Assessment**: Automated risk factor identification
- **Alternative Recommendations**: Suggest safer alternatives with rationale
- **Citation Tracking**: All assessments backed by verifiable sources

### 📊 Interactive Dashboard
- **Real-time Reports**: Live security assessment visualization
- **Scan History**: Track all previous assessments
- **Color-coded Risk Levels**: 
  - 🟢 Safe (80-100): Low risk, high trust
  - 🟡 Warning (60-79): Medium risk, proceed with caution
  - 🔴 Critical (<60): High risk, avoid usage
- **Detailed Breakdown**: CVE trends, compliance details, incident timeline

## 🛠️ Tech Stack

### Frontend
- **React 19.2.0** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **Vite 7.2.2** - Lightning-fast build tool
- **Tailwind CSS 4.1.17** - Utility-first CSS framework
- **shadcn/ui** - Beautiful component library
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

### Backend
- **FastAPI** - Modern Python web framework
- **Python 3.12** - Alpine-based container
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **Nginx** - Reverse proxy and SSL termination
- **Security Radar API** - External security intelligence

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **pnpm** - Fast package manager

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

👥 Authors
- **Ilia Munaev** - [GitHub](https://github.com/iliamunaev)
- **Mariia Zhytnikova** - [GitHub](https://github.com/MariiaZhytnikova)
- **Mykhailo Litvinov** - [GitHub](https://github.com/mlitvino)
- **Marina Zhivotova** - [GitHub](https://github.com/marinezh)
- **Viacheslav Gnetkovskiy** - [GitHub](https://github.com/Renegate)

---

**Built with ❤️ for the security community**
