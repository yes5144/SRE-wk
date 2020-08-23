## 2020-07-11

阿良 k8s--

## 第一章：k8s特性
自我修复
弹性伸缩
自动部署和回滚
服务发现和负载均衡
机密和配置管理
存储编排
批处理

### k8s集群 master
apiserver: 集群的统一入口，各组件协调者，以RESTful API提供接口服务，所有对象资源的增删改查和监听操作都交给APIServer处理后再提交给etcd存储
controller-manager: 处理集群中常规后台任务，一个资源对应一个控制器，而controller-manager就是管理这些控制器的
scheduler: 根据调度算法为新创建的Pod选择一个Node节点，可以任意部署，可以部署在同一个节点上，也可以部署在不同的节点上
etcd: 分布式键值存储系统，用于保存集群状态数据，比如Pod，service等对象信息
### k8s集群 node
kubelet: kubelet是master在node节点上的Agent，管理本机运行容器的生命周期，比如创建容器、Pod挂载数据卷、下载secret、获取容器和节点状态等工作。kubelet将每个Pod转换为一组容器。
kube-proxy: 在node节点上实现Pod网络代理，维护网络规则和四层负载均衡工作
docker 或 rocket: 容器引擎，运行容器

### k8s核心概念
Pod: 最小部署单元，一组容器的集合，一个Pod中的容器共享网络命名空间，pod是短暂的
Controller：
    ReplicaSet: 确保预期的Pod副本数量
	Deployment: 无状态应用部署
	StatefulSet: 有状态应用部署
	DaemonSet: 确保所有Node运行同一个Pod
	Job: 一次性任务
	Cronjob: 定时任务
	更高级层次对象，部署和管理Pod
	
Service: 防止Pod失联，定义一组Pod的访问策略
Label: 标签，附加到某个资源上，用于关联对象、查询和筛选
Namespace: 命名空间，将对象逻辑上隔离

## 第二章：搭建一个完整的k8s集群（二进制方式）
### 2.1 服务器节点规划
192.168.204.201 k8s-master01  
192.168.204.101 k8s-node01  
192.168.204.102 k8s-node02  

192.168.204.202 k8s-master02  
### 2.2 系统初始化
#### 关闭防火墙
systemctl stop firewalld  
systemctl disable firewalld
#### 关闭SELinux
setenforce 0  
vim /etc/sysconfig/selinux
#### 关闭swap
swapoff -a
vim /etc/fstab
#### 添加hosts
192.168.204.201 k8s-master01  
192.168.204.101 k8s-node01  
192.168.204.102 k8s-node02  

192.168.204.202 k8s-master02

#### 同步系统时间
ntpdate time.windows.com

### 2.3 ssl证书
包含：初始化自己的ca签证机构、生成ca机构自己的证书密钥对，生成对应公司域名(或host)的证书和密钥对
#### 自签etcd ssl证书
1,etcd的ca签证机构  
2,生成etcd需要的一套证书

#### 自签apiserver ssl证书
1,apiserver的签证机构
2,apiserver的一套证书

### 2.4 etcd数据库集群部署
etcd.conf

/usr/lib/systemd/system/etcd.service

systemctl daemon-reload
systemctl start etcd
systemctl enable etcd

#### 查看etcd集群状态
/opt/apps/etcd/bin/etcdctl \
--ca-file=/opt/apps/etcd/ssl/ca.pem \
--key-file=/opt/apps/etcd/ssl/etcd-key.pem \
--cert-file=/opt/apps/etcd/ssl/etcd.pem \
--endpoints="https://192.168.204.201:2379,https://192.168.204.101:2379,https://192.168.204.102:2379" \
cluster-health

### 2.5 单master集群：master节点部署
#### 部署apiserver, controller-manager, scheduler

cat /opt/apps/k8s/cfg/token.csv  ## 格式：token,username,uid,usergroup

#### 给kubelet-bootstrap授权
kubectl create clusterrolebindingkubelet-bootstrap \
--clusterrole=system:node-bootstrapper \
--user=kubelet-bootstrap

### 2.6 单master集群：node节点部署
#### 部署docker

#### 部署kubelet, kube-proxy
kubelet.conf 基本配置文件  
kubeconfig 连接apiserver的配置文件  
yml 主要配置文件，动态更新bate  

