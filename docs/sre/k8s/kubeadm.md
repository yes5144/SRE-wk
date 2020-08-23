## kubeadm
```
#### 作者：李振良

kubeadm是官方社区推出的一个用于快速部署kubernetes集群的工具。

这个工具能通过两条指令完成一个kubernetes集群的部署：

# 创建一个 Master 节点
kubeadm init

# 将一个 Node 节点加入到当前集群中
kubeadm join <Master节点的IP和端口 >


## 1. 安装要求

在开始之前，部署Kubernetes集群机器需要满足以下几个条件：

- 一台或多台机器，操作系统 CentOS7.x-86_x64
- 硬件配置：2GB或更多RAM，2个CPU或更多CPU，硬盘30GB或更多
- 集群中所有机器之间网络互通
- 可以访问外网，需要拉取镜像
- 禁止swap分区

## 2. 学习目标

1. 在所有节点上安装Docker和kubeadm
2. 部署Kubernetes Master
3. 部署容器网络插件
4. 部署 Kubernetes Node，将节点加入Kubernetes集群中
5. 部署Dashboard Web页面，可视化查看Kubernetes资源

## 3. 准备环境
### 同步时间
echo '*/5 * * * * ntpdate time1.aliyun.com' >> /etc/crontab

### 关闭防火墙：
systemctl stop firewalld
systemctl disable firewalld

### 关闭selinux：
sed -i 's/enforcing/disabled/' /etc/selinux/config 
setenforce 0

### 关闭swap：
swapoff -a  #临时
sed -i '/ swap /s/^\(.*\)$/#\1/g' /etc/fstab

### vim /etc/fstab  永久

### 添加主机名与IP对应关系（记得设置主机名）：
cat >> /etc/hosts <<EOF
192.168.204.171 k8s-master
192.168.204.181 k8s-node1
192.168.204.182 k8s-node2

EOF
### 将桥接的IPv4流量传递到iptables的链：
cat > /etc/sysctl.d/k8s.conf << EOF
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF
sysctl --system


## 4. 所有节点安装Docker/kubeadm/kubelet

Kubernetes默认CRI（容器运行时）为Docker，因此先安装Docker。

### 4.1 安装Docker
cd /etc/yum.repos.d/
mkdir bak_default
mv Cent* epel.repo bak_default
wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
wget -O /etc/yum.repos.d/epel.repo http://mirrors.aliyun.com/repo/epel-7.repo


wget https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo -O /etc/yum.repos.d/docker-ce.repo
yum -y install docker-ce-18.06.1.ce-3.el7
systemctl enable docker && systemctl start docker
docker --version

Docker version 18.06.1-ce, build e68fc7a


### 4.2 添加阿里云YUM软件源


cat > /etc/yum.repos.d/kubernetes.repo << EOF
[kubernetes]
name=Kubernetes
baseurl=https://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=0
repo_gpgcheck=0
gpgkey=https://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg https://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF


### 4.3 安装kubeadm，kubelet和kubectl

### 由于版本更新频繁，这里指定版本号部署：


yum install -y kubelet-1.15.0 kubeadm-1.15.0 kubectl-1.15.0
systemctl enable kubelet

mv /var/lib/etcd{,.bak1112}
## 5. 部署Kubernetes Master

在192.168.204.171 (Master)执行。

kubeadm init \
  --apiserver-advertise-address=192.168.204.171 \
  --image-repository registry.aliyuncs.com/google_containers \
  --kubernetes-version v1.15.0 \
  --service-cidr=10.1.0.0/16 \
  --pod-network-cidr=10.244.0.0/16


由于默认拉取镜像地址k8s.gcr.io国内无法访问，这里指定阿里云镜像仓库地址。

使用kubectl工具：

### bash
mkdir -p $HOME/.kube
cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
chown $(id -u):$(id -g) $HOME/.kube/config
kubectl get nodes


## 6. 安装Pod网络插件（CNI）

### 停止二进制安装的flannel
systemctl stop flanneld
systemctl disable flanneld
mv  /usr/lib/systemd/system/flanneld.service  /opt/kubernetes/

## node1 node2 master1 首先下载相关镜像如
nginx                                                             latest              5a3221f0137b        2 months ago        126MB
registry.aliyuncs.com/google_containers/kube-proxy                v1.15.0             d235b23c3570        4 months ago        82.4MB
quay.io/coreos/flannel                                            v0.11.0-amd64       ff281650a721        9 months ago        52.6MB
registry.aliyuncs.com/google_containers/etcd                      3.3.10              2c4adeb21b4f        11 months ago       258MB
registry.aliyuncs.com/google_containers/pause                     3.1                 da86e6ba6ca1        23 months ago       742kB
registry.cn-hangzhou.aliyuncs.com/google-containers/pause-amd64   3.0                 99e59f495ffa        3 years ago         747kB



kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/a70459be0084506e4ec919aa1c114638878db11b/Documentation/kube-flannel.yml

## https://www.cnblogs.com/hongdada/p/11395200.html
docker pull quay-mirror.qiniu.com/coreos/flannel:v0.11.0-amd64
docker tag quay-mirror.qiniu.com/coreos/flannel:v0.11.0-amd64 quay.io/coreos/flannel:v0.11.0-amd64
docker rmi quay-mirror.qiniu.com/coreos/flannel:v0.11.0-amd64 
## 海外服务器执行：
docker save gcr.io/kubernetes-dashboard-amd64:v1.5.1 > dashboard.tar
docker save registry.access.redhat.com/rhel7/pod-infrastructure:latest > podinfrastructure.tar

###确保能够访问到 quay.io这个registery。

### 如果下载失败，可以改成这个镜像地址：lizhenliang/flannel:v0.11.0-amd64

## 7. 加入Kubernetes Node

在192.168.204.181/182 (Node)执行。

向集群添加新节点，执行在kubeadm init输出的kubeadm join命令：

# 如果kubeadm init之后的token找不到了,可以通过sudo kubeadm token list这个命令查看.
kubeadm join 192.168.204.171:6443 --token ul6liq.bwj52p8wobelo0xu \
    --discovery-token-ca-cert-hash sha256:3a6daebcb0aac7773038762d08aebf45f8f26c9bfc2dcc1dc5f2688e5f838b10
	
## 8. 测试kubernetes集群

### 在Kubernetes集群中创建一个pod，验证是否正常运行：

kubectl create deployment nginx --image=nginx
kubectl expose deployment nginx --port=80 --type=NodePort
kubectl get pod,svc
kubectl get pods -o wide


## 访问地址：http://NodeIP:Port  
http://192.168.204.181:80  

## 9. 部署 Dashboard
docker pull sacred02/kubernetes-dashboard-amd64:v1.10.1
docker tag sacred02/kubernetes-dashboard-amd64:v1.10.1 k8s.gcr.io/kubernetes-dashboard-amd64:v1.10.1
docker rmi sacred02/kubernetes-dashboard-amd64:v1.10.1

docker save gcr.io/kubernetes-dashboard-amd64:v1.10.1 > dashboard.tar
## 各个node最好都有此镜像，否则会重新拉取
scp 
docker load < dashboard.tar

kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v1.10.1/src/deploy/recommended/kubernetes-dashboard.yaml

## 默认镜像国内无法访问，修改镜像地址为： lizhenliang/kubernetes-dashboard-amd64:v1.10.1

kubectl delete pod kubernetes-dashboard-7d75c474bb-rgh9f -n kube-system

默认Dashboard只能集群内部访问，修改Service为NodePort类型，暴露到外部：


kind: Service
apiVersion: v1
metadata:
  labels:
    k8s-app: kubernetes-dashboard
  name: kubernetes-dashboard
  namespace: kube-system
spec:
  type: NodePort
  ports:
    - port: 443
      targetPort: 8443
      nodePort: 30001
  selector:
    k8s-app: kubernetes-dashboard


kubectl apply -f kubernetes-dashboard.yaml

## 默认不解析http
访问地址：https://NodeIP:30001

创建service account并绑定默认cluster-admin管理员集群角色：


kubectl create serviceaccount dashboard-admin -n kube-system
kubectl create clusterrolebinding dashboard-admin --clusterrole=cluster-admin --serviceaccount=kube-system:dashboard-admin
kubectl describe secrets -n kube-system $(kubectl -n kube-system get secret | awk '/dashboard-admin/{print $1}')

使用输出的token登录Dashboard。


## 直播视频地址：https://ke.qq.com/course/266656


[root@k8s-master01 ~]# kubeadm init \
>   --apiserver-advertise-address=192.168.204.171 \
>   --image-repository registry.aliyuncs.com/google_containers \
>   --kubernetes-version v1.15.0 \
>   --service-cidr=10.1.0.0/16 \
>   --pod-network-cidr=10.244.0.0/16
[init] Using Kubernetes version: v1.15.0
[preflight] Running pre-flight checks
	[WARNING IsDockerSystemdCheck]: detected "cgroupfs" as the Docker cgroup driver. The recommended driver is "systemd". Please follow the guide at https://kubernetes.io/docs/setup/cri/
	[WARNING Hostname]: hostname "k8s-master01" could not be reached
	[WARNING Hostname]: hostname "k8s-master01": lookup k8s-master01 on 192.168.204.2:53: no such host
[preflight] Pulling images required for setting up a Kubernetes cluster
[preflight] This might take a minute or two, depending on the speed of your internet connection
[preflight] You can also perform this action in beforehand using 'kubeadm config images pull'
[kubelet-start] Writing kubelet environment file with flags to file "/var/lib/kubelet/kubeadm-flags.env"
[kubelet-start] Writing kubelet configuration to file "/var/lib/kubelet/config.yaml"
[kubelet-start] Activating the kubelet service
[certs] Using certificateDir folder "/etc/kubernetes/pki"
[certs] Generating "front-proxy-ca" certificate and key
[certs] Generating "front-proxy-client" certificate and key
[certs] Generating "etcd/ca" certificate and key
[certs] Generating "etcd/peer" certificate and key
[certs] etcd/peer serving cert is signed for DNS names [k8s-master01 localhost] and IPs [192.168.204.171 127.0.0.1 ::1]
[certs] Generating "apiserver-etcd-client" certificate and key
[certs] Generating "etcd/server" certificate and key
[certs] etcd/server serving cert is signed for DNS names [k8s-master01 localhost] and IPs [192.168.204.171 127.0.0.1 ::1]
[certs] Generating "etcd/healthcheck-client" certificate and key
[certs] Generating "ca" certificate and key
[certs] Generating "apiserver-kubelet-client" certificate and key
[certs] Generating "apiserver" certificate and key
[certs] apiserver serving cert is signed for DNS names [k8s-master01 kubernetes kubernetes.default kubernetes.default.svc kubernetes.default.svc.cluster.local] and IPs[10.1.0.1 192.168.204.171]
[certs] Generating "sa" key and public key
[kubeconfig] Using kubeconfig folder "/etc/kubernetes"
[kubeconfig] Writing "admin.conf" kubeconfig file
[kubeconfig] Writing "kubelet.conf" kubeconfig file
[kubeconfig] Writing "controller-manager.conf" kubeconfig file
[kubeconfig] Writing "scheduler.conf" kubeconfig file
[control-plane] Using manifest folder "/etc/kubernetes/manifests"
[control-plane] Creating static Pod manifest for "kube-apiserver"
[control-plane] Creating static Pod manifest for "kube-controller-manager"
[control-plane] Creating static Pod manifest for "kube-scheduler"
[etcd] Creating static Pod manifest for local etcd in "/etc/kubernetes/manifests"
[wait-control-plane] Waiting for the kubelet to boot up the control plane as static Pods from directory "/etc/kubernetes/manifests". This can take up to 4m0s
[apiclient] All control plane components are healthy after 20.002460 seconds
[upload-config] Storing the configuration used in ConfigMap "kubeadm-config" in the "kube-system" Namespace
[kubelet] Creating a ConfigMap "kubelet-config-1.15" in namespace kube-system with the configuration for the kubelets in the cluster
[upload-certs] Skipping phase. Please see --upload-certs
[mark-control-plane] Marking the node k8s-master01 as control-plane by adding the label "node-role.kubernetes.io/master=''"
[mark-control-plane] Marking the node k8s-master01 as control-plane by adding the taints [node-role.kubernetes.io/master:NoSchedule]
[bootstrap-token] Using token: wedg35.ikfppsqyyqrdswys
[bootstrap-token] Configuring bootstrap tokens, cluster-info ConfigMap, RBAC Roles
[bootstrap-token] configured RBAC rules to allow Node Bootstrap tokens to post CSRs in order for nodes to get long term certificate credentials
[bootstrap-token] configured RBAC rules to allow the csrapprover controller automatically approve CSRs from a Node Bootstrap Token
[bootstrap-token] configured RBAC rules to allow certificate rotation for all node client certificates in the cluster
[bootstrap-token] Creating the "cluster-info" ConfigMap in the "kube-public" namespace
[addons] Applied essential addon: CoreDNS
[addons] Applied essential addon: kube-proxy

Your Kubernetes control-plane has initialized successfully!

To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
  https://kubernetes.io/docs/concepts/cluster-administration/addons/

Then you can join any number of worker nodes by running the following on each as root:

kubeadm join 192.168.204.171:6443 --token wedg35.ikfppsqyyqrdswys \
    --discovery-token-ca-cert-hash sha256:8fa0c6c1cbee8e2c2bf17c034473ff86c3c8e899e602f051dfe9f09fd0e32908
[root@k8s-master01 ~]#

```