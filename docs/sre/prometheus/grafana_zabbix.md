## zabbix + grafana
### 每天看着zabbix展示界面是不是有点腻歪了，要不要换个高大上提升一下逼格？？？

参考链接：
```
## 分布式监控系统Zabbix--使用Grafana进行图形展示
https://www.cnblogs.com/kevingrace/p/7108060.html
## 10分钟打造炫酷的监控大屏
http://www.ywjt.org/index.php/archives/1802
## 徒手教你制作运维监控大屏
https://www.cnblogs.com/zhangs1986/p/11180694.html
## 官方地址：http://docs.grafana-zabbix.org
## 项目Demo：http://play.grafana.org/
## 项目github：https://github.com/grafana/grafana

100 - (avg(irate(node_cpu_seconds_total{instance=~"$node",mode="idle"}[5m])) * 100)

## 
CREATE USER 'exporter'@'localhost' IDENTIFIED BY 'abc123' WITH MAX_USER_CONNECTIONS 3;
GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO 'exporter'@'localhost';

cd /usr/local/mysqld_exporter
cat << EOF > .my.cnf
[client]
user=exporter
password=abc123
EOF

https://www.cnblogs.com/zengkefu/p/5658252.html

https://www.percona.com/software/database-tools/percona-monitoring-and-management
```

### 当你耐心看完如上链接，相信已经差不多OK了，下面只是我的坑友情提示一下：

#### 1，由于本人采用的是tar包解压的方式启动，所以plugins在安装目录的data/plugins/，你可以修改配置文件重新指向/var/lib/grafana/plugins/
```
## 获取可用插件列表
grafana-cli plugins list-remote
 
## 安装zabbix插件
grafana-cli plugins install alexanderzobnin-zabbix-app
 
## 安装插件完成之后重启garfana服务
service grafana-server restart

## 安装其他图形插件
# 饼图展示
grafana-cli plugins install grafana-piechart-panel
#钟表形展示
grafana-cli plugins install grafana-clock-panel
grafana-cli plugins install briangann-gauge-panel
#字符型展示
grafana-cli plugins install natel-discrete-panel
#服务器状态
grafana-cli plugins install vonage-status-panel
```
#### 2，在grafana官网找一个zabbix插件，稍稍修改应用
```
https://grafana.com/grafana/dashboards/6098

```


#### 有兴趣开发一个grafana插件
https://juejin.im/post/5addbcbd5188256715474452