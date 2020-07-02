## mysql-docker 主从

```
### 原文链接：https://blog.csdn.net/clearlxj/article/details/88313033

### 注意文中有一个笔误： /home/lxj/hedisql  /home/lxj/heidisql/

grant replication slave on *.* to 'backup'@'%' identified by '123456';

docker cp master:/etc/mysql/my.cnf /home/lxj/hedisql/data/master_my.cnf
 
#### 修改master_my.cnf，在 [mysqld] 节点下添加
[mysqld]
server-id=1
log_bin=master-bin
binlog-ignore-db=mysql
binlog-ignore-db=information_schema
binlog-ignore-db=performance_schema
binlog-ignore-db=test
innodb_flush_log_at_trx_commit=1
binlog_format=mixed


#### 修改slave1_my.cnf，在 [mysqld] 节点下添加
[mysqld]
server-id=2
relay-log-index=slave-relay-bin.index
relay-log=slave-relay-bin
relay_log_recovery=1


docker exec -it slave1 /bin/bash
mysql -uroot -p123456
MariaDB [(none)]> stop SLAVE;
MariaDB [(none)]> change master to MASTER_HOST='192.168.204.50', MASTER_USER='root', MASTER_PASSWORD='123456', MASTER_PORT=23306, MASTER_LOG_FILE='master-bin.000002', MASTER_LOG_POS=373;
MariaDB [(none)]> start SLAVE;
MariaDB [(none)]> show slave status;


### 原文链接：https://blog.csdn.net/clearlxj/article/details/88313033
```


### Docker搭建MariaDB/Mysql MHA高可用集群
```
原文链接：https://blog.csdn.net/clearlxj/article/details/88422206

## Checking if super_read_only is defined and turned on..DBD::mysql::st execute failed: Unknown system variable 'super_read_only' at /usr/share/perl5/vendor_perl/MHA/SlaveUtil.pm line 245.
报错原因：mha4mysql版本问题，
解决办法：最后将MHA的版本换成mha4mysql-0.56。

### mysql--docker化实践：https://blog.csdn.net/weixin_34290390/article/details/89123731
```