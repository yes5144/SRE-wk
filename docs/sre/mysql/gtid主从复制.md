## 基于gtid 主从复制
```
参考链接：https://blog.csdn.net/weixin_43407305/article/details/87911235
参考链接：https://blog.csdn.net/martingpf/article/details/81115187
参考链接：https://blog.csdn.net/leshami/article/details/50630691
参考链接：https://blog.csdn.net/qq_43094192/article/details/83994952

MySQL 5.6引入的GTID(Global Transaction IDs)使得其复制功能的配置、监控及管理变得更加易于实现，且更加健壮.

MySQL 5.6中使用复制功能，其服务配置段[mysqld]中于少应该定义如下选项：
binlog-format：二进制日志的格式，有row、statement和mixed几种类型；需要注意的是：当设置隔离级别为READ-COMMITED必 须设置二进制日志格式为ROW，现在MySQL官方认为STATEMENT这个已经不再适合继续使用,但mixed类型在默认的事务隔离级别下，可能会导致主从数据不一致；
log-slave-updates、gtid-mode、enforce-gtid-consistency、report-port和report-host：用于启动GTID及满足附属的其它需求；
master-info-repository和relay-log-info-repository：启用此两项，可用于实现在崩溃时保证二进制及从服务器安全的功能；
sync-master-info：启用之可确保无信息丢失；
slave-paralles-workers：设定从服务器的SQL线程数；0表示关闭多线程复制功能；
binlog-checksum、master-verify-checksum和slave-sql-verify-checksum：启用复制有关的所有校验功能；
binlog-rows-query-log-events：启用之可用于在二进制日志记录事件相关的信息，可降低故障排除的复杂度；
log-bin：启用二进制日志，这是保证复制功能的基本前提；
server-id：同一个复制拓扑中的所有服务器的id号必须惟一；

GTID的概念：
1）全局事务标识：global transaction identifiers。
2）GTID是一个事务一一对应，并且全局唯一ID。
3）一个GTID在一个服务器上只执行一次，避免重复执行导致数据混乱或者主从不一致。
4）GTID用来代替传统复制方法，不再使用MASTER_LOG_FILE+MASTER_LOG_POS开启复制。而是使用MASTER_AUTO_POSTION=1的方式开始复制。
5）MySQL-5.6.5开始支持的，MySQL-5.6.10后开始完善。
6）在传统的slave端，binlog是不用开启的，但是在GTID中slave端的binlog是必须开启的，目的是记录执行过的GTID（强制）。

GTID组成：
GTID = source_id:transaction_id
source_id，用于鉴别原服务器，即mysql服务器唯一的的server_uuid，由于GTID会传递到slave，所以也可以理解为源ID。
transaction_id，为当前服务器上已提交事务的一个序列号，通常从1开始自增长的序列，一个数值对应一个事务。        
示例：          
3E11FA47-71CA-11E1-9E33-C80AA9429562:23
前面的一串为服务器的server_uuid，即3E11FA47-71CA-11E1-9E33-C80AA9429562，后面的23为transaction_id

GTID原理：
1、当一个事务在主库端执行并提交时，产生GTID，一同记录到binlog日志中。
2、binlog传输到slave,并存储到slave的relaylog后，读取这个GTID的这个值设置gtid_next变量，即告诉Slave，下一个要执行的GTID值。
3、sql线程从relay log中获取GTID，然后对比slave端的binlog是否有该GTID。
4、如果有记录，说明该GTID的事务已经执行，slave会忽略。
5、如果没有记录，slave就会执行该GTID事务，并记录该GTID到自身的binlog，
   在读取执行事务前会先检查其他session持有该GTID，确保不被重复执行。
6、在解析过程中会判断是否有主键，如果没有就用二级索引，如果没有就用全部扫描。

一、简单主从模式配置步骤
1、配置主从节点的服务配置文件
1.1、配置master节点：
[mysqld]
binlog-format=ROW
log-bin=master-bin
log-slave-updates=true  ###从服务器更新同步二进制日志信息，适用于高可用中，从服务器升级主服务器用
gtid-mode=on 
enforce-gtid-consistency=true
master-info-repository=TABLE
relay-log-info-repository=TABLE
sync-master-info=1
slave-parallel-workers=2
binlog-checksum=CRC32
master-verify-checksum=1
slave-sql-verify-checksum=1
binlog-rows-query-log_events=1
server-id=1
report-port=3306
port=3306
datadir=/mydata/
socket=/tmp/mysql.sock
report-host=edong1

1.2、配置slave节点：
[mysqld]
binlog-format=ROW
log-slave-updates=true
gtid-mode=on 
enforce-gtid-consistency=true
master-info-repository=TABLE
relay-log-info-repository=TABLE
sync-master-info=1
slave-parallel-workers=2
binlog-checksum=CRC32
master-verify-checksum=1
slave-sql-verify-checksum=1
binlog-rows-query-log_events=1
server-id=11
report-port=3306
port=3306
log-bin=mysql-bin.log
datadir=/mydata/
socket=/tmp/mysql.sock
report-host=edong2
slave节点配置和master节点配置一样的目的：主服务器挂了，从服务器可以快速升级为主服务器
2、创建复制用户
mysql>grant replication slave on *.* to 'repluser'@'192.168.0.%' identified by 'replpassword';
3、为备节点提供初始数据集
锁定主表，备份主节点上的数据，将其还原至从节点；如果没有启用GTID，在备份时需要在master上使用show master status命令查看二进制日志文件名称及事件位置，以便后面启动slave节点时使用。
4、启动从节点的复制线程
如果启用了GTID功能，则使用如下命令：
mysql>change master to master_host='192.168.0.202',master_user='repluser',master_password='replpassword',master_auto_position=1;

半同步复制

1、分别在主从节点上安装相关的插件
master> INSTALL PLUGIN rpl_semi_sync_master SONAME 'semisync_master.so';
slave> INSTALL PLUGIN rpl_semi_sync_slave SONAME 'semisync_slave.so';

2、启用半同步复制
在master上的配置文件中，添加
rpl_semi_sync_master_enabled=ON
在至少一个slave节点的配置文件中添加
rpl_semi_sync_slave_enabled=ON
而后重新启动mysql服务即可生效。

或者，也可以mysql服务上动态启动其相关功能：
master> SET GLOBAL rpl_semi_sync_master_enabled = ON;
slave> SET GLOBAL rpl_semi_sync_slave_enabled = ON;
slave> STOP SLAVE IO_THREAD; START SLAVE IO_THREAD;

3、确认半同步功能已经启用
master> CREATE DATABASE magedudb;
master> SHOW STATUS LIKE 'Rpl_semi_sync_master_yes_tx';

slave> SHOW DATABASES;

```
### 主从复制
```
主从复制过程存在三个线程，Master端的I/O线程，Slave的I/O线程与SQL线程。Master端需要开启binlog日志，Slave端需要开启relaylog。
1、Slave端的I/O读取master.info文件，获取binlog文件名和位置点，然后向Master端的I/O线程请求，该binlog文件名和位置点的binlog信息。
（master.info文件在配置主从复制时使用change master命令来指定生成）
2、Master端的I/O线程会根据Slave端的I/O线程请求的信息来读取Master的binlog日志信息与及读取到最新的binlog文件名和位置点一同返回给Slave的I/O线程。
3、Slave端的I/O线程会把获取到的binlog日志写入relaylog（中继日志）文件中，并且更新master.info文件信息。（把读取到Master最新的binlog日志文件名和位置点更新到master.info文件中，下一次当前位置去读取Master的binlog日志）
4、Slave端的SQL线程会定期读取relaylog，把二进制的日志解析成SQL语句，并执行这些SQL语句，同步数据到从库中

原文链接：https://blog.csdn.net/weixin_43407305/article/details/87911235
```