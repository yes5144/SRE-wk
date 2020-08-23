## k8s
> Kubernetes 是用于自动部署，扩展和管理容器化应用程序的开源系统。
一个K8S系统，通常称为一个K8S集群（Cluster）,主要包括两个部分：

- 一个Master节点（主节点）
- 一群Node节点（计算节点）

> Master节点包括: API Server、Scheduler、Controller manager、etcd。

- API Server是整个系统的对外接口，供客户端和其它组件调用，相当于"营业厅"。
- Scheduler负责对集群内部的资源进行调度，相当于"调度室"。
- Controller manager负责管理控制器，相当于"大总管"。

> Node节点包括Docker、kubelet、kube-proxy、Fluentd、kube-dns（可选），还有就是Pod。

- Pod是Kubernetes最基本的操作单元。一个Pod代表着集群中运行的一个进程，它内部封装了一个或多个紧密相关的容器。除了Pod之外，K8S还有一个Service的概念，一个Service可以看作一组提供相同服务的Pod的对外访问接口。这段不太好理解，跳过吧。
- Docker，不用说了，创建容器的。
- Kubelet，主要负责监视指派到它所在Node上的Pod，包括创建、修改、监控、删除等。
- Kube-proxy，主要负责为Pod对象提供代理。
- Fluentd，主要负责日志收集、存储与查询。

### 安装
```sh
## k8s安装入门
### 参考链接：https://www.cnblogs.com/sxdcgaq8080/p/10621437.html

## 准备工作
192.168.204.133  k8s-master01
192.168.204.134  k8s-node01
192.168.204.135  k8s-node02

### 分别设置主机名
hostnamectl --static set-hostname  k8s-master01
hostnamectl --static set-hostname  k8s-node01
hostnamectl --static set-hostname  k8s-node02


### 修改/etc/hosts

cat >>/etc/hosts <<EOF
192.168.204.133    k8s-master01
192.168.204.133    etcd
192.168.204.133    registry
192.168.204.134    k8s-node01
192.168.204.135    k8s-node02
EOF

### 关闭防火墙，SELinux
systemctl stop firewalld.service
systemctl disable firewalld.service

### 再使用查看命令查看，如果是如下效果，说明成功
firewall-cmd --state

### ntpdate
echo '*/10 * * * * root ntpdate  ntp2.aliyun.com' >> /etc/crontab

###############
一、主节点master01
主节点需要安装

etcd 存储数据中心

flannel k8s的一种网络方案

kubernetes 【包含：kube-api-server  controllerManager   Scheduler 】


## 1,etcd的安装
### 1.1 命令安装
yum install -y etcd
### 1.2 配置文件
cd  /etc/etcd
cp  etcd.conf  etcd.conf.default
cat etcd.conf
ETCD_DATA_DIR="/var/lib/etcd/default.etcd"
ETCD_LISTEN_CLIENT_URLS="http://0.0.0.0:2379,http://0.0.0.0:4001"
ETCD_NAME="master"
ETCD_ADVERTISE_CLIENT_URLS="http://etcd:2379,http://etcd:4001"

### 1.3 启动etcd服务并验证
systemctl start etcd
systemctl enable etcd
systemctl status etcd

#### 检查健康状况
etcdctl -C http://etcd:2379 cluster-health
etcdctl -C http://etcd:4001 cluster-health


## 2,flannel的安装
### 2.1 安装命令

### 2.2 配置文件 /etc/sysconfig/flanneld
FLANNEL_ETCD_ENDPOINTS="http://etcd:2379"
FLANNEL_ETCD_PREFIX="/atomic.io/network"

### 2.3 配置etcd中关于flannel的key
etcdctl mk /atomic.io/network/config '{ "Network": "10.0.0.0/16" }'

### 2.4 启动flannel服务，并设置开机自启
systemctl start flanneld.service
systemctl status flanneld.service
systemctl enable flanneld.service


## 3,安装kubernetes
### 3.1 安装命令
yum install kubernetes

### 3.2安装后，需要修改配置
### 配置修改是为了下面这些需要运行的组件
kube-api-server
kuber-scheduler
kube-controller-manager

vim /etc/kubernetes/apiserver

vim /etc/kubernetes/config

### 3.3 分别启动三个组件服务，并且设置为自启动
systemctl start kube-apiserver.service
systemctl start kube-controller-manager.service
systemctl start kube-scheduler.service

systemctl enable kube-apiserver.service
systemctl enable kube-controller-manager.service
systemctl enable kube-scheduler.service


## 4,安装docker
### 4.1 安装docker命令：
yum install  -y docker 
### 4.2 启动docker服务命令：
service docker start
### 4.3 docker加入自启动服务命令：
chkconfig docker on


################
二。子节点安装

## 1, 安装etcd


## 2, 安装flannel


## 3, 安装kubernetes


## 4, 安装docker


## 三.验证集群状态
 

1.master节点执行命令，查看端点信息
kubectl get endpoints

2.master节点执行命令，查看集群信息
kubectl cluster-info

3.master节点执行命令，获取节点信息
kubectl get nodes


## 部署app
kubectl run kubernetes-bootcamp --image=gcr.io/google-samples/kubernetes-bootcamp:v1 --port=8080
kubectl run redis --image=docker.io/redis --port=6379

export POD_NAME=$(kubectl get pods -o go-template --template '{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}')
echo Name of the Pod: $POD_NAME

curl http://localhost:8001/api/v1/namespaces/default/pods/$POD_NAME/proxy/


kubectl describe pods

kubectl logs $POD_NAME

kubectl exec $POD_NAME env

kubectl exec -it $POD_NAME bash

kubectl get deployments

kubectl scale deployments/kubernetes-bootcamp --replicas=4

kubectl get pods -o wide

kubectl describe deployments/kubernetes-bootcamp

######################
## 配置k8s repo
cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64/
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg https://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF
setenforce 0

yum install -y kubelet kubeadm kubectl
systemctl enable kubelet && systemctl start kubelet

######################
## 配置docker-ce repo
## 
# step 1: 安装必要的一些系统工具
sudo yum install -y yum-utils device-mapper-persistent-data lvm2
# Step 2: 添加软件源信息
sudo yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
# Step 3: 更新并安装 Docker-CE
sudo yum makecache fast
sudo yum -y install docker-ce
# Step 4: 开启Docker服务
sudo service docker start

注意：其他注意事项在下面的注释中
# 官方软件源默认启用了最新的软件，您可以通过编辑软件源的方式获取各个版本的软件包。例如官方并没有将测试版本的软件源置为可用，你可以通过以下方式开启。同理可以开启各种测试版本等。
# vim /etc/yum.repos.d/docker-ce.repo
# 将 [docker-ce-test] 下方的 enabled=0 修改为 enabled=1

```