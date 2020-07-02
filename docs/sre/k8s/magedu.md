## k8s
## 04-kubernetes应用快速入门
```

kubectl --help

kubectl get pods
kubectl get pods -o wide
kubectl get deployment
kubectl get nodes
kubectl delete  pods 

## kubectl expose --help



## kubectl run
kubectl run client --image=busybox --replicas=1 -it --restart=never


kubectl get svc 
kubectl describe svc nginx

kube

```
## 标签和标签选择器

```
kubectl get pods --show-labels
```

## myapp 为例

```
## 部署myapp
kubectl run myapp  --image=ikubernetes/myapp:v1 --replicas=2

kubectl get deployment 
kubectl get deployment  -w

kubectl get pods -o wide

## 查看详情
kubectl describe  pods pods-name


## 暴露
kubectl expose deployment myapp --name=myapp --port=80

## 动态扩容和缩容
kubectl scale --replicas=5 deployment myapp

kubectl scale --replicas=3 deploymnet myapp

## 滚动升级（灰度发布）
kubectl set image deployment myapp myapp=ikubernetes/myapp:v2

## 查看更新详情
kubectl rollout status deployment myapp

## 回滚
kubectl rollout undo deployment myapp

iptables -vnL -t nat

## 修改service使外网（集群外部）可以访问
kubectl edit svc myapp

kubectl get svc

```

## 05-k8s资源清单定义入门

```
RESTful
  GET, PUT, DELETE, POST,...
 
资源：对象
 workload: Pod, ReplicaSet, Deployment, StatefulSet, DaemonSet, Job, Cronjob, ...
 服务发现及均衡： Service, Ingress, ...
 配置与存储： Volume, CSI
   ConfighMap, Secret
   DownwardAPI
 集群级资源
   Namespace, Node, Role, ClusterRole, RoleBinding, ClusterRoleBinding
 元数据型资源
   HPA, PodTemplate, LimitRange
 
 ## 清单格式定义pod
 kubectl get pod pod-name -o yaml
 
 kubectl api-version

## 如何定义清单
kubectl explain  pods

kubectl explain pods.metadata

kubectl explain pods.spec.containers


```

#### pod-demo
```
## cat pod-demo.yml
apiVersion: v1
kind: Pod
metadata:
  name: pod-demo
  namespace: default
  labels:
    app: myapp
    tier: frontend
spec:
  containers:
  - name: myapp
    image: ikubernetes/myapp:v1
  - name: busybox
    image: busybox:latest
    command:
    - "/bin/sh"
    - "-c"
    - "sleep 3600"

## kubectl 
kubectl create -f pod-demo.yml

kubectl get pods

kubectl delete -f pod-demo.yml


```
## 06-k8s Pod控制器应用进阶
### 资源的清单格式
- 一级字段： apiVersion(group/version),kind,metadata(name,namespace,labels,annotations,...),spec,status(只读，系统自定义)
 

### 标签选择器
```
kubectl get pods -l app --show labels
kubectl label pods pod-demo release=stable

kubectl label pods pod-demo release=stable --overwrite

kubectl get pods -l app --show-labels
```
### nodeSelector 节点标签选择器
```
kubectl get nodes --show-labels
kubectl label nodes node01.magedu.com disktype=ssd
kubectl get nodes --show-labels

```

### annotations:
- 与label不同的地方在于，它不能挑选资源对象，仅用于为对象提供“元数据”。

### Pod的生命周期
> Pending, Running, Failed, Successed, Unknown

Pod生命周期中的重要行为：
初始化容器
容器探测： liveness, readiness

restartPolicy:
 Always, OnFailure, Never. Default to Always
 
## 07-k8s Pod控制器应用进阶2
 
```
kubectl explain pods.spec.containers.livenessProbe
 
kubectl explain pods.spec.containers.livenessProbe.httpGet
 
 
```
 
#### 状态检测liveness-httpget-container
```
cat  liveness-httpget-pod
apiVersion: v1
kind: Pod
metadata:
  name: liveness-httpget-pod
  namespace: default
spec:
  containers:
  - name: liveness-httpget-container
     image: ikubernetes/myapp:v1
     imagePullPolicy: IfNotPresent
     ports:
     - name: http
       containerPort: 80
     livenessProbe:
       httpGet:
         port: http
         path: /index.html
       initialDelaySeconds: 1
       periodSeconds: 3
 
 ```
 
#### 就绪检测
 ```
 ##
 ```
 
 
### postStart-pod.yml
 ```
 ##
 ```
 
