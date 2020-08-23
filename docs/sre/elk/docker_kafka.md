## kafka
https://blog.csdn.net/wchyumo2009/article/details/88965053

## 准备zookeeper配置文件
```sh
mkdir -p zooConfig/zoo{1,2,3}
echo 1 > zooConfig/zoo1/myid
echo 2 > zooConfig/zoo2/myid
echo 3 > zooConfig/zoo3/myid

cat > zooConfig <<EOF
# The number of milliseconds of each tick
tickTime=2000
# The number of ticks that the initial 
# synchronization phase can take
initLimit=10
# The number of ticks that can pass between 
# sending a request and getting an acknowledgement
syncLimit=5
# the directory where the snapshot is stored.
# do not use /tmp for storage, /tmp here is just 
# example sakes.
dataDir=/data
dataLogDir=/datalog
# the port at which the clients will connect
clientPort=2181
# the maximum number of client connections.
# increase this if you need to handle more clients
#maxClientCnxns=60
#
# Be sure to read the maintenance section of the 
# administrator guide before turning on autopurge.
#
# http://zookeeper.apache.org/doc/current/zookeeperAdmin.html#sc_maintenance
#
# The number of snapshots to retain in dataDir
autopurge.snapRetainCount=3
# Purge task interval in hours
# Set to "0" to disable auto purge feature
autopurge.purgeInterval=1
server.1= zoo1:2888:3888
server.2= zoo2:2888:3888
server.3= zoo3:2888:3888
# 原文链接：https://blog.csdn.net/wchyumo2009/article/details/88965053

EOF
```

## 创建网络
```sh
docker network create --driver bridge --subnet 172.23.0.0/25 --gateway 172.23.0.1  zookeeper_network
```
## docker-compose文件

