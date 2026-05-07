# Деплой aslankaa.com

Документ описывает развёртывание статического сайта на `ai-server` (Tailscale tailnet `idriskaaa@`) с Caddy в Docker и автодеплоем через bare git repo.

Соответствует архитектуре, утверждённой в `E:\Проекты Аслана\Сайт - Песочница\2026-05-02_design_изолированная-редактура-сайта.md`.

---

## Открытые вопросы (решить до запуска)

1. **Как сайт смотрит наружу?**
   - Вариант A: **Tailscale Funnel** — публичный URL вида `aslankaa.<tail>.ts.net`, без своих DNS-записей. Быстро, бесплатно. Плюс — TLS из коробки. Минус — поддомен `*.ts.net`.
   - Вариант B: **Публичный DNS** на `aslankaa.com` через `reg.ru` → A-запись на публичный IP `ai-server` → Caddy получает Let's Encrypt сам.
   - Решение Аслана: __________________

2. **Где брать DNS для aslankaa.com?**
   - reg.ru API уже использован для grandhubai.com (см. `reference_regru_api_quirks.md`).
   - Если выбран вариант B — добавить A-запись методом `zone/add_alias` + `ipaddr`.

3. **Кто пишет в репозиторий?**
   - Только владелец (`adminai@ai-server`) — ничего настраивать не нужно, push делается с `usk` или `aslankaa` напрямую.
   - Брат через изолированный `webedit` — нужна полная инфраструктура из проекта «Сайт — Песочница» (git-shell, post-receive, systemd, ACL).

---

## Шаг 0. Локально (уже готово)

```bash
cd "C:\Users\ais001\Documents\Клод\сайт визитка Аслан КАА после аудита"
git status                    # должно быть чисто
git add .
git commit -m "initial site contents"
```

## Шаг 1. На ai-server: создать bare-репозиторий

```bash
ssh ai                         # adminai@ai-server через прокси do
sudo mkdir -p /srv/aslankaa
sudo git init --bare /srv/aslankaa/site.git
sudo chown -R adminai:adminai /srv/aslankaa/site.git
```

## Шаг 2. На ai-server: рабочее дерево

```bash
sudo mkdir -p /srv/aslankaa/www
sudo chown -R adminai:adminai /srv/aslankaa/www
```

## Шаг 3. post-receive хук (автодеплой)

Содержимое `/srv/aslankaa/site.git/hooks/post-receive`:

```bash
#!/bin/bash
set -euo pipefail
TARGET=/srv/aslankaa/www
GIT_WORK_TREE=$TARGET git checkout -f main
echo "deployed to $TARGET"
```

```bash
sudo chmod +x /srv/aslankaa/site.git/hooks/post-receive
```

## Шаг 4. Caddy в Docker

`/srv/aslankaa/Caddyfile`:

```caddy
aslankaa.com, www.aslankaa.com {
    root * /srv/www
    file_server
    encode gzip zstd
    header /policy-* Cache-Control "public, max-age=3600"
    header /images/* Cache-Control "public, max-age=86400"
    log {
        output file /var/log/caddy/aslankaa.log
    }
}
```

`/srv/aslankaa/docker-compose.yml`:

```yaml
services:
  caddy:
    image: caddy:2-alpine
    container_name: aslankaa-caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - ./www:/srv/www:ro
      - caddy-data:/data
      - caddy-config:/config
      - ./logs:/var/log/caddy

volumes:
  caddy-data:
  caddy-config:
```

```bash
cd /srv/aslankaa
sudo docker compose up -d
sudo docker compose logs -f --tail=50    # убедиться что TLS получен
```

## Шаг 5. С локальной машины: добавить remote и push

```bash
cd "C:\Users\ais001\Documents\Клод\сайт визитка Аслан КАА после аудита"
git remote add ai ssh://adminai@ai-server/srv/aslankaa/site.git
git push ai main
```

(хост `ai-server` доступен через Tailscale; SSH alias `ai` уже настроен в `~/.ssh/config` на `usk`.)

## Шаг 6. DNS

### Если вариант B (публичный DNS):

```bash
# на usk или aslankaa с настроенным reg.ru API
curl -X POST https://api.reg.ru/api/regru2/zone/add_alias \
  -d "username=$REG_USER" -d "password=$REG_PASS" \
  -d "domains[0][dname]=aslankaa.com" \
  -d "subdomain=@" \
  -d "ipaddr=<публичный IP ai-server>"
```

### Если вариант A (Tailscale Funnel):

```bash
ssh ai 'sudo tailscale funnel --https=443 --bg http://localhost:80'
```

## Шаг 7. Проверка

- `https://aslankaa.com/` → главная RU
- `https://aslankaa.com/en.html` → EN
- `https://aslankaa.com/policy-ru.html` → Соглашение
- DevTools → Network: 200 на всех ассетах, без mixed content

---

## Откат

Если деплой сломал сайт:

```bash
ssh ai
cd /srv/aslankaa/site.git
git log --oneline -5
git checkout <good-commit> -- .
GIT_WORK_TREE=/srv/aslankaa/www git checkout -f <good-commit>
```

## Бэкап

Cron на ai-server, ежедневно в 03:30 МСК:

```bash
0 0 * * * tar czf /srv/backup/aslankaa-$(date +\%F).tar.gz /srv/aslankaa/www
find /srv/backup -name 'aslankaa-*.tar.gz' -mtime +30 -delete
```
