# IaC Integration Guide

TsArr is designed to work seamlessly with Infrastructure as Code tools for automated Servarr deployment and configuration.

## Docker Compose

### Basic Setup

```yaml
version: '3.8'

services:
  radarr:
    image: lscr.io/linuxserver/radarr:latest
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - ./config/radarr:/config
      - /media/movies:/movies
    ports:
      - "7878:7878"
    restart: unless-stopped

  sonarr:
    image: lscr.io/linuxserver/sonarr:latest
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - ./config/sonarr:/config
      - /media/tv:/tv
    ports:
      - "8989:8989"
    restart: unless-stopped

  # Configuration automation service
  tsarr-automation:
    build: .
    environment:
      - RADARR_BASE_URL=http://radarr:7878
      - RADARR_API_KEY=${RADARR_API_KEY}
      - SONARR_BASE_URL=http://sonarr:8989
      - SONARR_API_KEY=${SONARR_API_KEY}
    volumes:
      - /media:/media:ro
      - ./automation:/app/scripts
    depends_on:
      - radarr
      - sonarr
    restart: unless-stopped
```

### Automation Container

```dockerfile
FROM oven/bun:1-alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --production

# Copy source code
COPY src/ ./src/
COPY scripts/ ./scripts/

# Build the project
RUN bun run build

# Copy automation scripts
COPY automation/ ./automation/

# Set default command
CMD ["bun", "run", "automation/scheduler.ts"]
```

## Kubernetes

### Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tsarr-automation
spec:
  replicas: 1
  selector:
    matchLabels:
      app: tsarr-automation
  template:
    metadata:
      labels:
        app: tsarr-automation
    spec:
      containers:
      - name: automation
        image: tsarr-automation:latest
        env:
        - name: RADARR_BASE_URL
          valueFrom:
            configMapKeyRef:
              name: servarr-config
              key: radarr-url
        - name: RADARR_API_KEY
          valueFrom:
            secretKeyRef:
              name: servarr-secrets
              key: radarr-api-key
        volumeMounts:
        - name: media-storage
          mountPath: /media
          readOnly: true
      volumes:
      - name: media-storage
        persistentVolumeClaim:
          claimName: media-pvc
```

### ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: servarr-config
data:
  radarr-url: "http://radarr-service:7878"
  sonarr-url: "http://sonarr-service:8989"
  lidarr-url: "http://lidarr-service:8686"
  readarr-url: "http://readarr-service:8787"
  prowlarr-url: "http://prowlarr-service:9696"
```

### Secrets

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: servarr-secrets
type: Opaque
data:
  radarr-api-key: <base64-encoded-key>
  sonarr-api-key: <base64-encoded-key>
  lidarr-api-key: <base64-encoded-key>
  readarr-api-key: <base64-encoded-key>
  prowlarr-api-key: <base64-encoded-key>
```

## Helm Chart

### values.yaml

```yaml
# Servarr services configuration
servarr:
  radarr:
    enabled: true
    apiKey: "your-radarr-api-key"
    url: "http://radarr:7878"
  sonarr:
    enabled: true
    apiKey: "your-sonarr-api-key"
    url: "http://sonarr:8989"
  lidarr:
    enabled: false
  readarr:
    enabled: false
  prowlarr:
    enabled: true
    apiKey: "your-prowlarr-api-key"
    url: "http://prowlarr:9696"

# Automation configuration
automation:
  enabled: true
  image:
    repository: tsarr-automation
    tag: latest
  schedule:
    importScan: "0 2 * * *"  # Daily at 2 AM
    healthCheck: "*/15 * * * *"  # Every 15 minutes
  
# Storage configuration
storage:
  media:
    path: /media
    size: 10Ti
  config:
    path: /config
    size: 10Gi
