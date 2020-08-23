## mysql

### 安装
```
## 安装
yum install mysql-server

## 创建数据库
create database testdb;
show databases;

## 创建表
create table table_name (
id int(11) auto_increment,
name varchar(128) default 'Unkown',
age int(3) default '18',
primary key (id)
); 

## 1.添加PRIMARY KEY（主键索引） 
mysql>ALTER TABLE `table_name` ADD PRIMARY KEY ( `column` ) 
## 2.添加UNIQUE(唯一索引) 
mysql>ALTER TABLE `table_name` ADD UNIQUE ( `column` ) 
## 3.添加INDEX(普通索引) 
mysql>ALTER TABLE `table_name` ADD INDEX index_name ( `column` ) 
## 4.添加FULLTEXT(全文索引) 
mysql>ALTER TABLE `table_name` ADD FULLTEXT ( `column` ) 
## 5.添加多列索引 
mysql>ALTER TABLE `table_name` ADD INDEX index_name ( `column1`, `column2`, `column3` )

```

### 数据备份和恢复
```
https://www.cnblogs.com/qq78292959/p/3637135.html
https://www.cnblogs.com/chenmh/p/5300370.html

5.生成新的binlog文件,-F

有时候会希望导出数据之后生成一个新的binlog文件,只需要加上-F参数即可

mysqldump -uroot -proot --databases db1 -F >/tmp/db1.sql


14.压缩备份 

## 压缩备份
mysqldump -uroot -p -P3306 -q -Q --set-gtid-purged=OFF --default-character-set=utf8 --hex-blob --skip-lock-tables --databases abc 2>/abc.err |gzip >/abc.sql.gz
## 还原
gunzip -c abc.sql.gz |mysql -uroot -p -vvv -P3306 --default-character-set=utf8 abc 1> abc.log 2>abc.err
备注： 线上环境导出和导入数据可以参考“14.压缩备份”的导出和导入参数。

其它常用选项：

复制代码
--no-create-db，  ---取消创建数据库sql(默认存在)
--no-create-info，---取消创建表sql(默认存在)
--no-data         ---不导出数据(默认导出)
--add-drop-database ---增加删除数据库sql（默认不存在）
--skip-add-drop-table  ---取消每个数据表创建之前添加drop数据表语句(默认每个表之前存在drop语句)
--skip-add-locks       ---取消在每个表导出之前增加LOCK TABLES（默认存在锁）
--skip-comments  
```
## mysql基于binlog增量恢复
```
## 基于传统binlog
mysqlbinlog 

## 基于GTID二进制
```

### kill 线程
```
## 查看正在执行的SQL线程
select *  from information_schema.PROCESSLIST where INFO LIKE 'select%ONLINE%';

## 拼接手动kill 的线程
select CONCAT("KILL ",ID,';')  from information_schema.PROCESSLIST where INFO LIKE 'select%t_log_iteminfo%';

## 拼接删除 数据库
SELECT CONCAT('drop DATABASE  ', TABLE_SCHEMA,';') from `TABLES` where TABLE_SCHEMA like 'nz%'  GROUP BY TABLE_SCHEMA;

```

### mysql 设置字符集
```
## centos/mysql-57-centos7
### 启动一个mysql57 容器
docker run -d  --name mysql57_bookshop -e MYSQL_ROOT_PASSWORD=channel -p 3306:3306 centos/mysql-57-centos7

docker inspect mysql57_bookshop
docker inspect mysql57_bookshop |grep merge

find / -name my.cnf

### 直接修改对应文件下 merged/etc/opt/rh/rh-mysql57/my.cnf，添加如下，并重启mysql容器
[client]
default-character-set=utf8

[mysql]
default-character-set=utf8

[mysqld]
init_connect='SET collation_connection = utf8_unicode_ci'
init_connect='SET NAMES utf8'
character-set-server=utf8
collation-server=utf8_unicode_ci
skip-character-set-client-handshake

### 原文链接：https://blog.csdn.net/dy_miao/article/details/91461581

## mysql:8.0
docker run --name mysql005 -p 3306:3306 -e MYSQL_ROOT_PASSWORD=888888 -idt mysql:8 --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
疑问：mysql:8.0默认就是utf8mb4 再加上参数的意义是什么？
————————————————
### 原文链接：https://blog.csdn.net/boling_cavalry/article/details/79342494

## docker 访问容器
docker exec -it 83f1aa51b96f env LANG=C.UTF-8 /bin/bash 

```

### GROUP_CONCAT 的用法
```
https://blog.csdn.net/moakun/article/details/82085968

SELECT 
    employeeNumber,
    firstName,
    lastName,
    GROUP_CONCAT(DISTINCT customername
        ORDER BY customerName)
FROM
    employees
        INNER JOIN
    customers ON customers.salesRepEmployeeNumber = employeeNumber
GROUP BY employeeNumber
ORDER BY firstName , lastname;

```

### 清空某个表
```
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE `events`;
TRUNCATE `problem`;

set FOREIGN_key_checks =1;
```