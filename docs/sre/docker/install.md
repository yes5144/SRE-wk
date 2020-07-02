## docker install

```
### 准备环境
### 同步时间
echo '*/5 * * * * ntpdate time1.aliyun.com' >> /etc/crontab

### 关闭防火墙：
systemctl stop firewalld
systemctl disable firewalld

### 关闭selinux：
sed -i 's/enforcing/disabled/' /etc/selinux/config 
setenforce 0

### 4.1 安装Docker
cd /etc/yum.repos.d/
mkdir bak_default
mv Cent* epel.repo bak_default
wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
wget -O /etc/yum.repos.d/epel.repo http://mirrors.aliyun.com/repo/epel-7.repo


wget https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo -O /etc/yum.repos.d/docker-ce.repo
yum -y install docker-ce-18.09.1.ce-3.el7
systemctl enable docker && systemctl start docker
docker --version

### docker image加速
curl -sSL https://get.daocloud.io/daotools/set_mirror.sh | sh -s http://f1361db2.m.daocloud.io
systemctl restart docker.service

### docker-compose 的安装
### https://yq.aliyun.com/articles/743356

curl -L https://github.com/docker/compose/releases/download/1.24.0-rc3/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

###
yum update -y
yum install docker epel-release python-pip -y
pip install --upgrade pip
pip install docker-compose

```

### 基础命令
```
docker pull
docker search 
docker push
docker images
docker ps
docker create -it ubuntu:latest
docker start|stop|restart

docker run ubuntu /bin/echo 'Hello world'

docker run -it ubuntu:14.04  /bin/bash
docker ps
docker logs ID_or_name
## 列出所有容器的ID
docker ps -qa

docker exec -it id_or_name /bin/bash

docker rm id_or_name

## 导入容器
docker  export  -o test_name.tar   id_or_name
ls
docker  export id_or_name > test_name.tar22
ls
## 导出容器
docker  import  test_name_tar  -  test/ubuntu:v1.0

```
### docker数据管理
> 数据卷：容器内数据直接映射到本地主机环境 数据库容器：使用特定容器维护数据卷

```
## 在容器内创建一个数据卷
docker run -d -P  --name web  -v /webapp  training/webapp  python app.py

docker run  -d -P --name web  -v /src/webapp:/opt/webapp  training/webapp  python  app.py

## 数据卷容器
docker run -it -v /dbdata  --name dbdata ubuntu
docker run -it --volumes-from  dbdata  --name db1 ubuntu
docker run -it --volumes-from  dbdata  --name db2 ubuntu
## 也可以从已经挂载了容器卷的容器来挂载数据卷
docker run -d --volumes-from  db1  --name db1 training/postgres

## 数据卷容器的备份
docker run --volumes-from dbdata -v ${pwd}:/backup  --name worker ubuntu  tar cvf /backup/backup.tar /dbdata

## 数据卷容器恢复
### 首先创建一个带有数据卷的容器dbdata2
docker  run -v  /dbdata  --name dbdata2 ubuntu  /bin/bash
docker  run --volumes-from dbdata2 -v ${pwd}:/backup busybox tar xvf /backup/backup.tar

```

### 端口映射和容器互联
```
## -P Docker会随机映射一个49000-49900端口到容器开放的端口
## -p Host_port:Container_port指定端口

docker run -d -P training/webapp python app.py

docker logs -f Name_or_ID

docker port  Name_or_ID Port

docker inspect Name_or_ID

## {} makedown 默认解析了，请在使用时自行删除反斜杠
docker inspect -f "\{\{ .Name \}\}" Name_or_ID
## 容器互联 --link
docker run -d --name db training/postgres

docker run -d  -P --name web --link db:db training/webapp python app.py
## --link name:alias; 其中name是连接的容器名称，alias是这个连接的别名
docker run --rm --name web2 --link db:db training/webapp env
## 父容器是什么容器？？
## 除了环境变量之外，Docker还添加host信息到父容器的/etc/hosts文件。下面是父容器webd hosts文件
docker run -it --rm --link db:db training/webapp /bin/bash

root@lkdje323k3: # cat /etc/hosts

```