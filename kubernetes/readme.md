# Run in kubernetes

Create namespace:

```bash
$ kubectl create namespace marketplace-agent
namespace/marketplace-agent created
```

## Resources

### Configuration

Replace `data.agent-config` in file  *agent-config-secret.yaml* with agent configuration base64-encoded.

Create configuration secret

```console
$ kubectl -n marketplace-agent apply -f kubernetes/agent-config-secret.yaml
secret/agent-config created
```

### Volume

Create persistent volume claim

```console
$ kubectl -n marketplace-agent apply -f kubernetes/agent-data-persistentvolumeclaim.yaml
persistentvolumeclaim/agent-data created
```

### Deployment

Create agent deployment:

```console
$ kubectl -n marketplace-agent apply -f kubernetes/agent-deployment.yaml
deployment.apps/agent created created
```

Restart agent deployment:

```console
$ kubectl rollout restart -n marketplace-agent deployments/agent
deployment.apps/agent restarted
```

### Service

Create service:

```console
$ kubectl -n marketplace-agent apply -f kubernetes/agent-service.yaml
servicemarketplace-agent.apps/agent created created
```

## Interacting

### Logs

Get agent pod:

```console
$ kubectl -n marketplace-agent get pods
NAME                     READY   STATUS             RESTARTS       AGE
agent-54d46564df-tv4bf   0/1     CrashLoopBackOff   10 (14s ago)   30m
```

Get pod logs:

```console
$ kubectl -n marketplace-agent logs agent-54d46564df-tv4bf
[s6-init] making user provided files available at /var/run/s6/etc...exited 0.
[s6-init] ensuring user provided files have correct perms...exited 0.
[fix-attrs.d] applying ownership & permissions fixes...
[fix-attrs.d] done.
[cont-init.d] executing container initialization scripts...
[cont-init.d] done.
[services.d] starting services
[services.d] done.

> marketplace-agent@1.0.0 headless:pm2:start
> pm2-runtime start ecosystem.config.js

2023-01-09T14:32:07: PM2 log: Launching in no daemon mode
2023-01-09T14:32:07: PM2 log: App [headless-agent:0] starting in -cluster mode-
2023-01-09T14:32:07: PM2 log: App [headless-agent:0] online
...
```

Delete all:

```console
$ kubectl delete namespace marketplace-agent
namespace "marketplace-agent" deleted
```
