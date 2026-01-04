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

# Create nginx run directory
RUN mkdir -p /run/nginx

# Create s6 service for nginx
RUN mkdir -p /etc/s6-overlay/s6-rc.d/nginx/dependencies.d \
    /etc/s6-overlay/s6-rc.d/user/contents.d && \
    echo "longrun" > /etc/s6-overlay/s6-rc.d/nginx/type && \
    printf '#!/command/execlineb -P\nnginx -g "daemon off;"\n' > /etc/s6-overlay/s6-rc.d/nginx/run && \
    chmod +x /etc/s6-overlay/s6-rc.d/nginx/run && \
    touch /etc/s6-overlay/s6-rc.d/user/contents.d/nginx

EXPOSE 53/tcp 53/udp 80/tcp

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD dig +norecurse +retry=0 @127.0.0.1 pi.hole || exit 1
