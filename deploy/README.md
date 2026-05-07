# Папка deploy/

Шаблоны конфигов для развёртывания aslankaa.com на ai-server. Подробный пошаговый план — в `../DEPLOY.md`.

## Файлы

| Файл | Куда копировать на сервере | Назначение |
|---|---|---|
| `Caddyfile` | `/srv/aslankaa/Caddyfile` | Конфиг веб-сервера Caddy с TLS Let's Encrypt |
| `docker-compose.yml` | `/srv/aslankaa/docker-compose.yml` | Запуск Caddy в Docker |
| `post-receive` | `/srv/aslankaa/site.git/hooks/post-receive` | Git-хук автодеплоя из bare-репозитория в `/srv/aslankaa/www` |

## Порядок применения

1. На локальной машине: `git push ai main`
2. На ai-server `post-receive` выкатывает HTML в `/srv/aslankaa/www`
3. Caddy продолжает раздавать (bind mount, перезапуск не нужен)

## Если нужен RAM-минимум

Caddy 2-alpine ~30 МБ ОЗУ. Если на ai-server мало памяти — заменить на nginx-alpine (~10 МБ) с самописным acme-клиентом, но Caddy проще в обслуживании.
