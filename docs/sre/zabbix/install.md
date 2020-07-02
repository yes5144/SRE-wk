## Zabbix

### 安装zabbix-server

```shell
rpm -ivh https://repo.zabbix.com/zabbix/4.0/rhel/7/x86_64/zabbix-release-4.0-1.el7.noarch.rpm
yum install zabbix-server-mysql
yum install zabbix-web-mysql
zcat /usr/share/doc/zabbix-server-mysql*/create.sql.gz | mysql -uzabbix -p zabbix
cd /etc/zabbix/

yum install zabbix-agent

mv zabbix_agentd.conf{,.default}
grep -vE ^# zabbix_agentd.conf.default |grep - -vE ^$ >zabbix_agentd.conf

grep -vE ^# zabbix_agentd.conf.default |grep -vE ^$ >zabbix_agentd.conf
cat zabbix_agentd.conf

mv zabbix_server.conf zabbix_server.conf.default
grep -vE ^# zabbix_server.conf.default  |grep -vE ^$ >zabbix_server.conf
cat zabbix_server.conf

shell> mysql -uroot -p<password>
mysql> create database zabbix character set utf8 collate utf8_bin;
mysql> grant all privileges on zabbix.* to zabbix@localhost identified by '<password>';
mysql> quit;

```

### 安装zabbix-proxy

```shell
id zabbix
useradd  -M -s /sbin/nologin zabbix;
mkdir -p /opt/log/zabbix && chown zabbix.zabbix /opt/log/zabbix && mkdir -p /opt/run && chmod 777 /opt/run

rpm -ivh http://repo.zabbix.com/zabbix/3.2/rhel/6/x86_64/zabbix-release-3.2-1.el6.noarch.rpm
yum  makecache
yum install zabbix-proxy-mysql
rpm -ql zabbix-proxy-mysql
vim  /etc/zabbix/zabbix_proxy.conf
ps -ef |grep mysql
ifconfig

ll /usr/share/doc/zabbix-proxy-mysql-3.2.11/schema.sql.gz
##
grant all on zabbix_proxy.* to zabbix@'172.20.16.11' identified by 'zabbix';
create database zabbix_proxy;

mysql -uzabbix -h172.20.16.10 -P3306 zabbix_proxy -p

zcat /usr/share/doc/zabbix-proxy-mysql-3.2.11/schema.sql.gz |mysql -uzabbix -h172.20.16.10 -P63306 zabbix_proxy -p
grep -Ev "^$|^[#;]" /etc/zabbix/zabbix_proxy.conf
cd /etc/zabbix/
ls
mv zabbix_proxy.conf zabbix_proxy.conf.default
vim zabbix_proxy.conf
```
