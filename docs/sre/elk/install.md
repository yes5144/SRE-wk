## ELK 日志监控
> Fluentd 主要负责日志采集，其他开源组件还有Filebeat、Flume、Fluent Bit等，也有一些应用采集Log4g等日志组件直接输出日志。 Kafka 主要负责数据整流合并，避免突发日志流量直接冲击Logstash，业内也有用Redis的方案。 Logstash 负责日志整理，可以完成日志过滤、日志修改等功能。 Elasticsearch 负责日志储存和日志检索，自带分布式存储，可以将采集的日志进行分片存储。为保证数据高可用，Elasticsearch引入了多副本概念，并通过Lucene实现日志的索引和查询。
```

```
## Kibana dev tools
```
## 版本号信息
GET /

## 集群状态
GET /_cluster/health?pretty

## 集群各节点
GET /_nodes/stats?pretty

## 参考索引状态
GET /_stats
GET /my_index_1/_stats

## 参考索引大小
GET /_cat/indices
GET /_cat/indices?v&s=pri.store.size
GET /_cat/indices?v&s=pri.store.size:desc

## 分片状态
GET /_cat/shards
GET /_cat/segments
GET /_cat/plugins
GET /_cat/master
GET /_cat/nodes

## 
```