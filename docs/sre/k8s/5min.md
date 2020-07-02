## 每天5分钟

```
## pod是容器的集合，通常会将紧密相关的一组容器放到一个Pod中，同一个Pod中的所有容器共享IP地址和Port空间，也就是说它们在一个network namespace中。
## Pod是kubernetes调度的最小单位，同一Pod中的容器始终被一起调度。

kubectl get nodes
kubectl cluster-info

kubectl run kubernetes-bootcamp --image=docker.io/jocatalin/kubernetes-bootcamp:v1  --port=8080

kubectl get pods
kubectl get pod  --all-namespaces
kubectl describe pod <Pod Name> --namespaces=kube-system

kubectl expose deployment/kubernetes-bootcamp --type="NodePort"  --port 8080

kubectl get services
kubectl get deployments

## 弹性伸缩 
### scale up 3个副本
kubectl scale deployment/kubernetes-bootcamp  --replicas=3

kubectl get deployments
kubectl get pods

### scale down
kubectl scale deployment/kubernetes-bootcamp  --replicas=2

kubectl get deployments
kubectl get pods

## 滚动更新
kubectl set image deployment/kubernetes-bootcamp  kubernetes-bootcamp=jocatalin/kubernetes-bootcamp:v2

kubectl get pods
kubectl get pods
kubectl get pods
kubectl get pod -o wide

## 版本回退
kubectl rollout undo deployment/kubernetes-bootcamp

kubectl get pods


Cluster
Master
Node
Pod

Controller
Service
Namespace

Master 是Kubernetes Cluster的大脑，
运行着的 Deamon服务包括 kube-apiserver, kube-scheduler, kube-controller-manager, etcd, Pod网络（例如Flannel）

Node 是Pod运行的地方，Kubernets支持Docker，rkt等容器
运行 kubelet, kube-proxy和Pod网络（如flannel）



kubectl run httpd-app --image=httpd --replicas=2
kubectl get deployment
kubectl get pod -o wide
## 然后kubernetes 部署了 deployment httpd-app, 有两个副本的Pod，分别在k8s-node1和k8s-node2
## 详细讨论整个部署过程，
1, kubectl 发送部署请求到API Server
2, API Server 通知 Controller Manager 创建一个deployment资源
3, Scheduler 执行调度任务，将两个副本Pod分发到 k8s-node1和k8s-node2
4, k8s-node1和k8s-node2 的kubectl 在各自的节点上创建并运行Pod


## 命令 vs 配置文件
kubectl run nginx-deployment --image=nginx:1.7.9 --replicas=2

cat nginx.yml

apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 2
  template:
    metadata:
	labels:
	  app: web_server
  spec:
    containers:
	- name: nginx
	  image: nginx:1.7.9
	  
kubectl apply -f nginx.yml

kubectl create/replace/edit/patch

## Failover
### 模拟故障k8s-node2，直接关机node2
### 等一段时间，k8s 检查到 node2不可用，将node2标记为 Unknown，并在node1上创建两个Pod，维持总副本数为3，
### 当node2 恢复后，Unknown的Pod会被删除，不过已经运行的Pod不会重新调度会 node2

## 删除 nginx-deployment
kubectl delete deployment nginx-deployment


## 为Node添加label
kubectl label node node k8s-node1 disktype=ssd

kubectl get node --show-labels

## 删除label disktype
kubectl label node k8s-node1 disktype-

## DaemonSet
Deployment 部署的副本Pod会分布在各个node，每个node都可能运行几个副本
DaemonSet 的不同之处：每个node最多只能运行一个副本

DaemonSet 的典型应用场景：
1, 在集群的每个节点上运行存储 Daemon，比如 glusterd 或 ceph
2, 在每个节点上运行日志收集 Daemon，比如 flunented 或 logstash
3，在每个节点上运行监控 Daemon，比如 Prometheus Node Exporter 或 collectd

kubectl get daemonset --namespaces=kube-system

wget https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml

kubectl edit daemonset kube-proxy --namespaces=kube-system

## 部署自己的 DaemonSet--Prometheus- Node Exporter

cat node_exporter.yml

apiVersion: extensions/v1beta1
kind: DaemonSet
metadata:
  name: node-exporter-daemonset
spec:
  template:
    metadata:
	  labels:
	    app: prometheus
	spec:
	  hostNetwork: true
	  containers:
	  - name: node-exporter
	    image: prom/node-exporter
		imagePullPolicy: IfNotPresent
		command:
		- /bin/node_exporter
		- --path.procfs
		- /host/proc
		- --path.sysfs
		- /host/sys
		- --collector.filesystem.ignored-mount-points
		- ^/(sys|proc|dev|host|etc)($|/)
		volumMounts:
		- name: proc
		  mountPath: /host/proc
		- name: sys
		  mountPath: /host/sys
		- name: root
		  mountPath: /rootfs
	  volumes:
	  - name: proc
	    hostPath:
		  path: /proc
	  - name: sys
	    hostPath:
		  path: /sys
	  - name: root
	    hostPath:
		  path: /

kubectl apply -f node_exporter.yml

kubectl get pod -o wide

## Job
容器安装持续运行的时间可以分为两类：服务类容器和 工作类容器

k8s 的 Deployment、ReplicaSet、DaemonSet 都用于管理服务类容器；
对于工作类容器，我们使用job

下面是简单的Job 配置文件 myjob.yml 
cat myjob.yml

apiVersion: batch/v1
kind: Job
metadata:
  name: myjob
spec:
  template:
    metadata:
	  name: myjob
	spec:
	  containers:
	  - name: hello
	    image: busybox
		command: ["echo", "hello k8s job"]
	  restartPolicy: Never

kubectl apply -f myjob.yml
kubectl get job
kubectl get pod

kubectl get pod --show-all

kubectl logs myjob-xxx

kubectl delete -f myjob.yml

kubectl get namespace

## kube-public 部署Service Httpd2-svc
cat httpd2.yml

apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: httpd2
  namespace: kube-public
spec:
  replicas: 3
  template:
    metadata:
	  label:
	    run: httpd2
	spec: 
	  containers:
	  - name: httpd2
	    image: httpd
		ports:
		- containerPort: 80
		
---
apiVersion: v1
kind: Service
metadata:
  name: httpd2-svc
  namespace: kube-public
spec:
  selector:
    run: httpd2
  ports:
  - protocol: TCP
    port: 8080
	targetPort: 80

kubectl apply -f httpd2.yml
kubectl get service --namespace=kube-public

## 外网如何访问service

ClusterIP
NodePort
LoadBalancer

## Rolling Update

kubectl apply -f httpd.v1.yml  --record
kubectl apply -f httpd.v2.yml  --record
kubectl apply -f httpd.v3.yml  --record

kubectl rollout history deployment httpd

kubectl rollout undo deployment httpd --to-revision=1

kubectl get deployment httpd -o wide

## 数据管理
k8s volume支持多种backend 类型，包括 emptyDir, hostPath, GCE Persistent Disk, AWS Elastic Block Store, NFS, Ceph等

```

