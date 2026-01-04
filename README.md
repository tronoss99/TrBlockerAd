# 🛡️ TrBlockerAd

[English](#english) | [Español](#español)

---

<a name="english"></a>
## 🇬🇧 English

Network-wide ad blocker for all your devices. Modern React + TailwindCSS dashboard with real-time stats, dark/light mode, multi-language (EN/ES). Blocks ads, trackers, malware & phishing. Single Docker container, easy install, low resources.

### ✨ Features

- 🚫 Block ads, trackers, malware, phishing on ALL devices
- 📊 Real-time statistics and charts
- 🌍 Multi-language support (English/Spanish)
- 🌙 Dark/Light mode
- 📱 Responsive design
- 🔒 DNSSEC enabled
- 💾 Low resource usage (~256MB RAM)
- 🐳 Single Docker container

### 📦 Installation

#### Option 1: One Command (Recommended)

```bash
curl -sSL https://raw.githubusercontent.com/tronoss99/TrBlockerAd/main/install.sh | bash
```

The installer will ask for your admin password.

#### Option 2: Docker Compose

1. Create a directory and download files:
```bash
mkdir TrBlockerAd && cd TrBlockerAd
curl -sSL https://raw.githubusercontent.com/tronoss99/TrBlockerAd/main/docker-compose.yml -o docker-compose.yml
curl -sSL https://raw.githubusercontent.com/tronoss99/TrBlockerAd/main/.env.example -o .env
```

2. Edit `.env` file with your password:
```bash
nano .env
```

3. Start the container:
```bash
docker-compose up -d
```

#### Option 3: Docker Run

```bash
docker run -d \
  --name TrBlockerAd \
  -p 53:53/tcp \
  -p 53:53/udp \
  -p 3000:80 \
  -v $(pwd)/data/pihole:/etc/pihole \
  -v $(pwd)/data/dnsmasq:/etc/dnsmasq.d \
  -e TZ=Europe/Madrid \
  -e WEBPASSWORD=your_secure_password \
  --cap-add NET_ADMIN \
  --restart unless-stopped \
  ghcr.io/tronoss99/TrBlockerAd:latest
```

#### Option 4: Portainer / NAS Docker UI

Copy this docker-compose configuration into your NAS Docker interface:

```yaml
version: '3.8'
services:
  trblocker:
    image: ghcr.io/tronoss99/TrBlockerAd:latest
    container_name: TrBlockerAd
    environment:
      - TZ=Europe/Madrid
      - WEBPASSWORD=your_secure_password
    volumes:
      - ./data/pihole:/etc/pihole
      - ./data/dnsmasq:/etc/dnsmasq.d
    ports:
      - "53:53/tcp"
      - "53:53/udp"
      - "3000:80"
    restart: unless-stopped
    cap_add:
      - NET_ADMIN
```

### 🔌 Ports

| Port | Protocol | Service | Modifiable? |
|------|----------|---------|-------------|
| 53 | TCP/UDP | DNS Server | ⚠️ **NO** - Must be 53 for DNS to work |
| 3000 | TCP | Web Dashboard | ✅ **YES** - Can change to any port (e.g., 8080:80) |

**Important:** Port 53 cannot be changed because DNS protocol requires port 53. The dashboard port (3000) can be changed to any available port.

Example with custom dashboard port:
```yaml
ports:
  - "53:53/tcp"
  - "53:53/udp"
  - "8080:80"  # Dashboard on port 8080
```

### 🖥️ Access

- **Dashboard**: `http://YOUR_SERVER_IP:3000`
- **DNS Server**: `YOUR_SERVER_IP` (port 53)

### ⚙️ Configuration (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| `WEBPASSWORD` | - | **Required**: Admin password |
| `TZ` | `Europe/Madrid` | Timezone |
| `PIHOLE_DNS` | `1.1.1.1;8.8.8.8` | Upstream DNS servers |
| `DNSSEC` | `true` | DNSSEC validation |
| `QUERY_LOGGING` | `true` | Query logging |
| `LOG_RETENTION_DAYS` | `365` | Days to keep logs |

### 📱 Configure Your Devices

Set your device's DNS to point to the server IP where TrBlockerAd is running.

**Per Device:**
- **Windows**: Settings → Network → Change adapter options → Properties → IPv4 → DNS: `YOUR_SERVER_IP`
- **macOS**: System Preferences → Network → Advanced → DNS → Add `YOUR_SERVER_IP`
- **iOS**: Settings → Wi-Fi → (i) → Configure DNS → Manual → `YOUR_SERVER_IP`
- **Android**: Settings → Network → Private DNS → `YOUR_SERVER_IP`

**Router (Best Option):**
If your router allows it, set DNS to `YOUR_SERVER_IP` and all devices will be protected automatically.

### 🆘 Troubleshooting

**Port 53 already in use:**
```bash
sudo systemctl stop systemd-resolved
sudo systemctl disable systemd-resolved
```

**View logs:**
```bash
docker logs TrBlockerAd
```

**Restart container:**
```bash
docker restart TrBlockerAd
```

---

<a name="español"></a>
## 🇪🇸 Español

Bloqueador de anuncios a nivel de red para todos tus dispositivos. Dashboard moderno con React + TailwindCSS, estadísticas en tiempo real, modo oscuro/claro, multi-idioma (ES/EN). Bloquea anuncios, rastreadores, malware y phishing. Un solo contenedor Docker, instalación fácil, bajo consumo de recursos.

### ✨ Características

- 🚫 Bloquea anuncios, rastreadores, malware, phishing en TODOS los dispositivos
- 📊 Estadísticas y gráficos en tiempo real
- 🌍 Soporte multi-idioma (Español/Inglés)
- 🌙 Modo Oscuro/Claro
- 📱 Diseño responsive
- 🔒 DNSSEC habilitado
- 💾 Bajo consumo de recursos (~256MB RAM)
- 🐳 Un solo contenedor Docker

### 📦 Instalación

#### Opción 1: Un Solo Comando (Recomendado)

```bash
curl -sSL https://raw.githubusercontent.com/tronoss99/TrBlockerAd/main/install.sh | bash
```

El instalador te pedirá la contraseña de administrador.

#### Opción 2: Docker Compose

1. Crea un directorio y descarga los archivos:
```bash
mkdir TrBlockerAd && cd TrBlockerAd
curl -sSL https://raw.githubusercontent.com/tronoss99/TrBlockerAd/main/docker-compose.yml -o docker-compose.yml
curl -sSL https://raw.githubusercontent.com/tronoss99/TrBlockerAd/main/.env.example -o .env
```

2. Edita el archivo `.env` con tu contraseña:
```bash
nano .env
```

3. Inicia el contenedor:
```bash
docker-compose up -d
```

#### Opción 3: Docker Run

```bash
docker run -d \
  --name TrBlockerAd \
  -p 53:53/tcp \
  -p 53:53/udp \
  -p 3000:80 \
  -v $(pwd)/data/pihole:/etc/pihole \
  -v $(pwd)/data/dnsmasq:/etc/dnsmasq.d \
  -e TZ=Europe/Madrid \
  -e WEBPASSWORD=tu_contraseña_segura \
  --cap-add NET_ADMIN \
  --restart unless-stopped \
  ghcr.io/tronoss99/TrBlockerAd:latest
```

#### Opción 4: Portainer / Interfaz Docker del NAS

Copia esta configuración docker-compose en la interfaz Docker de tu NAS:

```yaml
version: '3.8'
services:
  trblocker:
    image: ghcr.io/tronoss99/TrBlockerAd:latest
    container_name: TrBlockerAd
    environment:
      - TZ=Europe/Madrid
      - WEBPASSWORD=tu_contraseña_segura
    volumes:
      - ./data/pihole:/etc/pihole
      - ./data/dnsmasq:/etc/dnsmasq.d
    ports:
      - "53:53/tcp"
      - "53:53/udp"
      - "3000:80"
    restart: unless-stopped
    cap_add:
      - NET_ADMIN
```

### 🔌 Puertos

| Puerto | Protocolo | Servicio | ¿Modificable? |
|--------|-----------|----------|---------------|
| 53 | TCP/UDP | Servidor DNS | ⚠️ **NO** - Debe ser 53 para que funcione el DNS |
| 3000 | TCP | Dashboard Web | ✅ **SÍ** - Puedes cambiarlo a cualquier puerto (ej: 8080:80) |

**Importante:** El puerto 53 no se puede cambiar porque el protocolo DNS requiere el puerto 53. El puerto del dashboard (3000) se puede cambiar a cualquier puerto disponible.

Ejemplo con puerto de dashboard personalizado:
```yaml
ports:
  - "53:53/tcp"
  - "53:53/udp"
  - "8080:80"  # Dashboard en puerto 8080
```

### 🖥️ Acceso

- **Dashboard**: `http://IP_DE_TU_SERVIDOR:3000`
- **Servidor DNS**: `IP_DE_TU_SERVIDOR` (puerto 53)

### ⚙️ Configuración (.env)

| Variable | Por Defecto | Descripción |
|----------|-------------|-------------|
| `WEBPASSWORD` | - | **Requerido**: Contraseña de admin |
| `TZ` | `Europe/Madrid` | Zona horaria |
| `PIHOLE_DNS` | `1.1.1.1;8.8.8.8` | Servidores DNS upstream |
| `DNSSEC` | `true` | Validación DNSSEC |
| `QUERY_LOGGING` | `true` | Registro de consultas |
| `LOG_RETENTION_DAYS` | `365` | Días de retención de logs |

### 📱 Configura tus Dispositivos

Configura el DNS de tu dispositivo para que apunte a la IP del servidor donde está TrBlockerAd.

**Por Dispositivo:**
- **Windows**: Configuración → Red → Cambiar opciones del adaptador → Propiedades → IPv4 → DNS: `IP_DEL_SERVIDOR`
- **macOS**: Preferencias del Sistema → Red → Avanzado → DNS → Añadir `IP_DEL_SERVIDOR`
- **iOS**: Ajustes → Wi-Fi → (i) → Configurar DNS → Manual → `IP_DEL_SERVIDOR`
- **Android**: Ajustes → Red → DNS Privado → `IP_DEL_SERVIDOR`

**Router (Mejor Opción):**
Si tu router lo permite, configura el DNS a `IP_DEL_SERVIDOR` y todos los dispositivos estarán protegidos automáticamente.

### 🆘 Solución de Problemas

**Puerto 53 ya en uso:**
```bash
sudo systemctl stop systemd-resolved
sudo systemctl disable systemd-resolved
```

**Ver logs:**
```bash
docker logs TrBlockerAd
```

**Reiniciar contenedor:**
```bash
docker restart TrBlockerAd
```

---

## 📋 Included Blocklists / Listas de Bloqueo Incluidas

- StevenBlack Hosts (180K+ domains)
- AdGuard DNS Filter
- EasyList & EasyPrivacy
- Phishing Army
- Malware domains
- Crypto miners
- And more...

## 🔒 Security / Seguridad

- No hardcoded passwords / Sin contraseñas hardcodeadas
- All sensitive data in `.env` file / Todos los datos sensibles en archivo `.env`
- DNSSEC enabled by default / DNSSEC habilitado por defecto
- Regular blocklist updates / Actualizaciones regulares de listas

## 📄 License / Licencia

MIT License - Feel free to use and modify / Siéntete libre de usar y modificar.

---

Made with ❤️ by [tronoss99](https://github.com/tronoss99)
