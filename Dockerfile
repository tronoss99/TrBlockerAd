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

# Create cont-init script to start nginx (runs during container init)
RUN mkdir -p /etc/cont-init.d && \
    printf '#!/bin/sh\nnginx\n' > /etc/cont-init.d/99-start-nginx && \
    chmod +x /etc/cont-init.d/99-start-nginx

EXPOSE 53/tcp 53/udp 80/tcp

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD dig +norecurse +retry=0 @127.0.0.1 pi.hole || exit 1