所需证书ca.pem kube-proxy-key.pem kube-proxy.pem 

#### 在master节点 给node颁发证书
kubectl get csr ## certificatesigningrequests (aka 'csr') http://docs.kubernetes.org.cn/626.html
kubectl certificate approve node-csr-xxxxxxxxx

kubectl get node ## not ready 你需要 cni
#### node部署CNI网络(对接第三方网络接口，kubelet使用，只在node部署即可)
mkdir -p /opt/apps/cni/bin/  /etc/cni/net.d  
tar xf cni-plugins-linux-xxx.tgz -C /opt/cni/bin

#### master部署flannel网络
kubectl create -f flannel.xxx.yml  
kubectl get pods -n kube-system

kubectl describe pod kube-flannelxxx -n kube-system  
kubectl logs kube-flannelxxx -n kube-system # 授权后才有权限，k8s有多少用户角色

kubectl get node

#### 授权apiserver访问kubelet
kubectl apply -f apiserver-to-kubelet-rbac.yml

#### 创建nginx的web应用测试集群
kubectl create deployment web --image=nginx

kubectl get pods  
kubectl get pods -o wide

kubectl expose deployment web --port=80 --type=NodePort  
kubectl get pods,svc  
http://node:ip 

### 2.7 部署Web UI(Dashboard)
kubectl apply -f dashboard.yaml  
kubectl get pods -n kubernetes-dashboard  
kubectl get pods,svc -n kubernetes-dashboard  

#### 授权
kubectl apply -f dashboard-adminuser.yaml

#### 获取token
kubectl -n kubernetes-dashboard describe secret $(kubectl -n kubenetes-dashboard get  secret|grep admin-user|awk '{print $1}')

### 2.8 部署k8s内部DNS服务(coreDNS)
kubectl apply -f coreDNS.yaml  ## 其中的 ip地址与 /opt/apps/k8s/cfg/kubelet-config.yml 相对应

#### 测试dns
kubectl apply -f busybox.yaml  
kubectl get pods  
kubectl exec -it busybox bash  
 nslookup kubenetes  
 ping kubenetes
### 2.9 k8s高可用(多master)
apiserver controller-manager scheduler  
证书(etcd,k8s)

### 2.10 k8s高可用(负载均衡nginx + keepalived)
#### nginx + keepalived
yum install nginx keepalived 

chech_nginx.sh  
ip addr 

