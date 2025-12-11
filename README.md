# ToDo App - Kubernetes Deployment

Простое приложение со списком дел, развернутое в Kubernetes с MongoDB.

## Требования

- Docker
- Kubernetes (Minikube или другой локальный кластер)
- kubectl

## Структура проекта

```
.
├── server/              # Backend приложение (Node.js/Express)
│   ├── app.js          # Основной файл приложения
│   ├── package.json    # Зависимости
│   └── Dockerfile      # Docker образ
├── k8s/                # Kubernetes манифесты
│   ├── app-deployment.yaml
│   ├── app-service.yaml
│   ├── mongodb-deployment.yaml
│   └── mongodb-service.yaml
└── deploy.ps1          # Скрипт развертывания (PowerShell)
```

## API Endpoints

- `GET /todos` - Получить все задачи
- `POST /todos` - Создать новую задачу
- `GET /todos/:id` - Получить задачу по ID
- `PUT /todos/:id` - Обновить задачу по ID
- `DELETE /todos/:id` - Удалить задачу по ID
- `GET /health` - Health check endpoint

## Развертывание

### 1. Запуск Minikube

```powershell
minikube start
```

### 2. Развертывание приложения

**Windows (PowerShell):**
```powershell
.\deploy.ps1
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Или вручную:**

```powershell
# Сборка Docker образа
docker build -t todo-app:latest ./server

# Загрузка образа в Minikube
minikube image load todo-app:latest

# Развертывание MongoDB
kubectl apply -f k8s/mongodb-deployment.yaml
kubectl apply -f k8s/mongodb-service.yaml

# Ожидание готовности MongoDB
kubectl wait --for=condition=available --timeout=300s deployment/mongodb-deployment

# Развертывание приложения
kubectl apply -f k8s/app-deployment.yaml
kubectl apply -f k8s/app-service.yaml

# Ожидание готовности приложения
kubectl wait --for=condition=available --timeout=300s deployment/todo-app-deployment
```

### 3. Доступ к приложению

```powershell
minikube service todo-app-service
```

Или получить URL:
```powershell
minikube service todo-app-service --url
```

## Проверка статуса

```powershell
# Проверить поды
kubectl get pods

# Проверить сервисы
kubectl get services

# Проверить логи приложения
kubectl logs -f deployment/todo-app-deployment

# Проверить логи MongoDB
kubectl logs -f deployment/mongodb-deployment
```

## Тестирование API

После получения URL от `minikube service`, вы можете протестировать API:

```powershell
# Получить все задачи
curl http://<SERVICE-URL>/todos

# Создать новую задачу
curl -X POST http://<SERVICE-URL>/todos `
  -H "Content-Type: application/json" `
  -d '{"title":"Тестовая задача","description":"Описание","completed":false}'

# Получить задачу по ID
curl http://<SERVICE-URL>/todos/<ID>

# Обновить задачу
curl -X PUT http://<SERVICE-URL>/todos/<ID> `
  -H "Content-Type: application/json" `
  -d '{"title":"Обновленная задача","completed":true}'

# Удалить задачу
curl -X DELETE http://<SERVICE-URL>/todos/<ID>
```

## Удаление развертывания

```powershell
kubectl delete -f k8s/app-deployment.yaml
kubectl delete -f k8s/app-service.yaml
kubectl delete -f k8s/mongodb-deployment.yaml
kubectl delete -f k8s/mongodb-service.yaml
```

## Исправленные проблемы

1. ✅ Добавлена обработка ошибок подключения к MongoDB с автоматическим переподключением
2. ✅ Исправлен MongoDB Service (убрано `clusterIP: None`)
3. ✅ Добавлены health checks (liveness и readiness probes)
4. ✅ Создан `.dockerignore` файл
5. ✅ Добавлен health check endpoint `/health`
6. ✅ Созданы скрипты для автоматического развертывания