```

### Templates

```yaml
# templates/automation-deployment.yaml
{{- if .Values.automation.enabled }}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "chart.fullname" . }}-automation
spec:
  replicas: 1
  selector:
    matchLabels:
      app: {{ include "chart.name" . }}-automation
  template:
    metadata:
      labels:
        app: {{ include "chart.name" . }}-automation
    spec:
      containers:
      - name: automation
        image: "{{ .Values.automation.image.repository }}:{{ .Values.automation.image.tag }}"
        env:
        {{- if .Values.servarr.radarr.enabled }}
        - name: RADARR_BASE_URL
          value: {{ .Values.servarr.radarr.url | quote }}
        - name: RADARR_API_KEY
          valueFrom:
            secretKeyRef:
              name: servarr-secrets
              key: radarr-api-key
        {{- end }}
        {{- if .Values.servarr.sonarr.enabled }}
        - name: SONARR_BASE_URL
          value: {{ .Values.servarr.sonarr.url | quote }}
        - name: SONARR_API_KEY
          valueFrom:
            secretKeyRef:
              name: servarr-secrets
              key: sonarr-api-key
        {{- end }}
{{- end }}
```

## Terraform

### Provider Configuration

```hcl
# Configure Servarr services
resource "docker_container" "radarr" {
  name  = "radarr"
  image = "lscr.io/linuxserver/radarr:latest"
  
  ports {
    internal = 7878
    external = 7878
  }
  
  volumes {
    host_path      = "/media/movies"
    container_path = "/movies"
  }
  
  env = [
    "PUID=1000",
    "PGID=1000",
    "TZ=UTC"
  ]
}

# TsArr automation service
resource "docker_container" "tsarr_automation" {
  name  = "tsarr-automation"
  image = "tsarr-automation:latest"
  
  env = [
    "RADARR_BASE_URL=http://${docker_container.radarr.network_data[0].ip_address}:7878",
    "RADARR_API_KEY=${var.radarr_api_key}",
    "SONARR_BASE_URL=http://${docker_container.sonarr.network_data[0].ip_address}:8989",
    "SONARR_API_KEY=${var.sonarr_api_key}"
  ]
  
  volumes {
    host_path      = "/media"
    container_path = "/media"
    read_only      = true
  }
  
  depends_on = [
    docker_container.radarr,
    docker_container.sonarr
  ]
}
```

### Variables

```hcl
variable "radarr_api_key" {
  description = "Radarr API key"
  type        = string
  sensitive   = true
}

variable "sonarr_api_key" {
  description = "Sonarr API key"
  type        = string
  sensitive   = true
}

variable "media_path" {
  description = "Path to media storage"
  type        = string
  default     = "/media"
}
```

## Ansible

### Playbook

```yaml
---
- name: Deploy Servarr stack with TsArr automation
  hosts: media_servers
  become: yes
  
  vars:
    media_path: /media
    config_path: /opt/servarr
    
  tasks:
    - name: Create directory structure
      file:
        path: "{{ item }}"
        state: directory
        owner: "{{ ansible_user }}"
        group: "{{ ansible_user }}"
      loop:
        - "{{ config_path }}/radarr"
        - "{{ config_path }}/sonarr"
        - "{{ media_path }}/movies"
        - "{{ media_path }}/tv"
    
    - name: Deploy docker-compose.yml
      template:
        src: docker-compose.yml.j2
        dest: "{{ config_path }}/docker-compose.yml"
      notify: restart_services
    
    - name: Start Servarr services
      docker_compose:
        project_src: "{{ config_path }}"
        state: present
    
    - name: Deploy TsArr automation scripts
      copy:
        src: "{{ item }}"
        dest: "/opt/tsarr/"
      loop:
        - automation/
        - package.json
      notify: restart_automation
  
  handlers:
    - name: restart_services
      docker_compose:
        project_src: "{{ config_path }}"
        restarted: yes
    
    - name: restart_automation
      systemd:
        name: tsarr-automation
        state: restarted
```

## Environment Management

### Development

```bash
# .env.development
RADARR_BASE_URL=http://localhost:7878
RADARR_API_KEY=dev-key

SONARR_BASE_URL=http://localhost:8989
SONARR_API_KEY=dev-key

NODE_ENV=development
LOG_LEVEL=debug
```

### Production

```bash
# .env.production
RADARR_BASE_URL=https://radarr.yourdomain.com
RADARR_API_KEY=${RADARR_API_KEY}

SONARR_BASE_URL=https://sonarr.yourdomain.com
SONARR_API_KEY=${SONARR_API_KEY}

NODE_ENV=production
LOG_LEVEL=info
```

### CI/CD Integration

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
      
      - name: Install dependencies
        run: bun install
      
      - name: Build
        run: bun run build
      
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/tsarr-automation \
            automation=tsarr-automation:${{ github.sha }}
        env:
          KUBECONFIG: ${{ secrets.KUBECONFIG }}
```