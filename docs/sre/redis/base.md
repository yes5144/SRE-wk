## redis 入门
#### 支持的数据类型：string,hash, list, set, zset
```
redis-cli  -h  -p  -a 

redis-cli shutdown nosave |save
```
#### redis 慢日志
```
redis4.0 模块系统：http://www.redismodules.com

keys * 命令会遍历所有键，所以它的时间复杂度是O(n)，当redis保存了大量键值时，线上禁止使用
dbsize  键总数量

exists
del  key
expire  key  seconds

ttl  key

type  key

单线程架构
Redis使用了单线程架构和I/O多路复用模型来实现高性能的内存数据库服务

为什么这么快？
1，纯内存访问，内存响应时长大约10纳秒；
2，非阻塞I/O，redis使用epoll作为I/O多路复用技术的实现，再加上redis自身的事件处理模型将epoll中的连接、读写、关闭都转换为事件，不在网络上浪费过多的时间；
3，单线程避免了线程切换和竞态产生的消耗；

学会使用批量操作，提高业务处理效率。

incr key
strlen  key

getset key  value
setrange key offset value
getrange key start end

典型使用场景 web--redis--mysql
推荐键命名方式: " 业务名:对象名:id:[属性]"

lpush + lpop = Stack(栈)
lpush + rpop = Queue(队列)
lpush + ltrim = Capped Collection (有限集合)
lpush + brpop = Message Queue (消息队列)
```

#### 集合
```
sadd key element
srem key element
scard key

1，给用户添加标签
sadd user:1:tags tag1 tag2 tag3
sadd user:2:tags tag2 tag4 tag3
...
2，给标签添加用户
sadd tag1:users user:1 user3
sadd tag2:users user:2 user:3 user:4
...
用户和标签的关系维护应该在一个事务内执行，防止数据不一致
```
#### 有序集合
```
zadd key  score member [score member ...]

zcard key
zsore key member
zrank key member
zrevrank key member
zrem key member

zincrby key incrment member
zrange key start end [withscroes]

redis-cli  --bigkeys 找到内存占用比较大的键值，可能是系统瓶颈
```
#### 慢查询 
```
slowlog-log-slower-than
slowlog-max-len
```
#### HyperLogLog
```
pfadd key element 
pfcount key 
```
#### 发布和订阅
```
publish  channel  message
subscribe channel [channel2 ...]
```
#### GEO（地理信息定位）
```
geoadd key longitude latitude member [longitude latitude member ...]
```
#### redis的噩梦--阻塞
```
redis-cli --bigkeys
redis-cli --stat

commandstats

netstat -s |grep overflowed
```
#### 内存管理
```
[root@HD-TXSH3-XKX-WEB01 dj_tx_update]# redis-cli   info memory
# Memory
used_memory:61891264
used_memory_human:59.02M
used_memory_rss:104157184
used_memory_rss_human:99.33M
used_memory_peak:161850848
used_memory_peak_human:154.35M
total_system_memory:16723759104
total_system_memory_human:15.58G
used_memory_lua:37888
used_memory_lua_human:37.00K
maxmemory:0
maxmemory_human:0B
maxmemory_policy:noeviction
mem_fragmentation_ratio:1.68
mem_allocator:jemalloc-4.0.3


config set maxmemory 6GB
config set maxmemory 2GB
```