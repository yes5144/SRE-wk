## 安装

### 安装
```

```

### redis.conf参数详解

```shell
## 
## http://database.51cto.com/art/201907/599174.htm
```

### redis主从

```shell
################### master down，slave up
101.11.32.116:55995> info Replication
# Replication
role:slave
master_host:101.11.32.137
master_port:55995
master_link_status:up
master_last_io_seconds_ago:2
master_sync_in_progress:0
slave_repl_offset:26807677
slave_priority:100
slave_read_only:1
connected_slaves:0
master_repl_offset:0
repl_backlog_active:0
repl_backlog_size:1048576
repl_backlog_first_byte_offset:0
repl_backlog_histlen:0
101.11.32.116:55995>


101.11.32.116:55995> info Replication
# Replication
role:slave
master_host:101.11.32.137
master_port:55995
master_link_status:down
master_last_io_seconds_ago:-1
master_sync_in_progress:0
slave_repl_offset:26807719
master_link_down_since_seconds:5
slave_priority:100
slave_read_only:1
connected_slaves:0
master_repl_offset:0
repl_backlog_active:0
repl_backlog_size:1048576
repl_backlog_first_byte_offset:0
repl_backlog_histlen:0
101.11.32.116:55995>

################### master up，slave down
101.11.32.137:55996> INFO Replication
# Replication
role:master
connected_slaves:1
slave0:ip=101.11.32.116,port=55996,state=online,offset=26805633,lag=0
master_repl_offset:26805633
repl_backlog_active:1
repl_backlog_size:1048576
repl_backlog_first_byte_offset:25757058
repl_backlog_histlen:1048576

101.11.32.137:55996> INFO Replication
# Replication
role:master
connected_slaves:0
master_repl_offset:26805843
repl_backlog_active:1
repl_backlog_size:1048576
repl_backlog_first_byte_offset:25757268
repl_backlog_histlen:1048576
101.11.32.137:55996>

```

### slowlog
```
## 查看当前slowlog-log-slower-than设置
    127.0.0.1:6379> CONFIG GET slowlog-log-slower-than
    1) "slowlog-log-slower-than"
    2) "10000"
## 设置slowlog-log-slower-than为100ms
    127.0.0.1:6379> CONFIG SET slowlog-log-slower-than 100000
    OK
## 设置slowlog-max-len为2000
    127.0.0.1:6379> CONFIG SET slowlog-max-len 2000
    OK

```

### rdb 文件分析
```
https://www.cnblogs.com/cheyunhua/p/10598181.html
https://www.cnblogs.com/cheyunhua/p/10598181.html

pip3 install rdbtools
pip3 install python-lzf

rdb -c memory dump.rdb
rdb -b 128 -c memory dump.rdb

```

### redis 内存淘汰机制
```
https://www.cnblogs.com/changbosha/p/5849982.html
Redis提供了下面几种淘汰策略供用户选择，其中默认的策略为noeviction策略：

         noeviction：当内存使用达到阈值的时候，所有引起申请内存的命令会报错。

         allkeys-lru：在主键空间中，优先移除最近未使用的key。

         volatile-lru：在设置了过期时间的键空间中，优先移除最近未使用的key。

         allkeys-random：在主键空间中，随机移除某个key。

         volatile-random：在设置了过期时间的键空间中，随机移除某个key。

         volatile-ttl：在设置了过期时间的键空间中，具有更早过期时间的key优先移除。

这里补充一下主键空间和设置了过期时间的键空间，举个例子，假设我们有一批键存储在Redis中，则有那么一个哈希表用于存储这批键及其值，如果这批键中有一部分设置了过期时间，那么这批键还会被存储到另外一个哈希表中，这个哈希表中的值对应的是键被设置的过期时间。设置了过期时间的键空间为主键空间的子集。

```

### redis-benchmark
```
redis-benchmark -h 10.1.3.189 -p 33333 -a pass -n 1000000 -r 100000000 -d 56652 --csv
redis-benchmark -n 1000000 -c 1000 -d 56652 --csv

```

### redis内存分析
```
https://database.51cto.com/art/201807/577377.htm

Redis Memory Analyzer（Redis内存分析器，RMA）
Redis Sampler（Redis采样器）
RDB Tools（RDB 工具集）
Redis-Audit（Redis-审计）
Redis Toolkit（Redis工具包）
Harvest

https://github.com/antirez/redis-sampler

pip install rdbtools python-lzf
pip3 install python-lzf
其用法非常简单：
获取前200个***键：rdb -c memory /var/redis/6379/dump.rdb –largest 200 -f memory.csv
获取所有大于128字节的键值：rdb -c memory /var/redis/6379/dump.rdb --bytes 128 -f memory.csv
获取键值的大小：redis-memory-for-key -s localhost -p 6379 -a mypassword person:1

https://github.com/snmaynard/redis-audit.git

https://github.com/alexdicianu/redis_toolkit.git
以下是一些纯命令行的简单操作：
开始监视***率：./redis-toolkit monitor
报告***率：./redis-toolkit report -name NAME -type hitrate
停止监视***率：./redis-toolkit stop
在本地系统上创建dump文件：./redis-toolkit dump
报告内存使用情况：./redis-toolkit report -type memory -name NAME


Harvest的安装和使用：
您可以通过链接：https://hub.docker.com/r/31z4/harvest/来下载它的Docker镜像。一旦镜像准备就绪，您就可以在CLI中使用“docker run --link redis:redis -it --rm 31z4/harvest redis://redis-URL”的命令来运行该工具。

```

### redis 监控指标
```
https://www.jianshu.com/p/68485d5c7fb9
https://www.cnblogs.com/nulige/p/10708900.html

```

### redis 批量设置过期
```
with redis_client.pipeline(transaction=False) as p:
	for key,val in zip(keys,values):
		p.set(key, val, 6000) #6000代表6000秒，可以自己设置
	p.execute() #批量执行

## 原文链接：https://blog.csdn.net/qq_30911665/article/details/90217013


```