# Deploying VELARA to Kubernetes

1. Build and push images to your registry:
   ```
   docker build -t <registry>/velara-backend:latest ./backend
   docker build -t <registry>/velara-frontend:latest --build-arg NEXT_PUBLIC_API_URL=https://api.velara.example.com/api ./frontend
   docker push <registry>/velara-backend:latest
   docker push <registry>/velara-frontend:latest
   ```
   Update the `image:` fields in `20-backend.yaml` and `30-frontend.yaml` to match.

2. Create the namespace and secrets:
   ```
   kubectl apply -f 00-namespace.yaml
   cp 01-secrets.example.yaml 01-secrets.yaml   # fill in real values first
   kubectl apply -f 01-secrets.yaml
   kubectl apply -f 02-configmap.yaml
   ```

3. Deploy Postgres, then the apps:
   ```
   kubectl apply -f 10-postgres.yaml
   kubectl apply -f 20-backend.yaml
   kubectl apply -f 30-frontend.yaml
   ```

4. Run the first migration + seed (one-off job or exec into a pod):
   ```
   kubectl exec -n velara deploy/backend -- npx prisma migrate deploy
   kubectl exec -n velara deploy/backend -- npm run seed
   ```

5. Point DNS at your ingress controller's external IP, then apply the ingress
   (requires an nginx ingress controller and cert-manager for TLS):
   ```
   kubectl apply -f 40-ingress.yaml
   ```

This is a starting point, not a finished production setup — review resource
limits, add NetworkPolicies, a PodDisruptionBudget, and a managed Postgres
(RDS/Cloud SQL) before running this for real traffic.