#### node替换kubelet kube-proxy中的apiserver ip 为新的的 VIP
grep oldip /opt/apps/k8s/cfg/*  
sed 's#oldip#vip#g'  *  
systemctl restart kubelet  
systemctl restart kube-proxy  

curl -k --header "Authorization: Bearer `awk '{print $1}' /opt/apps/k8s/cfg/token.csv`" https://vip:6443/version

## 第三章：kubectl命令行管理工具
### 3.1 kubectl 管理命令概要
kubectl --help  
kubectl set --help  

kubectl explain  
kubectl describe  
kubectl logs

### 3.2 kubectl 管理应用程序生命周期
#### 创建
kubectl run nginx --replicas=3 --image=nginx:1.14 --port=80  
kubectl get deploy,pods

#### 发布
kubectl expose deployment nginx --port=80 --type=NodePort --target-port --name=nginx-service  
kubectl get service

#### 更新
kubectl set image deployment/nginx nginx=nginx:1.15  

#### 回滚
kubectl rollout history deployment/nginx  
kubectl rollout undo deployment/nginx

#### 删除
kubectl delete deploy/nginx  
kubectl delete svc/nginx-service


### 3.3 kubectl 工具远程连接k8s集群
apiserver默认监听127.0.0.1:8080  
根据ca和admin证书生成对应的config，可以存在~/.kube/ 目录下


## 第四章：资源编排(yaml)
### 4.1 yaml文件格式说明
缩进表示层级关系  
使用空格缩进，不支持tab  
通常开头缩进2个空格  
字符后缩进1个空格，如冒号、逗号等  
"---" 表示yaml格式，一个文件的开始  
"#" 注释
### 4.2 yaml文件创建资源对象

### 4.3 yaml快速生成一个模板
kubectl create deployment nginx --image=nginx:1.14 -o yaml --dry-run> mynginx-deploy.yaml

kubectl get my-deploy/nginx -o=yaml --export > my-deploy.yaml

kubectl explain pods.spec.containers

## 第五章：深入理解Pod对象
### 5.1 pod基本概念
最小部署单元；  
一组容器的集合；  
一个Pod中的容器共享网络命名空间；  
pod是短暂的  
### 5.2 pod存在的意义
Pod为亲密性应用而存在  
亲密性应用场景：  
两个应用之间发生文件交互  
两个应用需要通过127.0.0.1或者socket通信  
两个应用需要发生频繁的调用  

### 5.3 pod实现机制与设计模式
网络共享  
文件共享  

### 5.4 镜像拉取策略
IfNotPresent  
Always  
Never  

### 5.5 资源限制

### 5.6 重启策略
Always  
OnFailure  
Never  
### 5.7 健康检查
1、容器层面  
k8s只能看容器是否运行正常  
例如：java堆内存溢出 running  
2、应用层面   
curl http://127.0.0.1/index.html  
3、readiness pointiness ?
### 5.8 调度策略
nodeName用于将Pod调度到指定的node  
nodeSelector用于将pod调度到匹配Label的Node上  
kubectl label nodes 192.168.204.101 team=a  
kubectl get nodes --show-labels

### 5.9 故障排查
Pending  
Running  
**Succeeded**  
Failed  
Unknown  

kubectl describe pod xxx  
kubectl logs podsname  
kubectl exec podname bash

## 第六章：最常用的控制器Deployment(无状态应用)
### 6.1 Deployment功能及应用场景
部署无状态应用  
管理pod和replicaSet  
具有上线部署、副本设定、滚动升级、回滚等功能  
提供声明式更新，例如只更新一个新的image  

应用场景：Web服务，微服务

### 6.2 使用deployment部署java应用

### 6.3 应用升级、回滚、弹性伸缩

## 第七章：深入理解Service（统一入口访问应用）
### 7.1 Service存在的意义

### 7.2 Pod与service的关系
service 只支持四层负载均衡  
四层：OSI中的传输层，TCP/UDP，四元组（源IP源端口，目标IP目标端口），只负责IP数据包转发  
七层：OSI中的应用层，HTTP，ftp，snmp协议，可以拿到这些协议头部信息，那就可以实现基于协议层面的处理  

### 7.3 Service三种常用类型
ClusterIP：集群内部使用  
NodePort：对外暴露应用  
LoadBalance：对外暴露应用，使用公有云  

#### NodePort访问流程  
user -> 域名（公网ip）-> node ip:port -> service(iptables)-> pod  
一般生产环境node都是部署在内网，那30008这个端口怎么让互联网用户访问呢？ 
1、找一台有公网IP的服务器，装一个nginx，反向代理--> node ip:port  
2、只用你们外部负载均衡器（nginx、lvs、haproxy）--> node ip:port  
上面好像要手动配置 

#### LoadBalance访问流程

user -> 域名（公网ip）-> 公有云上的负载均衡器（自动配置，专门控制器去完成）-> node ip:port

### 7.4 代理模式值iptables工作原理(默认)
iptables-save |grep kube-xxx  
kube-proxy 监听所有的iptables规则，有变化则刷新  

### 7.5 代理模式ipvs工作原理(解决iptables不能在大规模中的应用)
cat /opt/apps/k8s/cfg/kube-proxy  

--proxy-mode=ipvs  
--masquerade-all=true  

当有很多项目，很多service的时候，就会创建更多的iptables规则（更新，非增量式更新）  
并且iptables的匹配规则是从上到下逐条匹配（延时大）  

#### 救世主 ipvs  
Lvs 就是基于 ipvs内核调度模块实现的负载均衡  

阿里的slb，基于lvs实现四层负载均衡（lvs只支持4层）  

ip addr |grep kube-ipvs
### 7.6 iptables和ipvs小结
**iptables**  
灵活、功能强大（可以在数据包不同阶段对包进行操作）  
规则遍历匹配和更新，呈线性时延  

**ipvs**  
工作在内核态，有更好的性能  
调度算法丰富：rr, wrr, lc, wlc, ip hash...
### 7.7 集群内部dns服务（coredns）
coredns.yaml 中两次与kubelet.config 中相对应

cat /opt/apps/k8s/cfg/kubelet.config  
clusterDNS

clusterDomain: cluster.local.

## 第八章：Ingress（对外暴露你的应用）
### 8.1 ingress为弥补Nodeport不足而生
ingress解决了什么问题？
### 8.2 ingress Controller

### 8.3 ingress http

### 8.4 ingress https

### 8.5 ingress工作原理和高可用方案
``` sh
kubectl exec -it nginx-ingress-controller-xxxx bash -n ingress-nginx

cat /etc/nginx/nginx.conf

## 内部一堆 lua
upstream upstream_balancer{
	server 0.0.0.1:1234; # placeholder
	balancer_by_lua_block{
		tcp_udp_balancer.balance()
	}
}
```
user -> lb -> ingress controller(pod) ->[service] ->pod

lb -> nodeport(30001,30002)

lb -> ingress controller(80,443)

解决高可用：  
 1, 扩容副本数  
    提高并发能力  
    尽量让多个节点提供服务  
 2, 把控制器固定到几台节点  
    a, daemonSet(与nodeport一样)  
	b, nodeselector + 污点  
	 污点，即使加污点容忍也不会完全分配到专门几个节点  

## 第九章：Volume（数据卷，持久数据卷）
### 9.1 emptyDir(容器数据共享)
```yaml
  volumes:
  - name: data
    emptyDir: {}
```	
### 9.2 hostPath(访问宿主机数据)
挂载Node文件系统上文件或者目录到pod中的容器。  
应用场景：pod容器需要访问宿主机文件

```yaml
  volumes:
  - name: data
    hostPath:
	  path: /tmp
      type: Directory
```

### 9.3 NFS(网络存储)
```yaml
yum install -y nfs-utils ## server
cat  /etc/exports
/data/nfs *(rw,no_root_squash)

systemctl start nfs
```
```yaml
    volumes:
	- name: wwwroot
	  nfs:
	    server: 192.168.204.222
		path: /data/nfs

```
kubectl get ep

## 第十章：项目在k8s平台部署案例

### 10.1 部署前准备工作及注意事项
一、部署的项目情况  
1, 业务架构及服务（dubbo, spring cloud）  
2, 第三方服务，例如mysql， redis， zookeeper, eruka, mq  
3, 服务之间怎么通信？  
4，资源消耗：硬件资源，带宽  

二、部署项目时用到的k8s资源  
1,使用namespace进行不同项目隔离，或者隔离不同环境(test, prod, dev)  
2,无状态应用(deployment)  
3,有状态应用(statefulset, pv, pvc)  
4,暴露外部访问(service, ingress)  
5,secret, configmap  

三、项目基础镜像

四、编排部署
1, 项目构建（java），ci/cd环境这个阶段自动完成（代码拉取 - 代码编译构建 - 镜像打包 - 推送镜像仓库）

五、工作流程
kubectl - yaml - 镜像仓库拉取镜像 - Service(集群内部访问)/ ingress(暴露给外部用户)
### 10.2 部署java项目(上)
部署harbor  
daemon.json添加自建仓库可信任  

创建java + maven环境  
vim /etc/profile  
cd $Project_dir && /usr/local/maven/bin/mvn clean package  

```sh
## 创建命名空间

## 创建secret
kubectl create secret docker-registry registry-pull-secret --docker-username=admin --docker-password=Harbor12345 --docker-email=admin@qq.com --docker-server=192.168.204.61 -n test
## get 镜像

## 
kubectl get pods, svc, ing -n test
## 连接mysql
jdbc:mysql://podname.serviceName.namespace:3306/test?characterEncoding=utf-8
```

### 10.3 部署java项目(下)

### 10.4 部署php项目


## 第十一章：k8s集群资源监控
### 11.1 k8s监控指标和监控方案

### 11.2 监控系统部署(cAdvisor + InfluxDB + Grafana)

## 第十二章：使用ELK 收集k8s平台日志
### 12.1 容器本身特性给收集带来的问题

### 12.2 收集哪些日志？主流日志方案有哪些？

### 12.3 容器中日志怎么收集？

### 12.4 部署elk stack日志平台

### 12.5 收集所有容器标准输出的日志

### 12.6 收集容器中落盘的日志文件