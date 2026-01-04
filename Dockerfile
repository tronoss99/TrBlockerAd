FROM pihole/pihole:latest

LABEL org.opencontainers.image.title="TrBlockerAd"
LABEL org.opencontainers.image.description="Network-wide ad blocker with modern dashboard"
LABEL org.opencontainers.image.source="https://github.com/tronoss99/TrBlockerAd"
LABEL org.opencontainers.image.authors="tronoss99"

ENV TZ=Europe/Madrid
ENV DNSSEC=true
ENV QUERY_LOGGING=true
ENV FTLCONF_MAXDBDAYS=365

COPY pihole/adlists.list /etc/pihole/adlists.list
COPY pihole/custom.list /etc/pihole/custom.list

# Backup Pi-hole admin API, then replace with our dashboard
RUN mkdir -p /var/www/html/admin-api
RUN cp /var/www/html/admin/api.php /var/www/html/admin-api/ 2>/dev/null || true
RUN cp -r /var/www/html/admin/scripts /var/www/html/admin-api/ 2>/dev/null || true

# Remove Pi-hole default interface but keep admin folder for API
RUN rm -rf /var/www/html/index.html /var/www/html/index.php /var/www/html/pihole 2>/dev/null || true

# Copy our dashboard to root
COPY dashboard/dist/ /var/www/html/

# Fix lighttpd config to serve our static files
RUN echo 'mimetype.assign += (".js" => "application/javascript", ".css" => "text/css", ".svg" => "image/svg+xml")' >> /etc/lighttpd/lighttpd.conf

EXPOSE 53/tcp 53/udp 80/tcp

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD dig +norecurse +retry=0 @127.0.0.1 pi.hole || exit 1