## 08-k8s Pod控制器1
 - ReplicationController:
 - ReplicaSet
 - Deployment
 - DaemonSet
 - Job
 - Cronjob
 - 
 
 ```
 
 ```
 
## 09-k8s Pod控制器2
 
```
## 查看支持的更新策略
kubectl explain deploy.spec.strategy
 
 cat deploy-demo.yml
 
 apiVersion: apps/v1
 kind: Deployment
 metadata:
   name: myapp-deploy
   namespace: default
 spec:
   replicas: 2
   selector:
     matchLabels:
       app: myapp
       release: canary
    template:
      metadata:
        labels:
          app: myapp
          release: canary
      spec:
        containers:
        - name: myapp
          image: ikubernetes/myapp:v1
          ports:
          - name: http
            containerPort: 80
 
############
 
 kubectl apply -f deploy-demo.yml
 kubectl get deploy
 kubectl get rs
 
 ## 显示更新过程
 kubectl get pods -l app=myapp -w
 
 kubectl get rs
 kubectl get rs -o wide
 
 ## 查看滚动历史
 kubectl rollout history --help
 
 ## kubectl patch打补丁方式扩容
 kubectl patch --help
 kubectl patch deployment myapp-deploy -p '{"spec":{"replicas":5}}'
 
 
 kubectl patch deployment myapp-deploy -p '{"spec":{"strategy":{"rollingUpdate":{"maxSurge":1,"maxUnavailable":0}}}}'
 
 kubectl describe deployment myapp-deploy
 
 
 ## 
 kubectl set image deployment myapp-deploy myapp=ikubernetes/myapp:v3 && kubectl rollout pause deployment myapp-deploy
 
 kubectl rollout resume deployment myapp-deploy
 
 ## 查看更新详情的方法
 kubectl status deployment myapp-deploy
 
 kubectl get pods -l app=myapp -w
 
```
 
#### daemonSet
```
cat  ds-demo.yml
 
 apiVersion: apps/v1
 kind: DaemonSet
 metadata:
   name: myapp-ds
   namespace: default
 spec:
   selector:
     metchLabels:
       app: filebeat
       release: stable
   template:
     metadata:
       labels:
         app: filebeat
         release: stable
     spec:
       containers:
       - name: filebeat
         image: ikubernetes/filebeat:5.6.5-alpine
         env:
         - name: REDIS_HOST
           value: redis.default.svc.cluster.local
         - name: REDIS_LOG_LEVEL
           value: info
           
####
kubectl apply -f ds-demo.yml
kubectl get pods


kubectl set image daemonsets filebeat-ds filebeat=ikubernetes/filebeat:5.6.6-alpine


```
 
## 10-k8s service资源
 
- 模型： userspace, iptables, ipvs
- ClusterIP, NodePort
    - NodePort: client -> NodeIP:NodePort -> ClusterIP:ServicePort -> PodIP:containerPort
    - LoadBalancer
    - ExternelName
        - FQDN
            - CNAME ->FQDN
- No ClusterIP: Headless Service
    - ServiceName -> PodIP

#### clusterIP方式 
```
kubectl explain svc.spec.ports
 
cat redis-svc.yml
 
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: default
spec:
  selector:
    app: redis
    role: logstor
  clusterIP: 10.97.97.97
  type: ClusterIP
  ports:
  - port: 6379
    targetPort: 6379

###
kubectl apply -f redis-svc.yml

kubectl get svc
kubectl describe svc redis

```

#### Nodeport方式 
```
## cat myapp-svc.yml
apiVersion: v1
kind: Service
metadata:
  name: myapp
  namespace: default
spec:
  selector:
    app: myapp
    release: canary
  clusterIP: 10.99.99.99
  type: NodePort
  ports:
  - port: 80
    targetPort: 80
    nodePort: 30080

### 打补丁
kubectl patch myapp -p '{"spec":{"sessionAffinity":"ClientIP"}}}'

kubectl describe svc myapp
kubectl patch myapp -p '{"spec":{"sessionAffinity":"None"}}'
```

#### dns
```
## 查看系统svc，可以看到kube-dns的ip地址
kubectl get svc -n kube-system

## 
dig -A myapp-svc.default.svc.cluster.local.  @10.96.0.10


```

### 11-ingress 及ingress Controller
> 七层调度

```
kubectl explain ingress

https://github.com/kubernetes/ingress-nginx/blob/master/docs/deploy/index.md#prerequisite-generic-deployment-command

https://kubernetes.github.io/ingress-nginx/


## openssl 生成证书
openssl genrsa -out tls.key 2048
openssl req -new -x509 -k tls.key -out tls.crt -subj /C=CN/ST=Beijing/L=Beijing/O=DevOps/CN=tomcat.magedu.com

kubectl  create secret tls tomcat-ingress-secret --cert=tls.crt --key=tls.key

kubectl get sceret

kubectl decribe sceret tomcat-ingress-secret

```

