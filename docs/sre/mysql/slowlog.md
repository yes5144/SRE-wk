## mysql 慢日志
```
https://www.cnblogs.com/NiceTime/p/6662939.html

slow_query_log_file=/opt/mysql/data/slow.log 需根据你安装的mysql慢查询日志路径为准。

#执行时间最长的20条sql语句(默认按时长)
[root@localhost mysqllog]# mysqlsla -lt slow --sort t_sum --top 20 /opt/mysql/data/slow.log

#统计慢查询文件中所有select的慢查询sql，并显示执行时间最长的20条sql语句
[root@localhost mysqllog]# mysqlsla -lt slow -sf "+select" -top 20 /opt/mysql/data/slow.log

#统计慢查询文件中的数据库为test的所有select和update的慢查询sql，并查询次数最多的20条sql语句，并写到sql_num.log中
[root@localhost mysqllog]# mysqlsla -lt slow -sf "+select,update" -top 20 -sort c_sum -db test /opt/mysql/data/slow.log >/usr/local/src/slow_ip_db_yymm.log
mysqlsla -lt slow -sf "+select,insert,update,delete" -top 10 -sort t_sum -db tps138_com /tmp/logs/mysql-slow.log >/usr/local/src/slow_112_tps138_com_080901.log

#mysqlsla输出格式说明:
queries total: 总查询次数,unique: 去重后的sql数量
Sorted by: 输出报表的内容排序
Count : sql的执行次数及占总的slow log数量的百分比
Time : 执行时间, 包括总时间, 平均时间, 最小, 最大时间, 时间占到总慢sql时间的百分比
95% of Time : 去除最快和最慢的sql, 覆盖率占95%的sql的执行时间
Lock Time : 等待锁的时间
95% of Lock : 95%的慢sql等待锁时间
Rows sent : 结果行统计数量, 包括平均, 最小, 最大数量
Rows examined : 扫描的行数量
Database : 属于哪个数据库
Users : 哪个用户,IP,占到所有用户执行的sql百分比
Query abstract: 抽象后的sql语句
Query sample : sql样例语句

```