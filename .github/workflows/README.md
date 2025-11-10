# GitHub Actions Workflows

This directory contains GitHub Actions workflows for building and deploying containerized applications.

## Workflows

### 1. CMS Container (`cms-container.yml`)

Builds the Payload CMS backend container.

**Triggers:**
- Push to `main` or `claude/**` branches (when CMS-related files change)
- Pull requests to `main` (when CMS-related files change)
- Manual workflow dispatch

**What it does:**
- Builds the CMS Docker image from the root `Dockerfile`
- Pushes to GitHub Container Registry (ghcr.io)
- Runs security vulnerability scanning with Trivy
- Supports multi-platform builds (amd64, arm64)
- Uses build caching for faster builds

**Container Registry:**
- Image: `ghcr.io/oculairmedia/reactfolionew/cms`
- Tags: `latest`, `main`, `<branch>-<sha>`, `pr-<number>`

### 2. MCP Server Container (`mcp-server-container.yml`)

Builds the FastMCP CMS Server container for AI-powered content management.

**Triggers:**
- Push to `main` or `claude/**` branches (when MCP server files change)
- Pull requests to `main` (when MCP server files change)
- Manual workflow dispatch

**What it does:**
- Builds the MCP Server Docker image from `fastmcp-cms-server/Dockerfile`
- Runs Python tests with pytest
- Validates configuration
- Pushes to GitHub Container Registry (ghcr.io)
- Runs security vulnerability scanning with Trivy
- Supports multi-platform builds (amd64, arm64)

**Container Registry:**
- Image: `ghcr.io/oculairmedia/reactfolionew/mcp-server`
- Tags: `latest`, `main`, `<branch>-<sha>`, `pr-<number>`

### 3. Build All Containers (`build-all-containers.yml`)

Builds both CMS and MCP Server containers in a coordinated manner.

**Triggers:**
- Push to `main` branch
- Release published
- Manual workflow dispatch

**What it does:**
- Builds both CMS and MCP Server containers in parallel
- Pushes both to GitHub Container Registry
- Runs security scanning on both images
- Supports semantic versioning on releases

**Use Cases:**
- Coordinated releases
- Ensuring both containers are built together
- Release tagging with semantic versioning

## Container Images

All container images are published to GitHub Container Registry (ghcr.io):

```bash
# Pull CMS container
docker pull ghcr.io/oculairmedia/reactfolionew/cms:latest

# Pull MCP Server container
docker pull ghcr.io/oculairmedia/reactfolionew/mcp-server:latest
```

## Image Tags

- `latest` - Latest build from main branch
- `main` - Latest build from main branch
- `<branch>-<sha>` - Specific commit builds
- `pr-<number>` - Pull request builds
- `v<version>` - Release versions (when releases are created)

## Security Scanning

All workflows include Trivy security scanning:
- Scans for CVEs in container images
- Results uploaded to GitHub Security tab
- Helps identify vulnerabilities early

## Build Caching

All workflows use GitHub Actions cache:
- Speeds up subsequent builds
- Reduces build times significantly
- Cache is shared across workflow runs

## Manual Workflow Dispatch

All workflows can be manually triggered:
1. Go to Actions tab
2. Select the workflow
3. Click "Run workflow"
4. Choose branch and run

## Environment Variables

The workflows use the following environment variables:
- `REGISTRY`: Container registry (ghcr.io)
- `IMAGE_NAME`: Full image name with repository

## Permissions

Workflows require the following permissions:
- `contents: read` - Read repository contents
- `packages: write` - Push to GitHub Container Registry
- `security-events: write` - Upload security scan results

## Troubleshooting

### Build Failures
- Check the workflow logs in the Actions tab
- Verify Dockerfile syntax
- Ensure all dependencies are available

### Push Failures
- Ensure GitHub Packages is enabled for the repository
- Verify workflow permissions are correct
- Check container registry authentication

### Security Scan Failures
- Review Trivy results in Security tab
- Update base images to fix vulnerabilities
- Check for vulnerable dependencies