## 12-k8s 存储卷

```
kubectl explain pods.spec.volume

kubectl explain pods.spec.containers.volumeMounts

## cat myapp-vol-demo.yml

apiVersion: v1
kind: Pod
metadata:
  name: pod-demo
  namespace; default
  labels:
    app: myapp
    tier: frontend
  annotations:
    magedu.com/created-by: "cluster admin"
spec:
  containers:
  - name: httpd
    image: busybox:lastest
    imagePullPolicy: IfNotPresent
    command: ['/bin/httpd', '-f', '-h /data/web/html']
    ports:
    - name: http
      containerPort; 80
    volumeMounts:
    - name: html
      mountPath: /data/web/html/
  - name: busybox
    image: busybox: latest
    imagePullPolicy: IfNotPresent
    volumeMounts:
    - name: html
      mountPath: /data/
    command:
    - "/bin/sh"
    - "-c"
    - "whild true; do echo $(date) >> /data/index.html; sleep 2; done"
  volumes:
  - name: html
    emptyDir: {}

kubectl get pods
kubectl describe pods httpd

```

#### 存储卷 gitRepo
```
##

```

#### 存储卷 hostPath
```
##  cat myapp-hostPath-vol.yml
apiVersion: v1
kind: Pod
metadata:
  name: pod-vol-hostpath
  namespace: default
spec:
  containers:
  - name: myapp
    image: ikubernetes/myapp:v1
    volumeMounts:
    - name: html
      mountPath: /usr/share/nginx/html
  volumes:
  - name: html
    hostPath:
      path: /data/pod/volume2
      type: DirectoryOrCreate
      

```

#### 存储卷 nfs
```
yum install nfs-utils -y

mkdir /data/volumes
cat /etc/exports
/data/volumes  172.20.0.0/16(rw, no_root_squash)

systemctl start nfs

netstat -anltp |grep 2049

## 其他节点
yum install nfs-utils -y

mount -t nfs stor01:/data/volumes  /mnt

## cat pod-nfs.yml
apiVersioin: v1
kind: Pod
metadata:
  name: pod-vol-nfs
  namespace: default
spec:
  containers:
  - name: myapp
    image: ikubernetes/myapp:v1
    volumeMounts:
    - name: html
      mountPath: /usr/share/nginx/html/
  volumes:
  - name: html
    nfs:
      path: /data/volumes
      server: stor01.magedu.com

```

### pv pvc
```
kubectl explain pvc

cd /data/volumes
mkdir v00{1..5}
ls

vim  /etc/exports
/data/volumes/v001  172.20.0.0/16(rw, no_root_squash)
/data/volumes/v002  172.20.0.0/16(rw, no_root_squash)
/data/volumes/v003  172.20.0.0/16(rw, no_root_squash)
/data/volumes/v004  172.20.0.0/16(rw, no_root_squash)
/data/volumes/v005  172.20.0.0/16(rw, no_root_squash)

exportfs -arv
showmount -e

###
kubectl explain pv

kubectl explain pv.spec
kubectl explain pv.spec.nfs

## cat pv-demo.yml
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv001
  labels:
    name: pv001
spec:
  nfs:
    path: /data/volumes/v001
    server: stor01.magedu.com
  accessMode: ["ReadWriteMany","ReadWriteOnce"]
  capacity:
    storage: 2Gi
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv002
  labels:
    name: pv002
spec:
  nfs:
    path: /data/volumes/v002
    server: stor01.magedu.com
  accessMode: ["ReadWriteMany","ReadWriteOnce"]
  capacity:
    storage: 2Gi
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv003
  labels:
    name: pv003
spec:
  nfs:
    path: /data/volumes/v003
    server: stor01.magedu.com
  accessMode: ["ReadWriteMany","ReadWriteOnce"]
  capacity:
    storage: 3Gi

###
kubectl apply -f  pv-demo.yml

kubectl get pv


### cat pod-pvc.yml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mypvc
  namespace: default
spec:
  accessModes: ["ReadWriteMany"]
  resources:
    requests:
      storage: 6Gi
---
apiVersion: v1
kind: Pod
metadata:
  name: pod-vol-pvc
  namespace: default
spec:
  containers:
  - name: myapp
    image: ikubernetes/myapp:v1
    volumeMounts:
    - name: html
      mountPath: /usr/share/nginx/html/
  volumes:
  - name: html
    persisentVolumClaim:
      claimName: mypvc


## 
kubectl apply -f pod-pvc.yml

kubectl get pv
kubectl get pvc

```