```yml
cat docker-compose.yml
version: '2'

services:

  zoo1:
    image: zookeeper:3.4.14 # 镜像
    restart: always # 重启
    container_name: zoo1
    hostname: zoo1
    ports:
    - "2181:2181"
    volumes:
    - "./zooConfig/zoo.cfg:/conf/zoo.cfg" # 配置
    - "./zookeeper1/data:/data"
    - "./zookeeper1/datalog:/datalog"
    environment:
      ZOO_MY_ID: 1 # id
      ZOO_SERVERS: server.1=zoo1:2888:3888 server.2=zoo2:2888:3888 server.3=zoo3:2888:3888
    networks:
      default:
        ipv4_address: 172.23.0.11

  zoo2:
    image: zookeeper:3.4.14
    restart: always
    container_name: zoo2
    hostname: zoo2
    ports:
    - "2182:2181"
    volumes:
    - "./zooConfig/zoo.cfg:/conf/zoo.cfg"
    - "./zookeeper2/data:/data"
    - "./zookeeper2/datalog:/datalog"
    environment:
      ZOO_MY_ID: 2
      ZOO_SERVERS: server.1=zoo1:2888:3888 server.2=zoo2:2888:3888 server.3=zoo3:2888:3888
    networks:
      default:
        ipv4_address: 172.23.0.12

  zoo3:
    image: zookeeper:3.4.14
    restart: always
    container_name: zoo3
    hostname: zoo3
    ports:
    - "2183:2181"
    volumes:
    - "./zooConfig/zoo.cfg:/conf/zoo.cfg"
    - "./zookeeper3/data:/data"
    - "./zookeeper3/datalog:/datalog"
    environment:
      ZOO_MY_ID: 3
      ZOO_SERVERS: server.1=zoo1:2888:3888 server.2=zoo2:2888:3888 server.3=zoo3:2888:3888
    networks:
      default:
        ipv4_address: 172.23.0.13

  kafka1:
    image: wurstmeister/kafka:2.12-2.0.1 # 镜像
    restart: always
    container_name: kafka1
    hostname: kafka1
    ports:
    - 9092:9092
    #- 9999:9999
    environment:
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://192.168.204.222:9092 # 暴露在外的地址
      KAFKA_ADVERTISED_HOST_NAME: kafka1 #
      KAFKA_HOST_NAME: kafka1
      KAFKA_ZOOKEEPER_CONNECT: zoo1:2181,zoo2:2181,zoo3:2181
      KAFKA_ADVERTISED_PORT: 9092 # 暴露在外的端口
      KAFKA_BROKER_ID: 0 #
      KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:9092
      #JMX_PORT: 9999 # jmx
    volumes:
    - /etc/localtime:/etc/localtime
    - "./kafka1/logs:/kafka"
    links:
    - zoo1
    - zoo2
    - zoo3
    networks:
      default:
        ipv4_address: 172.23.0.14

  kafka2:
    image: wurstmeister/kafka:2.12-2.0.1
    restart: always
    container_name: kafka2
    hostname: kafka2
    ports:
    - 9093:9092
    #- 9998:9999
    environment:
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://192.168.204.222:9093
      KAFKA_ADVERTISED_HOST_NAME: kafka2
      KAFKA_HOST_NAME: kafka2
      KAFKA_ZOOKEEPER_CONNECT: zoo1:2181,zoo2:2181,zoo3:2181
      KAFKA_ADVERTISED_PORT: 9093
      KAFKA_BROKER_ID: 1
      KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:9092
      #JMX_PORT: 9999
    volumes:
    - /etc/localtime:/etc/localtime
    - "./kafka2/logs:/kafka"
    links:
    - zoo1
    - zoo2
    - zoo3
    networks:
      default:
        ipv4_address: 172.23.0.15

  kafka3:
    image: wurstmeister/kafka:2.12-2.0.1
    restart: always
    container_name: kafka3
    hostname: kafka3
    ports:
    - 9094:9092
    #- 9997:9999
    environment:
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://192.168.204.222:9094
      KAFKA_ADVERTISED_HOST_NAME: kafka3
      KAFKA_HOST_NAME: kafka3
      KAFKA_ZOOKEEPER_CONNECT: zoo1:2181,zoo2:2181,zoo3:2181
      KAFKA_ADVERTISED_PORT: 9094
      KAFKA_BROKER_ID: 2
      KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:9092
      #JMX_PORT: 9999
    volumes:
    - /etc/localtime:/etc/localtime
    - "./kafka3/logs:/kafka"
    links:
    - zoo1
    - zoo2
    - zoo3
    networks:
      default:
        ipv4_address: 172.23.0.16

  kafka-manager:
    image: hlebalbau/kafka-manager:1.3.3.22
    restart: always
    container_name: kafka-manager
    hostname: kafka-manager
    ports:
    - 9000:9000
    links:
    - kafka1
    - kafka2
    - kafka3
    - zoo1
    - zoo2
    - zoo3
    environment:
      ZK_HOSTS: zoo1:2181,zoo2:2181,zoo3:2181
      KAFKA_BROKERS: kafka1:9092,kafka2:9093,kafka3:9094
      APPLICATION_SECRET: letmein
      KAFKA_MANAGER_AUTH_ENABLED: "true" # 开启验证
      KAFKA_MANAGER_USERNAME: "admin" # 用户名
      KAFKA_MANAGER_PASSWORD: "admin" # 密码
      KM_ARGS: -Djava.net.preferIPv4Stack=true
    networks:
      default:
        ipv4_address: 172.23.0.10

networks:
  default:
    external:
      name: zookeeper_network
#
#原文链接：https://blog.csdn.net/wchyumo2009/article/details/88965053
```

## 基本命令
```sh
docker-compose -f docker-compose.yml up -d
docker-compose -f docker-compose.yml stop
```

## 查看zookeeper集群是否正常
```sh
docker exec -it zoo1 bash
bin/zkServer.sh status # mode 为leader或follower正常

```

## 创建topic
```sh
docker exec -it kafka1 bash
kafka-topics.sh --create --zookeeper zoo1:2181 --replication-factor 1 --partitions 3 --topic test001
kafka-topics.sh --list --zookeeper zoo1:2181
kafka-topics.sh --list --zookeeper zoo2:2181
kafka-topics.sh --list --zookeeper zoo3:2181

## 生成消息
kafka-console-producer.sh --broker-list kafka1:9092,kafka2:9093,kafka3:9094 --topic test001

## 消费消息
kafka-console-consumer.sh --bootstrap-server kafka1:9092,kafka2:9093,kafka3:9094 --topic test001 --from-beginning

```

## 写入测试
https://www.cnblogs.com/xiao987334176/p/10077512.html
```shell
kafka-console-producer.sh --broker-list kafka1:9092,kafka2:9093,kafka3:9094 --topic test001

bin/kafka-producer-perf-test.sh --topic test001 --num-records 1000000 --record-size 1000  --throughput 2000 --producer-props bootstrap.servers=kafka1:9092,kafka2:9093,kafka3:9094

```