### 1，docker的安装
```
## 使用阿里云镜像加速安装下载docker-ce
## 参考链接：https://yq.aliyun.com/articles/110806

# step 1: 安装必要的一些系统工具
sudo yum install -y yum-utils device-mapper-persistent-data lvm2
# Step 2: 添加软件源信息
sudo yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
# Step 3: 更新并安装 Docker-CE
sudo yum makecache fast
sudo yum -y install docker-ce
# Step 4: 开启Docker服务
sudo service docker start

```

### 2，配置 docker 加速器
```
## 参考链接https://www.daocloud.io/mirror
## 该脚本可以将 --registry-mirror 加入到你的 Docker 配置文件 /etc/docker/daemon.json 中。适用于 Ubuntu14.04、Debian、CentOS6 、CentOS7、Fedora、Arch Linux、openSUSE Leap 42.1，其他版本可能有细微不同。更多详情请访问文档。
curl -sSL https://get.daocloud.io/daotools/set_mirror.sh | sh -s http://f1361db2.m.daocloud.io



```
### 5，k8s基础命令
```
## https://kubernetes.io/docs/tutorials/

## 
kubectl  get  nodes
kubectl  cluster-info
## deployment
kubectl  run kubernetes-bootcamp  --image=docker.io/jocatalin/kubernetes-bootcamp:v1  --port=8080
kubectl  get  nodes
## 
kubectl  expose  deployment/kubernets-bootcamp  --type="NodePort"  --port=8080
kubectl  get  services

kubectl delete service -l run=kubernetes-bootcamp
kubectl get services

## scale
kubectl  get  deployments
kubectl  scale  deployments/kubernetes-bootcamp  --replicas=3
kubectl  get  deployments
kubectl  get  nodes

kubectl  scale  deployments/kubernetes-bootcamp  --replicas=2
kubectl  get  deployments
kubectl  get  nodes

## 
kubectl  set  image  deployments/kubernetes-bootcamp  kubernetes-bootcamp=jocatalin/kubernetes-bootcamp:v2

kubectl  rollout  undo  deployments/kubernetes-bootcamp
kubectl  get  nodes

kubectl  get  namespace

```

### kubectl 管理应用程序生命周期
```
1、创建
kubectl run nginx --replicas=3 --image=nginx:1.14 --port=80
kubectl get deploy,pods

2、发布
kubectl expose deployment nginx --port=80  --type=NodePort  --target-port=80  --name=nginx-service
kubectl  get service

3、更新
kubectl  set image deployment/nginx  nginx=nginx:1.15

4、回滚
kubectl rollout history deployment/nginx
kubectl rollout undo deployment/nginx

5、删除
kubectl  delete deploy/nginx
kubectl  delete svc/nginx-service

```

### kubectl创建


```

kubectl create -f kubia-manual.yaml

kubectl get po kubia-manual -o yaml

kubectl get po kubia-manual -o json

kubectl get pods

kubectl logs kubia-manual
kubectl logs kubia-manual -c kubia

kubectl port-forward kubia-manual 9999:8080

```