## 13-k8s pv pvc configmap secret

```
## pod 资源容器变量的获取 configMap
kubectl explain pods.spec.containers.env.valueFrom

kubectl explain configmap

kubectl create configmap --help

kubectl create configmap nginx-config --from-literal=nginx_port=80 --from-literal=server_name=myapp.magedu.com

kubectl describe cm nginx-config


## configmap from file
vim www.conf
server {
    server_name myapp.magedu.com;
    listen 80;
    root /data/www/html/;
}


kubectl create configmap nginx-www --from-file=./www.conf

kubectl get cm

kubectl get cm nginx-www -o yaml

```

#### pod 引用configmap
```
kubectl explain pods.spec.containers.env.valueFrom.configMapKeyRef

kubectl describe cm nginx-config

## cat pod-configmap.yml
apiVersion: v1
kind: Pod
metadata:
  name: pod-cm-1
  namespace: default
  labels:
    app: myapp
    tier: frontend
  annotations:
    magedu.com/created-by: "cluster admin"
    
spec: 
  containers:
  - name: myapp
    image: ikubernetes/myapp:v1
    ports:
    - name: http
      containerPort: 80
    env:
    - name: NGINX_SERVER_PORT
      valueFrom:
        configMapKeyRef:
          name: nginx-config
          key: nginx_port
    - name: NGINX_SERVER_NAME
      valueFrom:
        configMapKeyRef:
          name: nginx-config
          key: server_name
###
kubectl apply -f pod-configmap.yml

kubectl get pods

kubectl exec -it pod-cm-1 -- printenv
##############

## cat pod-configmap-2.yml
apiVersion: v1
kind: Pod
metadata:
  name: pod-cm-2
  namespace: default
  labels:
    app: myapp
    tier: frontend
  annotations:
    magedu.com/created-by: "cluster admin"
    
spec: 
  containers:
  - name: myapp
    image: ikubernetes/myapp:v1
    ports:
    - name: http
      containerPort: 80
    volumeMounts:
    - name: nginxconf
      mountPath: /etc/nginx/config.d/
      readOnly: true
  volumes:
  - name: nginxconf
    configMap:
      name: nginx-config

###
kubectl apply -f pod-configmap-2.yml

kubectl get pods

kubectl exec -it pod-cm-2 -- /bin/sh

```

### secret
```
### kubectl create secret --help

kubectl create secret generic mysql-root-password --from-literal=password=Mypass123!@#

kubectl get secret

kubectl secret mysql-root-password

kubectl get secret mysql-root-password -o yaml


```

## 14-k8s stateful控制器



```
kubectl get sts

kubectl explain sts.spec


kubectl scale sts myapp --replicas=5
kubectl get pods -w

## patch缩容
kubectl patch sts myapp -p '{"spec":{"replicas":2}}'

## 

kubectl explain sts.spec.updateStrategy.type

## 金丝雀发布
kubectl  patch sts myapp -p '{"spec":{"updateStrategy":{"rollingUpdate":{"partition":4}}}}'

kubectl set image  sts/myapp  myapp=ikubernetes/myapp:v2


```

## 15-k8s认证和 serviceAccount
```
kubectl proxy :8080

netstat -ntlp

curl http://localhost:8080/api/v1/namespaces

kubectl get deploy -n kube-system

curl http://localhost:8080/apis/apps/v1/namespaces/kube-system/deployments/

## 集群内部。。。
kubectl get  svc
kubectl describe svc kubernetes


```






## 16-k8s RBAC

#### rolebinding
```


```

#### clusterrolebinding

```
kubectl create clusterrolebinding magedu-read-all-pods --clusterrole=cluster-reader --user=magedu --dry-run -o yaml

kubectl get clusterrole

kubectl get clusterrole admin -o yaml

kubectl create rolebinding default-ns-admin --clusterrole=admin --user=magedu 


```


## 17-k8s dashboard 认证及分级授权

```
cd /etc/kubernetes/pki

ls

openssl req -new -key dashboard.key -out dashboard.csr -subj "/O=mageud/CN=dashboard"

openssl x509 -req -in dashboard.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out dashboard.crt -days 365


kubectl create secret generic dashboard-cert -n kube-system --from-file=dashboard.crt=./dashboard.crt  --from-file=dashboard.key=./dashboard.key

kubectl get secret


```

## 18-k8s 