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

COPY dashboard/dist /var/www/html/custom
COPY nginx-pihole.conf /etc/lighttpd/conf-enabled/99-trblocker.conf

EXPOSE 53/tcp 53/udp 80/tcp

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD dig +norecurse +retry=0 @127.0.0.1 pi.hole || exit 1
