FROM pihole/pihole:latest

LABEL org.opencontainers.image.title="TrBlockerAd"
LABEL org.opencontainers.image.description="Network-wide ad blocker with modern dashboard"
LABEL org.opencontainers.image.source="https://github.com/tronoss99/TrBlockerAd"
LABEL org.opencontainers.image.authors="tronoss99"

ENV TZ=Europe/Madrid
ENV DNSSEC=true
ENV QUERY_LOGGING=true
ENV WEBTHEME=default-dark
ENV FTLCONF_webserver_port=8080

COPY pihole/adlists.list /etc/pihole/adlists.list
COPY pihole/custom.list /etc/pihole/custom.list

# Install nginx
RUN apk add --no-cache nginx

# Copy our dashboard
COPY dashboard/dist/ /var/www/trblocker/

# Copy nginx config
COPY nginx-pihole.conf /etc/nginx/http.d/default.conf

# Create nginx directories
RUN mkdir -p /run/nginx /var/log/nginx

# Add nginx start to Pi-hole's bash init scripts
RUN mkdir -p /etc/pihole && \
    echo '#!/bin/bash' > /etc/pihole/start-nginx.sh && \
    echo 'nginx' >> /etc/pihole/start-nginx.sh && \
    chmod +x /etc/pihole/start-nginx.sh

# Modify the pihole startup to include nginx
RUN sed -i 's|exec /usr/bin/pihole-FTL|/etc/pihole/start-nginx.sh \&\& exec /usr/bin/pihole-FTL|g' /usr/local/bin/_startup.sh 2>/dev/null || \
    echo '/etc/pihole/start-nginx.sh' >> /etc/pihole/pihole-FTL.conf 2>/dev/null || true

# Alternative: use cron @reboot
RUN echo '@reboot nginx' >> /var/spool/cron/crontabs/root 2>/dev/null || true

EXPOSE 53/tcp 53/udp 80/tcp

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD dig +norecurse +retry=0 @127.0.0.1 pi.hole || exit 1
