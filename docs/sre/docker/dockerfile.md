## dockerfile详解

```
## From：从文件开始

From scratch #从头开始制作
From centos # 使用最新系统，若没有则拉取
From centos:7.0  # 指定系统和版本

## LABEL：相当于注释
LABEL version="1.0"
LABEL author="wk"

## RUN：执行命令，每执行一条run，就多一层
RUN yum -y update && yum -y install lrzsz net-tools

## WORKDIR
WORKDIR /root   # 进入/root目录
WORKDIR /test   # 自动创建目录

WORKDIR demo
RUN pwd    # 进入/test/demo

## ADD and COPY  # 将本地文件，添加到镜像里面
## ADD 可以解压缩文件

ADD hello  /  
ADD xxx.tar.gz  /   ## 添加并解压到根目录

WORKDIR  /root/test
COPY hello  .   ## 最终结果  /root/test/hello

## ENV
ENV MYSQL_VERSION 5.6 ## 设置常量
RUN apt-get -y install mysql-server=“$MYSQL_VERSION”

## ENV

## CMD and ENTRYPOINT
#### shell格式 vs exec格式
## shell
RUN apt-get -y install lrzsz
CMD echo "hello world"
ENTRYPOINT echo "hello world"

## exec 格式
RUN ["apt-get","-y","install","lrzsz"]

区别：
1、若docker指定了其他命令 如ENTRYPOINT，CMD会被忽略
2、若定义多个CMD，只会执行最后一个
```
```
cat  
## shell格式
FROM centos
ENV name LearnDocker
CMD echo "$name"

docker build -t centos-cmd-shell

cat 
## exec格式
FROM centos
ENV name LearnDocker
CMD ["/bin/bash","-c","echo $name"]

docker build centos-cmd-exec
```

## 对容器资源限制

```
### 内存限制
docker run --memory=200M
### CPU限制
docker run --cpu-shares=2

## docker网络
### 单机
Bridge Network
Host Network

None Network
### 多机
Overlay Network
```

## docker login
```
docker image push username/myimages
## https://www.cnblogs.com/zpchcbd/p/11696697.html
```
## 配置国内镜像站

## 配置私有仓库


## 创建一个 flask应用，打包成docker images
