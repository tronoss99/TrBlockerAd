#!/bin/bash

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════╗"
echo "║      🛡️  TrBlockerAd Installer         ║"
echo "║     Network Ad Blocker by tronoss99   ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"

INSTALL_DIR="${INSTALL_DIR:-$HOME/TrBlockerAd}"

echo -e "${GREEN}→ Creando directorio: $INSTALL_DIR${NC}"
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

echo -e "${GREEN}→ Descargando archivos...${NC}"
curl -sSL https://raw.githubusercontent.com/tronoss99/TrBlockerAd/main/docker-compose.yml -o docker-compose.yml
curl -sSL https://raw.githubusercontent.com/tronoss99/TrBlockerAd/main/.env.example -o .env.example

if [ ! -f .env ]; then
    echo -e "${YELLOW}→ Creando archivo .env...${NC}"
    cp .env.example .env
    
    read -p "Introduce la contraseña de admin (o pulsa Enter para 'admin123'): " PASSWORD
    PASSWORD=${PASSWORD:-admin123}
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/change_this_password/$PASSWORD/" .env
    else
        sed -i "s/change_this_password/$PASSWORD/" .env
    fi
    
    echo -e "${GREEN}✓ Contraseña configurada${NC}"
fi

echo -e "${GREEN}→ Creando directorios de datos...${NC}"
mkdir -p data/pihole data/dnsmasq

echo -e "${GREEN}→ Iniciando TrBlockerAd...${NC}"
docker-compose pull
docker-compose up -d

IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")

echo ""
echo -e "${CYAN}╔═══════════════════════════════════════╗"
echo -e "║      ✅ Instalación completada!        ║"
echo -e "╚═══════════════════════════════════════╝${NC}"
echo ""
echo -e "Dashboard: ${BLUE}http://${IP}:3000${NC}"
echo -e "Servidor DNS: ${BLUE}${IP}:53${NC}"
echo ""
echo -e "${YELLOW}Nota: Los cambios desde la UI se guardan automáticamente.${NC}"
echo -e "${YELLOW}El archivo .env solo se usa en la configuración inicial.${NC}"
echo ""
echo -e "Configura tus dispositivos para usar este servidor DNS"
echo -e "y bloquea anuncios en toda tu red!"
echo ""
