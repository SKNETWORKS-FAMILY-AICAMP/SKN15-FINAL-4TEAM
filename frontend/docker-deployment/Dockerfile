FROM nginx:alpine
COPY docker-deployment/nginx.conf /etc/nginx/conf.d/default.conf
COPY ui/build /usr/share/nginx/html
COPY ui/public/*.csv /usr/share/nginx/html/
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
