# ToDo App - Kubernetes Deployment; Батов Даниил ЭФБО-10-23

## Требования

- Docker
- Kubernetes (Minikube или другой локальный кластер)
- kubectl

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
