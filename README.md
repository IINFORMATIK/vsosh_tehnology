<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/463906bc-8c75-40d2-b4d5-de92cde8f954

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## Запуск в Docker на школьном сервере

Требуется Docker Engine с Linux-контейнерами и Docker Compose. IP `10.160.46.146` должен быть назначен машине, на которой работает Docker. Если Docker работает в отдельной ВМ, укажите её IP через `BIND_IP`. Для доступа через адрес Windows-хоста в таком случае настройте перенаправление TCP-порта 8070 на ВМ.

Из каталога проекта на сервере выполните:

```sh
docker compose config -q
docker compose up -d --build
docker compose ps
curl http://10.160.46.146:8070/api/health
```

Интерфейс доступен по адресу http://10.160.46.146:8070. Если он открывается на сервере, но недоступен с другого школьного ПК, проверьте входящие правила для TCP 8070. Журнал приложения доступен через `docker compose logs --tail=100 app`.

JSON-база хранится в томе `app-data`. По умолчанию приложение создаёт стартовую базу. Чтобы перенести существующий `db_store.json` при первом запуске, замените команду `docker compose up -d --build` следующими командами:

```sh
docker compose build
docker compose run --rm --no-deps -T app sh -c 'umask 077; test ! -e /app/data/db_store.json && cat > /app/data/db_store.json' < db_store.json
docker compose up -d
```

Команда импорта рассчитана на Bash и откажется перезаписывать существующую базу. Для обновлений используйте `docker compose up -d --build`. Команда `docker compose down -v` удаляет том с данными.

Текущая версия подходит для пробного запуска с тестовыми данными в ограниченной сети. Перед выдачей доступа ученикам нужно добавить серверную проверку прав на административных маршрутах и маршрутах изменения данных, убрать демонстрационные учётные записи и хранить пароли в виде хешей.
