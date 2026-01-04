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

# Remove Pi-hole's blocking lighttpd configs that interfere with our dashboard
RUN rm -f /etc/lighttpd/conf-enabled/15-pihole-admin.conf 2>/dev/null || true
RUN rm -f /etc/lighttpd/conf-enabled/15-fastcgi-php.conf 2>/dev/null || true

# Remove Pi-hole default interface but keep admin folder for API
RUN rm -rf /var/www/html/index.html /var/www/html/index.php /var/www/html/pihole 2>/dev/null || true

# Copy our dashboard to root
COPY dashboard/dist/ /var/www/html/

# Copy our lighttpd config
COPY nginx-pihole.conf /etc/lighttpd/conf-enabled/99-trblocker.conf

EXPOSE 53/tcp 53/udp 80/tcp

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD dig +norecurse +retry=0 @127.0.0.1 pi.hole || exit 1
