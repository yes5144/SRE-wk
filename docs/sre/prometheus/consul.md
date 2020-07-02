## Consul

### consul集群部署

```shell
## 下文是搭建一套3节点的集群，搭建过程如下： 
## 1.准备节服务器： 
- consul1：10.100.110.71 
- consul2：10.100.110.72 
- consul3：10.100.110.73 
## 2.下载consul二进制包

## 3.启动consul 
10.100.110.72执行：

consul agent -server -bootstrap-expect 3 -bind=10.100.110.71 -client=0.0.0.0 -data-dir=/data/consul -node=consul1 -ui &

- server： 以server身份启动。 
- bootstrap-expect：集群要求的最少server数量，当低于这个数量，集群即失效。 
- data-dir：data存放的目录，更多信息请参阅consul数据同步机制 
- node：节点id，在同一集群不能重复。 
- bind：监听的ip地址。 
- client 客户端的ip地址 
- ui:启动web客户端
- & ：在后台运行，此为linux脚本语法 
### 更多参数及配置说明见consul官方说明文档 https://www.consul.io/docs/agent/options.html。 


## 其他两台机器（10.100.110.72、10.100.110.73）分别执行：
consul agent -server -bootstrap-expect 3 -bind=10.100.110.72 -client=0.0.0.0 -data-dir=/data/consul -node=consul2 -ui

consul agent -server -bootstrap-expect 3 -bind=10.100.110.73 -client=0.0.0.0 -data-dir=/data/consul -node=consul3 -ui


## 分别在consul2、consul3 执行加入集群：
consul join 10.100.110.71

## 整个consul server 集群就算完成了，可以利用consul members查看集群中包含的node信息。使用consul info命令可以查看当前节点状态，包括是否在集群中，是否为leader（主）。
consul members

Node     Address            Status  Type    Build  Protocol  DC   Segment
consul1  10.100.110.71:8301  alive   server  1.2.2  2         dc1  <all>
consul2  10.100.110.72:8301  alive   server  1.2.2  2         dc1  <all>
consul3  10.100.110.73:8301  alive   server  1.2.2  2         dc1  <all>

## 可视化的服务web界面：http://10.100.110.71:8500/ui 

```