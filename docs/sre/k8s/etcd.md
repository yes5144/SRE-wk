## etcd
```sh
## 获取etcd的版本号
curl -L http://127.0.0.1:2379/version
## 设置一个key的value
curl http://127.0.0.1:2379/v2/keys/message -XPUT -d value="Hello world"
## 获取一个key的value
curl http://127.0.0.1:2379/v2/keys/message
## 改变一个key的value
curl http://127.0.0.1:2379/v2/keys/message -XPUT -d value="Hello etcd"
## 删除一个key节点
curl http://127.0.0.1:2379/v2/keys/message -XDELETE
## 使用ttl（即设置一个key的值并给这个key加一个生命周期，当超过这个时间该值没有被访问则自动被删除）
curl http://127.0.0.1:2379/v2/keys/foo -XPUT -d value=bar -d ttl=5
## 等待一个值的变化
curl http://127.0.0.1:2379/v2/keys/foo?wait=true
## 该命令调用之后会阻塞进程，直到这个值发生变化才能返回，
## 当改变一个key的值，或者删除等操作发生时，该等待就会返回
## 特别注意，在变化发生度较高的情况下，最好把这种变化结果交给另外一个线程来处理，
## 监控线程立即返回继续监控变化情况，当然etcd也提供了获取历史变化的命令，这个命令仅为丢失监听事件的情况下的补救方案。

## 创建一个目录
curl http://127.0.0.1:2379/v2/keys/dir -XPUT -d dir=true
## 列举一个目录
curl http://127.0.0.1:2379/v2/keys/dir
## 递归列举一个目录
curl http://127.0.0.1:2379/v2/keys/dir?recursive=true
到这里我们可以组合以上的诸多用法实现自己想要的功能。例如监控一个目录下的所有key的变化，包括子目录的。可以使用命令：
curl http://127.0.0.1:2379/v2/keys/dir?recursive=true&wait=true
## 删除一个目录
curl 'http://127.0.0.1:2379/v2/keys/dir?dir=true' -XDELETE


## 原文链接：https://blog.csdn.net/u010424605/article/details/44592533
```