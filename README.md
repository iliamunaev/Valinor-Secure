# Valinor-Secure

## Quick Start (Docker + Makefile)
- Prereq: Docker with Compose plugin installed.
- Build images: `make build`
- Start stack: `make run`
- Stop services: `make stop`
- Restart services: `make restart`

- Stop and remove containers, networks: `make down`
- Clean all (containers, images, volumes): `make clean`
- Show status: `make ps`
- Follow logs: `make logs`

Example session:
```bash
# Build and start
make build
make run

# Restart (stop + run)
make restart

# Remove everything (images, volumes, orphans)
make clean

# Tail logs
make logs
```
