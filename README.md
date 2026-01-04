# 🛡️ TrBlockerAd

Bloqueador de anuncios a nivel de red con un dashboard moderno. Bloquea anuncios en TODOS tus dispositivos sin instalar nada en ellos.

![Dashboard Preview](https://via.placeholder.com/800x400?text=TrBlockerAd+Dashboard)

## ⚡ Instalación Rápida

### Opción 1: Un Solo Comando (Recomendado)

```bash
curl -sSL https://raw.githubusercontent.com/tronoss99/trblocker-ad/main/install.sh | bash
```

El instalador te pedirá la contraseña de admin.

### Opción 2: Docker Compose (Manual)

1. Descarga los archivos:
```bash
mkdir trblocker-ad && cd trblocker-ad
curl -sSL https://raw.githubusercontent.com/tronoss99/trblocker-ad/main/docker-compose.yml -o docker-compose.yml
curl -sSL https://raw.githubusercontent.com/tronoss99/trblocker-ad/main/.env.example -o .env
```

2. Edita el archivo `.env` con tu contraseña:
```bash
nano .env
```

3. Inicia el contenedor:
```bash
docker-compose up -d
```

### Opción 3: Docker Run

```bash
docker run -d \
  --name trblocker-ad \
  -p 53:53/tcp \
  -p 53:53/udp \
  -p 3000:80 \
  -v $(pwd)/data/pihole:/etc/pihole \
  -v $(pwd)/data/dnsmasq:/etc/dnsmasq.d \
  -e TZ=Europe/Madrid \
  -e WEBPASSWORD=tu_contraseña_segura \
  --cap-add NET_ADMIN \
  --restart unless-stopped \
  ghcr.io/tronoss99/trblocker-ad:latest
```

## 🖥️ Acceso

- **Dashboard**: http://TU_IP:3000
- **Servidor DNS**: TU_IP:53

## ⚙️ Configura tus Dispositivos

Configura el DNS de tu dispositivo para que apunte a la IP del servidor donde está TrBlockerAd.

### Por Dispositivo
- **Windows**: Configuración → Red → Cambiar opciones del adaptador → Propiedades → IPv4 → Usar DNS: `IP_DEL_SERVIDOR`
- **macOS**: Preferencias del Sistema → Red → Avanzado → DNS → Añadir `IP_DEL_SERVIDOR`
- **iOS**: Ajustes → Wi-Fi → (i) → Configurar DNS → Manual → Añadir `IP_DEL_SERVIDOR`
- **Android**: Ajustes → Red → DNS Privado → `IP_DEL_SERVIDOR`

### Router (Mejor Opción)
Si tu router lo permite, configura el servidor DNS a `IP_DEL_SERVIDOR` y todos los dispositivos estarán protegidos automáticamente.

## ✨ Características

- 🚫 Bloquea anuncios, rastreadores, malware, phishing
- 📊 Estadísticas y gráficos en tiempo real
- 🌍 Multi-idioma (Español/Inglés)
- 🌙 Modo Oscuro/Claro
- 📱 Diseño responsive
- 🔒 DNSSEC habilitado
- 💾 Bajo consumo de recursos (~256MB RAM)
- 🐳 Un solo contenedor Docker

## 📋 Listas de Bloqueo Incluidas

- StevenBlack Hosts (180K+ dominios)
- AdGuard DNS Filter
- EasyList & EasyPrivacy
- Phishing Army
- Dominios de Malware
- Crypto miners
- Y más...

## 🔧 Configuración (.env)

Copia `.env.example` a `.env` y modifica los valores:

| Variable | Por Defecto | Descripción |
|----------|-------------|-------------|
| `WEBPASSWORD` | - | **Requerido**: Contraseña de admin |
| `TZ` | `Europe/Madrid` | Zona horaria |
| `PIHOLE_DNS` | `1.1.1.1;8.8.8.8` | DNS Upstream |
| `DNSSEC` | `true` | Validación DNSSEC |
| `QUERY_LOGGING` | `true` | Registro de consultas |
| `LOG_RETENTION_DAYS` | `365` | Días de retención de logs |

## 📦 Puertos

| Puerto | Protocolo | Servicio |
|--------|-----------|----------|
| 53 | TCP/UDP | DNS |
| 3000 | TCP | Dashboard Web |

## 🆘 Solución de Problemas

### Puerto 53 ya en uso
```bash
sudo systemctl stop systemd-resolved
sudo systemctl disable systemd-resolved
```

### Ver logs
```bash
docker logs trblocker-ad
```

## 📄 Licencia

MIT License - Siéntete libre de usar y modificar.

---

Hecho con ❤️ por [tronoss99](https://github.com/tronoss99) para un internet mejor sin anuncios.
