> 高可用性（避免单点故障）
> 负载均衡（充分利用服务器性能）
> 弹性伸缩（易于扩容和缩容）

> 确立自己原则的“五步原则”
>
> 1、目标：我要什么？
> 2、计划：我该怎么做？
> 3、行动：我碰到了什么问题？
> 4、反思：什么原因？
> 5、改进：形成原则

# 一、Linux

## 1.1 Hello World

```shell
echo 'hello world'
echo 'hello shell'
```

## 1.2 常用命令组合

```sh
find . -name '*.log' -mtime +7 -type f 

find . -maxdepth 1 -name '*.old' -type d 
find . -maxdepth 3 -name '*.old' -type d |xargs echo

Now_Time=`(date +%Y%m%d%H%M%S)`
NowStamp=`(date +%s)`

sed  -i.bak  '/swap/s/^\(.*\)$/#\1/g' /etc/fstab
## (1.0.21.62.)(20200916114736) 分组替换
sed -i "s/\(\([0-9]\{1,\}\.\)\{3,\}\)\([0-9]\{1,\}\)/\1${Now_Time}/g" /opt/www/index*.html
sed ':a;N;$!ba;s/nz_shouq_accountdb/nz_shouq_main/2'  ## 末尾2表示只替换第二个
ps -ef|grep redis|grep -v grep |awk -F: '{print $NF}'


## 打印第10列等于403的行
awk '$10==403 {print $0}'   /opt/log/nginx/www.xxx.com.log
awk '{a[$1]++}END{for(v in a)print v,a[v]}' access.log
# https://www.cnblogs.com/linuxprobe/p/11387906.html


## grep -r 递归； -I 排除二进制文件； -n 行号； -H 文件名； --exclude 排除匹配文件； --exclude-dir 排除匹配目录
grep -rInH --exclude=*.log --exclude-dir=py3*  '\/opt\/' *
grep 'skill  Id : 999' error.log* -C10 | more


tcpdump -i eth0 -s 0 -l -w - -w aa.pcap


netstat -n | awk '/^tcp/ {++S[$NF]} END {for(a in S) print a, S[a]}'
netstat -anpo|more
netstat -anpo|grep ESTABLISHED|awk '{$3!=0}{print $0}'
netstat -anpo|grep ESTABLISHED|awk '$3!=0{print $0}'

cat /proc/`pidof mysqld`/limits

sudo du -s * | sort -nr | head      # 显示前10个占用空间最大的文件或目录
sudo du --max-depth=1               # linux查找占空间最大的文件与目录  
sudo find ./ -size -2048c -type f   # 查找小于2K的文件，- 表示小于

## 

pidstat -u -p  pidnum 3  ## 某pid 3秒内CPU使用情况

-u -r 内存  -d 磁盘

iostat  -d  2 3

## ip 按照数字排序
sort -t'.' -k1,1n -k2,2n -k3,3n -k4,4n ip.txt


```



## 1.3 系统安全和优化

```sh
#!/bin/bash
#
## 1 close selinux
setenforce 0
sed -i /SELINUX/s/enforcing/disabled/g /etc/selinux/config

## 2 close iptables firewalld
systemctl stop iptables.service
systemctl stop firewalld.service

## 3 中文支持
cat  /etc/sysconfig/i18n
echo  'LANG="zh_CN.UTF-8"'   > /etc/sysconfig/i18n
echo  'LC_ALL="zh_CN.UTF-8"' >> /etc/sysconfig/i18n
source  /etc/sysconfig/i18n

 #######
cat   /etc/locale.conf
echo  'LANG="zh_CN.UTF-8"' > /etc/locale.conf
source /etc/locale.conf

 #### 设置timezone的时区
 ##sudo timedatectl set-timezone 'Asia/Shanghai'
 ## 或者
echo "Asia/Shanghai" > /etc/timezone

## 4 设置时间
rm -rf /etc/localtime
ln -s /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

## 5 sync time
ntpdate times.aliyun.com
echo '# time sync to aliyun 2017-08-21' >> /var/spool/cron/root
echo '*/5 * * * * /usr/sbin/ntpdate times.aliyun.com >/dev/null 2>&1' >>/var/spool/cron/root

## 6 base.repo epel.repo docker.repo
yum install -y sysstat tree net-tools wget curl vim lrzsz zip unzip python-pip python-devel python36 python36-devel python36-pip bash-completion

mkdir  /etc/yum.repos.d/default
mv /etc/yum.repos.d/*.repo /etc/yum.repos.d/default/

curl -o /etc/yum.repos.d/CentOS-Base.repo https://mirrors.aliyun.com/repo/Centos-7.repo
wget -O /etc/yum.repos.d/epel.repo http://mirrors.aliyun.com/repo/epel-7.repo

yum install -y yum-utils device-mapper-persistent-data lvm2
yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

## 7 添加 www mysql (no home)
useradd myadmin && echo 'yourpasswd123#@!' |passwd myadmin --stdin
useradd www -M -s /sbin/nologin 
useradd mysql -M -s /sbin/nologin

## 8 sshd 配置优化
\cp /etc/ssh/sshd_config{,.bak}
sed -i 's@#UseDNS yes@UseDNS no@g;s@^GSSAPIAuthentication yes@GSSAPIAuthentication no@g' /etc/ssh/sshd_config
### 禁用root远程，添加myadmin sudoers
#sed -i 's@#PermitRootLogin yes@PermitRootLogin no@g' /etc/ssh/sshd_config
#sed -i 's@#Port 22@Port 52222@g' /etc/ssh/sshd_config
/etc/init.d/sshd reload

## 9 系统参数优化
　　#1. 计算 fdmax = 物理内存大小(m为单位) / 4 * 256  假设内存为8G,fdmax=524288
　　#2. 执行命令: echo fs.file-max=524288 >> /etc/sysctl.conf
　　#3. 执行命令: sysctl -p 
　　#4. 执行命令: echo  * soft nofile  524286 >> /etc/security/limits.conf
　　#5. 执行命令: echo  * hard nofile 524287 >> /etc/security/limits.conf
echo fs.file-max=524288 >> /etc/sysctl.conf
sysctl -p 

echo  '* soft nofile  524286' >> /etc/security/limits.conf
echo  '* hard nofile  524287' >> /etc/security/limits.conf

# /etc/supervisord.conf
# minfds=1048576

cat >> /etc/sysctl.conf << EOF
# https://www.cnblogs.com/kgdxpr/p/3342102.html

# source configuration
# /sbin/sysctl -p
#######禁用ipv6#######
# 禁用整个系统所有接口的IPv6
net.ipv6.conf.all.disable_ipv6 = 1
# 禁用某一个指定接口的IPv6(例如：eth0, lo)
net.ipv6.conf.lo.disable_ipv6 = 1
net.ipv6.conf.eth0.disable_ipv6 = 1

#######################
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_tw_recycle = 1
net.ipv4.ip_local_port_range = 1024 65000
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.tcp_max_tw_buckets = 5000
net.ipv4.tcp_max_syn_backlog = 65536
net.core.netdev_max_backlog =  32768
net.core.somaxconn = 32768
net.core.wmem_default = 8388608
net.core.rmem_default = 8388608
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_timestamps = 0
net.ipv4.tcp_synack_retries = 2
net.ipv4.tcp_syn_retries = 2
net.ipv4.tcp_mem = 94500000 915000000 927000000
net.ipv4.tcp_max_orphans = 3276800

kernel.sysrq = 0
kernel.core_uses_pid = 1
kernel.msgmnb = 65536
kernel.msgmax = 65536
kernel.shmmax = 68719476736
kernel.shmall = 4294967296
vm.swappiness=10
EOF

sysctl -p 

## 10 安全问题  把暴力登录的ip 追加到/etc/hosts.deny
cat >/bin/ssh_scan.sh <<EOF
#! /bin/bash
cat /var/log/secure|awk '/Failed/{print $(NF-3)}'|sort|uniq -c|awk '{print $2"="$1;}' > /tmp/black.txt
DEFINE="10"
for i in `cat  /tmp/black.txt`
do
    IP=`echo $i |awk -F= '{print $1}'`
    NUM=`echo $i|awk -F= '{print $2}'`
    if [ $NUM -gt $DEFINE ];then
         grep $IP /etc/hosts.deny > /dev/null
         if [ $? -gt 0 ];then
            echo "sshd:$IP" >> /etc/hosts.deny
         fi
    fi
done
EOF
## 加入定时任务
echo '####SSH_Failed_Access_Scan####' >>/etc/crontab
echo '*/1 * * * * root sh /bin/ssh_scan.sh' >> /etc/crontab

## 11 重要文件加锁，禁止修改如 /etc/passwd /etc/shadow /etc/sudoers /root/.ssh/authorized_keys
chattr +i  /etc/passwd /etc/group /etc/shadow /etc/sudoers /root/.ssh/authorized_keys
# lsattr 
# chattr -i file
# chattr -R +i dir

## 12 预留端口需要吗？
echo "39003-39004"  > /proc/sys/net/ipv4/ip_local_reserved_ports
```

### 1.3.1 防火墙iptables

```sh
cat >/bin/iptables.sh <<EOF
#!/bin/bash
iptables -F
iptables -t nat -F

#### Below are the basal iptables config, normally need not be modified #######
iptables -A INPUT -s 127.0.0.1 -d 127.0.0.1 -j ACCEPT
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A INPUT -p icmp --icmp-type echo-reply -j ACCEPT
iptables -A INPUT -p icmp --icmp-type echo-request -j ACCEPT
iptables -A INPUT -p udp --source-port 53 -j ACCEPT
iptables -A INPUT -p tcp --dport 62222 -j ACCEPT
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

##### Below are the Appalication related iptables config #######
iptables -A INPUT -s 10.0.5.0/24 -j ACCEPT

iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

iptables -A INPUT -j DROP
iptables -A FORWARD -j DROP
EOF

systemctl enable iptables.service
systemctl restart iptables.service
sh  /bin/iptables.sh

echo 'sh /bin/iptables.sh' >> /etc/rc.local


####
## iptables防火墙

iptables最常用的规则示例
https://www.cnblogs.com/EasonJim/p/8339162.html

### 1、删除已有规则
iptables -F
iptables –flush

### 2、设置链的默认策略
iptables -P INPUT DROP
iptables -P FORWARD DROP
##### iptables -P OUTPUT DROP ## 一般不对出站的数据包做限制


### 3、丢弃来自IP地址x.x.x.x的包
iptables -A INPUT -s x.x.x.x -j DROP

#### 3.1、阻止来自IP地址x.x.x.x eth0 tcp的包
iptables -A INPUT -i eth0 -s x.x.x.x -j DROP
iptables -A INPUT -i eth0 -p tcp -s x.x.x.x -j DROP

### 4、允许所有来自外部的SSH连接请求，即只允许进入eth0接口，并且目标端口为22的数据包
iptables -A INPUT -i eth0 -p tcp --dport 22 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -o eth0 -p tcp --sport 22 -m state --state ESTABLISHED -j ACCEPT

### 5、仅允许来自于192.168.100.0/24域的用户的ssh连接请求
iptables -A INPUT -i eth0 -p tcp -s 192.168.100.0/24 --dport 22 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -o eth0 -p tcp --sport 22 -m state --state ESTABLISHED -j ACCEPT

### 6、允许所有来自web - http的连接请求
iptables -A INPUT -i eth0 -p tcp --dport 80 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -o eth0 -p tcp --sport 80 -m state --state ESTABLISHED -j ACCEPT

iptables -A INPUT -i eth0 -p tcp --dport 443 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -o eth0 -p tcp --sport 443 -m state --state ESTABLISHED -j ACCEPT

### 7、使用multiport 将多个规则结合在一起（允许所有ssh,http,https的流量访问）
iptables -A INPUT -i eth0 -p tcp -m multiport --dports 22,80,443 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -o eth0 -p tcp -m multiport --sports 22,80,443 -m state --state ESTABLISHED -j ACCEPT

### 8、负载平衡传入的网络流量
iptables -A PREROUTING -i eth0 -p tcp --dport 443 -m state --state NEW -m nth --counter 0 --every 3 --packet 0 -j DNAT --to-destination 192.168.1.101:443
iptables -A PREROUTING -i eth0 -p tcp --dport 443 -m state --state NEW -m nth --counter 0 --every 3 --packet 1 -j DNAT --to-destination 192.168.1.102:443
iptables -A PREROUTING -i eth0 -p tcp --dport 443 -m state --state NEW -m nth --counter 0 --every 3 --packet 2 -j DNAT --to-destination 192.168.1.103:443


### 9、允许外部主机ping内部主机
iptables -A INPUT -p icmp --icmp-type echo-request -j ACCEPT
iptables -A OUTPUT -p icmp --icmp-type echo-reply -j ACCEPT

### 10、允许来自网络192.168.101.0/24的rsync连接请求
iptables -A INPUT -i eth0 -p tcp -s 192.168.101.0/24 --dport 873 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -o eth0 -p tcp --sport 873 -m state --state ESTABLISHED -j ACCEPT

### 11、MySQL数据库与web服务跑在同一台服务器上。有时候我们仅希望DBA和开发人员从内部网络（192.168.100.0/24）直接登录数据库，可尝试以下命令：
iptables -A INPUT -i eth0 -p tcp -s 192.168.100.0/24 --dport 3306 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -o eth0 -p tcp --sport 3306 -m state --state ESTABLISHED -j ACCEPT

### 12、将来自422端口的流量全部转到22端口。  这意味着我们既能通过422端口又能通过22端口进行ssh连接。启用DNAT转发。

##### 系统开启转发功能
echo 1 > /proc/sys/net/ipv4/ip_forward
iptables -t nat -A PREROUTING -p tcp -d 192.168.102.37 --dport 422 -j DNAT --to 192.168.102.37:22

#####除此之外，还需要允许连接到422端口的请求 
iptables -A INPUT -i eth0 -p tcp --dport 422 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -o eth0 -p tcp --sport 422 -m state --state ESTABLISHED -j ACCEPT



iptables 四表五链
https://www.cnblogs.com/zhujingzhi/p/9706664.html

```

### 1.3.2 防火墙firewired

```sh
firewall-cmd --list-all
firewall-cmd --add-ports=9000/tcp --permernent
firewall-cmd --reload
```



### 1.3.3 cc 和ddos

```sh
#!/bin/bash
#
# date: 2018-04-12
# author: channel
#
if [[ -z $1 ]]; then
	num=50
else
	num=$1
fi

# cd where is the shell
cd $(cd $(dirname $BASH_SOURCE) && pwd)

function check(){

	iplist=`netstat -an |grep ^tcp.*.80|egrep -v 'LISTEN|127.0.0.1'|awk -F "[ ]+|[:]" '{print $4}'`
	if [[ ! -z $iplist ]];
	then
		> ./iplist/black_ip.txt
		for black_ip in $iplist
		do
			# exclude_ip=`echo $black_ip |awk -F "." '{print "$1"."$2"."$3"}'`
			# grep -q $excude_ip ./white_ip.txt
			grep -q $black_ip ./white_ip.txt
			if [[ $? -eq 0 ]]; then
				echo "$black_ip (white_ip)" >>./black_ip.txt
			else
				echo $black_ip >> ./black_ip.txt
				iptables -nL |grep $black_ip || (iptables -I INPUT -s £$black_ip -j DROP & echo "$black_ip exist" )
			fi
		done
		if [[ `cat ./sendmail` == 1 ]];then sendmsg;fi
	fi

}

function sendmsg(){

	netstat -nutlp |grep "sendmail" >/dev/null 2>&1 || /etc/init.d/sendmail start >/dev/null ;
	echo -e "From: 1006793841@qq.com\nTo:22222222222@qq.com\nSubject:Someone Attacking you system"
	cat ./black_ip.txt >>./message
	/usr/sbin/sendmail -f sendaddr@qq.com -t recieve_add@qq.com -i <./message
	>./sendmail

}


while true
do
	check
	sleep 10
done
```



```sh
#!/bin/bash
#
# date: 2018-4-11
# author: channel
#
FilePath="access.log"
awk '{print $1}' $FilePath |sort -rn |uniq -c >ip_count.log
cat ip_count.log |while read text
do
	echo $text
	count= echo $text |awk '{print $1}'
	ip= echo $test |awk '{print $2}'
	if [ $count -gt 20 ]
	then
		if iptables -L |grep $ip
		then
			echo "ip address exists iptables, no add again"
		else
			echo "add $ip address in iptables"
			iptables -A INPUT -s $ip -j DROP && echo $ip >> ip_drop.log
			/etc/init.d/iptables save &> /dev/null
			/etc/init.d/iptables restart &>/dev/null
		fi
	else
		echo "no ip will be add iptables"
	fi
done

# remember to create a crontab task for this shell
```



# 二、Nginx



## 2.22 配置

```ini

####### 负载均衡配置：
upstream myapp {
    server 192.168.0.111:8080; # 应用服务器1
    server 192.168.0.112:8080; # 应用服务器2
}
server {
    listen 80;
    location / {
        proxy_pass http://myweb;
    }
}

###### 反向代理
server {
    listen 80;
    location / {
        proxy_pass http://192.168.0.112:8080; # 应用服务器HTTP地址
    }
}

###### 虚拟主机
server {
    listen 80 default_server;
    server_name _;
    return 444; # 过滤其他域名的请求，返回444状态码
}
server {
    listen 80;
    server_name www.aaa.com; # www.aaa.com域名
    location / {
        proxy_pass http://localhost:8080; # 对应端口号8080
    }
}
server {
    listen 80;
    server_name www.bbb.com; # www.bbb.com域名
    location / {
        proxy_pass http://localhost:8081; # 对应端口号8081
    }
}

##### 另外，server_name配置还可以过滤有人恶意将某些域名指向你的主机服务器。

#### FastCGI
#### Nginx本身不支持PHP等语言，但是它可以通过FastCGI来将请求扔给某些语言或框架处理（例如PHP、Python、Perl）。
server {
    listen 80;
    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME /PHP文件路径$fastcgi_script_name; # PHP文件路径
        fastcgi_pass 127.0.0.1:9000; # PHP-FPM地址和端口号
        # 另一种方式：fastcgi_pass unix:/var/run/php5-fpm.sock;
    }
}

## rewirte
server {
        listen 80;
        server_name monitor.xxxx.com;
        rewrite ^(.*)$ https://${server_name}$1 permanent;
}

server {
        server_name monitor.xxxx.com ;
        listen 443 ssl;
        ssl_certificate  /usr/local/nginx/conf/888__xxxx.com.pem;
        ssl_certificate_key  /usr/local/nginx/conf/888__xxxx.com.key;
        index  index.html index.htm;
        root  /opt/www/xxxx_web/dist;

        location ~ .*\.(jpg|png|jpeg)$ {
            expires      30d;
        }

        location / {
            try_files $uri $uri/ /index.html;
            expires      7d;
        }

        access_log  /opt/log/nginx/monitor.xxxx.com.log;
}

## 防盗链 在nginx的conf中配置
location ~.*\.(gif|jpg|png|flv|swf|rar|zip)$
{
    valid_referers none blocked zi.com *.zi.com;
    if($invalid_referer)
    {
        #return 403;
        rewrite ^/ http://www.zi.com/403.jpg;
    }    
}
```

## 2.3 vhost

## 2.4 动态负载均衡

```ini

```



## 2.5 http 登录验证

```ini
# https://www.cnblogs.com/clsn/p/9950892.html
[root@clsn nginx]# yum install httpd-tools -y
[root@clsn nginx]# htpasswd  -c /usr/local/awstats/wwwroot/nmtui.passwd nmtui
New password:
Re-type new password:
Adding password for user nmtui
[root@clsn nginx]# chown www.www  /usr/local/awstats/wwwroot/nmtui.passwd
[root@clsn nginx]# chmod 600  /usr/local/awstats/wwwroot/nmtui.passwd

[root@clsn nginx]# vim  awstats.nmtui.com.conf
server
{
    listen 80;
    server_name awstats.nmtui.com;
    index awstats.nmtui.com.html;
    root /www/wwwroot/awstats/;
    auth_basic "clsn training";
    auth_basic_user_file /usr/local/awstats/wwwroot/nmtui.passwd;
    access_log  /www/wwwlogs/301-clsn.io.log;
    error_log  /www/wwwlogs/301-clsn.io-error.log;
}
[root@clsn nginx]# /etc/init.d/nginx  reload
```

## 2.9 nginx 调优

```ini
Nginx调优
https://www.cnblogs.com/zhichaoma/p/7989655.html
    1.隐藏 Nginx 版本号
    2.隐藏 Nginx 版本号和软件名
    3.更改 Nginx 服务的默认用户
    4.优化 Nginx worker 进程数
    5.绑定 Nginx 进程到不同的 CPU 上
    6.优化 Nginx 处理事件模型
    7.优化 Nginx 单个进程允许的最大连接数
    8.优化 Nginx worker 进程最大打开文件数
    9.优化服务器域名的散列表大小
    10.开启高效文件传输模式
    11.优化 Nginx 连接超时时间
    12.限制上传文件的大小
    13.FastCGI 相关参数调优
    14.配置 Nginx gzip 压缩
    15.配置 Nginx expires 缓存
    16.优化 Nginx日志(日志切割)
    17.优化 Nginx 站点目录
    18.配置 Nginx 防盗链
    19.配置 Nginx 错误页面优雅显示
    20.优化 Nginx 文件权限
    21.Nginx 防爬虫优化
    22.控制 Nginx 并发连接数
    23.集群代理优化

Nginx 性能调优
https://www.jianshu.com/p/024b33d1a1a1

```



# 三、MySQL

## 3.1 基础操作命令

### 3.1.1 添加索引

```sql
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

### 3.1.2 复制表到新表

```sql
方法一：
拷贝表1的全部数据到表2
INSERT INTO table2 SELECT * FROM table1 

拷贝第n条
INSERT INTO table2 SELECT * FROM table1  WHERE id=5

拷贝指定字段
INSERT INTO table2 ( name , price ) SELECT name , price  FROM table1  WHERE id=5

方法二：
创建表3， 同时拷贝表1的数据和结构到表3
CREATE TABLE table3 SELECT * FROM table

方法三：
创建表4，只拷贝表1的结构到表4，不拷贝数据
CREATE TABLE table4 LIKE table

版权声明：本文为CSDN博主「一筐大白菜啊」的原创文章，遵循 CC 4.0 BY-SA 版权协议，转载请附上原文出处链接及本声明。
原文链接：https://blog.csdn.net/sphinx1122/article/details/84402854
```

### 3.1.3 部分配置文件参考

```ini
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

#skip-grant-tables
### MySQL5.6
#UPDATE mysql.user SET Password = password('123456') WHERE User = 'root' ; 
### MySQL5.7
#update mysql.user set authentication_string=password('123qwe') where user='root' and Host = 'localhost';

————————————————
版权声明：本文为CSDN博主「o尐猫o」的原创文章，遵循 CC 4.0 BY-SA 版权协议，转载请附上原文出处链接及本声明。
原文链接：https://blog.csdn.net/dy_miao/article/details/91461581
```



## 3.2 备份和还原

### 3.2.1 mysqldump 备份

```sh
https://www.cnblogs.com/chenmh/p/5300370.html

## 1.该命令会导出包括系统数据库在内的所有数据库
mysqldump -uroot -proot --all-databases >/tmp/all.sql

## 2.导出db1、db2两个数据库的所有数据
mysqldump -uroot -proot --databases db1 db2 >/tmp/user.sql

## 3.导出db1中的a1、a2表
mysqldump -uroot -proot --databases db1 --tables a1 a2  >/tmp/db1.sql

## 4.条件导出，导出db1表a1中id=1的数据
mysqldump -uroot -proot --databases db1 --tables a1    --where='id=1'  >/tmp/a1.sql

## 5.字段是字符串,并且导出的sql中不包含drop table,create table
mysqldump -uroot -proot --no-create-info --databases db1 --tables a1 --where="id='a'"  >/tmp/a1.sql

## 6.只导出表结构不导出数据，--no-data
mysqldump -uroot -proot --no-data --databases db1 >/tmp/db1.sql

### 
PATH="/application/mysql/bin:$PATH"
DBPATH=/server/backup
MY_USER=root
MY_PASS=old123
SOCKET=/data/3306/mysql.sock
MY_CMD="mysql -u$MY_USER -p$MY_PASS -S $SOCKET"
MY_DUMP="mysqldump -u$MY_USER -p$MY_PASS -S$SOCKET"

[ ! -d "$DBPATH" ] && mkdir -p $DBPATH

for dbname in `$MYCMD -e "show databases;" |sed '1,2d' |egrep -v "mysql|schema"`
do
	$MYDUMP $dbname |gzip > $DBPATH/${dbname}_$(date +%F).sql.gz
done
```





### 3.2.2 mysql 还原

### 3.2.3 mysqlbinlog 解析binlog

```sh
#https://www.cnblogs.com/michael9/p/11923483.html

mysqlbinlog -v -v --base64-output=DECODE-ROWS --set-charset=UTF-8  --start-position=309610 --stop-position=328251 mysql-bin.000002 > recover.sql
mysqlbinlog -v -v --base64-output=DECODE-ROWS --set-charset=UTF-8  mysql-bin.000001  
```



### 3.2.4 binlog2sql 回滚SQL

```
https://github.com/danfengcao/binlog2sql

[mysqld]
server_id = 1
log_bin = /var/log/mysql/mysql-bin.log
max_binlog_size = 1G
binlog_format = row
binlog_row_image = full

######
## 解析标准SQL
python binlog2sql.py -h127.0.0.1 -P3306 -uadmin -p'admin' -dtest -t test3 test4 --start-file='mysql-bin.000002'

## 解析回滚SQL -B, --flashback
python binlog2sql.py -h127.0.0.1 -P3306 -uadmin -p'admin' -dtest -ttest3 --start-file='mysql-bin.000002' --start-position=763 --stop-position=1147 -B

```



### 3.2.5 xtrabackup

```sh
# this is a example about xtrabackup
#
# coding:utf8
# 步骤
# 全量备份 -> 增量1 -> 增量2 -> 

# 全量备份00，假设全量文件是/backup_file/00
innobackupex --user=root --password='123123' /backup_file/

# 增量1, 文件是/backup_file/11
innobackupex --incremental /backup_file --incremental-basedir=/backup_file/00

# 增量2, 文件是/backup_file/22
innobackupex --incremental /backup_file --incremental-basedir=/backup_file/11

##################
# 整合# 
# 准备全量00
innobackupex --apply-log --redo-only /backup_file/00

# 准备11
innobackupex --apply-log --redo-only /backup_file/00/ --incremental-dir=/backup_file/11

# 准备22
innobackupex --apply-log --redo-only /backup_file/00/ --incremental-dir=/backup_file/22

#################
#
# 恢复数据
innobackupex --copy-back /backup_file/00

# 修改属主、属组
chown -R mysql.mysql /usr/local/mysql/data

# 启动mysql
/etc/init.d/mysqld start

#### 5，恢复binlog中的部分文件

mysqlbinlog mysql-bin.000002 >/tmp/abc.sql
#
# 暂时关闭binlog记录
mysql> set sql_log_bin=0;
mysql> source /tmp/abc.sql;
#
# 恢复完成，打开binlog记录
mysql> set sql_log_bin=1
```



## 3.3 主从复制 



### 3.3.0 主从复制方式

```ini
##

```



### 3.3.1 传统binlog

```ini
##
```



### 3.3.2 基于GTID（建议使用mysql-5.6.5以上版本）

```ini
MySQL GTID 主从复制的原理及配置 https://blog.51cto.com/yangshufan/2136862

四、GTID的工作原理
1、当一个事务在主库端执行并提交时，产生GTID，一同记录到binlog日志中。

2、binlog传输到slave,并存储到slave的relaylog后，读取这个GTID的这个值设置gtid_next变量，即告诉Slave，下一个要执行的GTID值。

3、sql线程从relay log中获取GTID，然后对比slave端的binlog是否有该GTID。

4、如果有记录，说明该GTID的事务已经执行，slave会忽略。

5、如果没有记录，slave就会执行该GTID事务，并记录该GTID到自身的binlog，   在读取执行事务前会先检查其他session持有该GTID，确保不被重复执行。

6、在解析过程中会判断是否有主键，如果没有就用二级索引，如果没有就用全部扫描。

```

## 3.9 MySQL参数调优

```ini
https://www.cnblogs.com/zhichaoma/p/7992525.html

 连接相关参数

 文件相关参数

 缓存相关参数 

 MyISAM参数

 InnoDB参数
```



# 四、Django



## 4.0 py虚拟环境（virtualenv的使用）

```sh
## centos7安装
yum  install –y make gcc-c++ python36-devel python36-pip libxml2-devel libxslt-devel

pip3 install virtualenv virtualenvwrapper

export WORKON_HOME=$HOME/.virtualenvs
export PROJECT_HOME=$HOME/workspace
source /usr/local/bin/virtualenvwrapper.sh

#使用方法：
mkvirtualenv zqxt #创建运行环境zqxt

workon zqxt   #工作在 zqxt 环境

mkproject -p /usr/bin/python3 py3-pyspider  #创建mic项目和运行环境mic

## 拓展：
rmvirtualenv ENV #删除运行环境ENV
mkproject mic  #创建mic项目和运行环境mic
mkproject -p /usr/bin/python3 py3-pyspider  #创建mic项目和运行环境mic

mktmpenv   #创建临时运行环境
lsvirtualenv  #列出可用的运行环境
lssitepackages  #列出当前环境安装了的包

## 创建的环境是独立的，互不干扰，无需sudo权限即可使用 pip 来进行包的管理。
pip install --ignore-installed pycurl

```



## 4.1 Django路由

4.1.1 Django哈哈

```pyhon
python manage.py startapp test
python manage.py makemigrations
python manage.py migrate
python manage createsuperuser

2.0后urls文件内的path好像不支持正则了 

需要用正则匹配的 需要

from django.urls import re_path

urlpatterns = [
    re_path('index-(?P<nid>\d)-(?P<uid>\d)', views.index)
}
————————————————
版权声明：本文为CSDN博主「Reisen稻叶」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。
原文链接：https://blog.csdn.net/u011410397/java/article/details/81780495

be determined to have a great day, and you will

```




# 五、saltstack



## 5.1 使用入门

```sh
cat /etc/salt/master | grep -v '#' | grep -v -e '^$'

/etc/init.d/salt-master restart

salt -L 'HD-HZ-H5PLAT-WEB05' state.sls sysinit

salt -v 'HD-HZ-H5PLAT-WEB05' state.highstate -l debug -t 300

salt-run jobs.lookup_jid 20190426130418644064

https://docs.saltstack.com/en/latest/ref/runners/all/salt.runners.jobs.html
http://dearweb.xin/2017/10/24/salt-file-backup/
#################################
salt -d  ##查看帮助文档
salt -d|grep service  ##查看service相关模块命令
salt '*' sys.doc  ##查看帮助文档
salt-key  -L            #查询所有接收到的证书
salt-key  -a <证书名>   #接收单个证书
salt-key  -A            #接受所有证书
salt-key  -d <证书名>   #删除单个证书
salt-key  -D            #删除所有证书

## service
salt '*' service.get_all  ##获取主机所有服务
salt '*' service.reload sshd  ##重载sshd服务
salt 'node1.com' service.status mysql  ##查看mysql服务状态
salt 'node1.com' service.start mysql  ##启动mysql服务
salt 'node1.com' cmd.run 'service mysql status'  ##与上面一样查看服务
salt '*' sys.list_modules  ##模块列表
salt-cp '*'  /etc/hosts   /etc/hosts  ##把master上的hosts文件分发到所有主机
salt '*' cp.get_file salt://ceshi/b /tmp/test  ##把salt-master端相应的文件，分发文件到minion端
salt '*' cp.get_dir salt://zabbix /tmp  ##把salt-master端相应的目录，分发文件到minion端
salt '*' file.copy /tmp/zabbix.sls /tmp/sls  ##把salt-master端对应文件拷贝到minion端相应目录下

## pkg
salt '*' pkg.list_pkgs   ##显示软件包版本列表
salt '*' pkg.version python  ##显示软件包版本信息
salt '*' pkg.install httpd  ##安装软件包

'cmd.script:'
        salt '*' cmd.script salt://scripts/runme.sh
        salt '*' cmd.script salt://scripts/runme.sh 'arg1 arg2 "arg 3"'
        salt '*' cmd.script salt://scripts/windows_task.ps1 args=' -Input c:\tmp\infile.txt' shell='powershell'
        salt '*' cmd.script salt://scripts/runme.sh stdin='one\ntwo\nthree\nfour\nfive\n'
'cmd.shell:'
        This passes the cmd argument directly to the shell
        salt '*' cmd.shell "ls -l | awk '/foo/{print \$2}'"
        salt '*' cmd.shell template=jinja "ls -l /tmp/`grains`.`id` | awk '/foo/{print \$2}'"
        salt '*' cmd.shell "Get-ChildItem C:\ " shell='powershell'
        salt '*' cmd.shell "grep f" stdin='one\ntwo\nthree\nfour\nfive\n'
        salt '*' cmd.shell cmd='sed -e s/=/:/g'
'cmd.shells:'
        salt '*' cmd.shells
'cmd.tty:'
        salt '*' cmd.tty tty0 'This is a test'
        salt '*' cmd.tty pts3 'This is a test'
'cmd.which:'
        salt '*' cmd.which cat

## grains
salt '*' grains.ls   ##查看grains分类
salt '*' grains.items   ##查看grains所有信息
salt '*' grains.item osrelease  ##查看grains某个信息

## manage
salt-run manage.up   ##查看存活的minion
salt-run manage.down  ##查看死掉的minion
salt-run manage.down removekeys=True   ##查看down掉的minion，并将其删除
salt-run manage.status   ##查看minion的相关状态
salt-run manage.versions   ##查看slat的所有master和minion的版本信息

## jobs
salt-run jobs.active
salt \* saltutil.running  ##查看运行的jobs ID
salt \* saltutil.kill_job 20151209034239907625  ##kill掉进程ID

### saltutil模块中的job管理方法
saltutil.running #查看minion当前正在运行的jobs
saltutil.find_job<jid> #查看指定jid的job(minion正在运行的jobs)
saltutil.signal_job<jid> <single> #给指定的jid进程发送信号
saltutil.term_job <jid> #终止指定的jid进程(信号为15)
saltutil.kill_job <jid> #终止指定的jid进程(信号为9)

### salt runner中的job管理方法
salt-run jobs.active #查看所有minion当前正在运行的jobs(在所有minions上运?saltutil.running)
salt-run jobs.lookup_jid<jid> #从master jobs cache中查询指定jid的运行结果
salt-run jobs.list_jobs #列出当前master jobs cache中的所有job

salt-run jobs.active
salt-run jobs.list_jobs
salt-run jobs.list_job 20190823152131069508
salt-run jobs.lookup_jid 20190823152136187925

https://docs.saltstack.com/en/latest/ref/states/backup_mode.html#file-state-backups

```

## 5.2 salt-api 安装部署

```sh
## 生成证书
salt-call --local tls.create_self_signed_cert

curl -k https://172.10.15.2:55880/login -H "Accept: application/x-yaml"  -d username='saltapi222'  -d password='saltapi222@##$$##'  -d eauth='pam'

## 链接：https://www.jianshu.com/p/012ccdff93cc

useradd -M -s /sbin/nologin saltapi222
passwd saltapi222
saltapi222@##$$##

###############
openssl 生成加密文件

### 222
# 1 install
yum install -y salt-api

# 2 adduser
useradd -M -s /sbin/nologin salt echo "salt@@123" |passwd --stdiin salt

# 3 配置证书文件
mkdir /etc/ssl/private
## 生成key
openssl genrsa -out /etc/ssl/private/key.pem 4096
## 生成证书
openssl req -new -x509 -key /etc/ssl/private/key.pem -out /etc/ssl/private/cert.pem -days 1826

## 为salt-api单独配置文件
cat >> /etc/salt/master.d/salt-api.conf<<EOF
external_auth:
    pam:
        salt:
            - .*
            - '@whell'
            - '@runner'
            - '@jobs'

rest_cherrypy:
    port: 58080
    host: 0.0.0.0
    ssl_crt: /etc/ssl/private/cert.pem
    ssl_key: /etc/ssl/private/key.pem
    # disable_ssl: True
EOF

# 重启master 和salt-api
service salt-master restart
service salt-api restart
4 API 测试验证
获取token
curl -k https://127.0.0.1:8080/login -H "Accept: application/json" -d username='salt' -d password='salt@@123' -d eauth='pam' |jq .

curl -k https://localhost:8080/ -H "Accept: application/json" -H "X-Auth-Token: ff3k3k23k2332" -d client='local' -d tgt='192.168.204.160' -d fun="cmd.run" -d arg="uname -a" |jq .

jq JSON格式化输出
yum install -y jq 
cat json_test.txt |jq .
```

### 5.2.1 salt-api 使用

```
## https://www.jianshu.com/p/012ccdff93cc

https://www.cnblogs.com/tutuye/p/11590599.html
## salt-api api接口
https://honglimin.cn/saltstack/08_saltapi_doc.html

```



## 5.3 salt-ssh 批量部署minion

```sh
yum install salt-ssh


```



## 5.8 ansible

```sh
# ansible 常用模块

根据模块功能分类为：云模块、命令模块、数据库模块、文件模块、资产模块、消息模块、监控模块、网络模块、通知模块、包管理模块、源码控制模块、系统模块、单元模块、web设施模块、Windows模块。

## 安装ansible

yum install ansible -y

rpm -ql ansible

/etc/ansible
/etc/ansible/ansible.cfg
/etc/ansible/hosts
/etc/ansible/roles
...

ansible -h

ansible --version

cat >/etc/ansible/hosts << EOF

[test]
192.168.0.211

# children
[mfs:children]
mfs_master
mfs_client
mfs_node

[mfs_master]
192.168.204.11

[mfs_client]
192.168.204.21

[mfs_node]
192.168.204.31

EOF

这里仅仅介绍一些最常用的模块；

### 收集客户机的信息
ansible all -m setup

### ping 模块
ansible all -m ping

### 执行命令
ansible -i /etc/ansible/hosts test -u root -m command -a 'ls -l /root/' -k

# 简化如下
ansible test -a 'ls -l /root/' -k


### file 模块

ansible test -m file -a "src=/etc/fstab dest=/tmp/fstab state=link"

ansible test -m file -a "path=/tmp/fstab state=absent"

ansible test -m file -a "path=/tmp/test state=touch"

ansible test -m file -a "path=/tmp/d2 state=directory owner=root group=root mode=700"

ansible test -m command -a "ls /tmp -lh"

```



# 六、gitlab

## 6.1 git命令入门

```sh
#!/bin/bash
cd "$WORKSPACE"
git checkout $GitBranch
git diff $from_commitid $to_commitid --name-only>compile_list.txt

## 获取commit id
git log  --pretty="%s"  -2

git log  --pretty="%H"  -2
git log  --pretty="%h"  -2

## 某文件的修改记录
git log filename   # 查看某个文件的commit记录
git log -p filename    # 查看文件每次提交的diff
git log --pretty=oneline filename # 列出文件的所有改动历史
git show 提交生成的一次哈希值 filename  # 只查看某次提交的文件变化

## 取消add后的修改
git reset HEAD + 文件名

## 取消commit后的修改
git checkout commitId 文件名

```



## 6.2 gitlab的安装使用

```sh
##
```



## 6.8 Jenkins CI/CD

```sh
## docker 安装 Jenkins
docker search jenkins
docker pull jenkins/jenkins:lts
mkdir  /opt/apps/jenkins -p
chmod  777   /opt/apps/jenkins
ll /opt/apps/
docker run -it --name wk-jenkinsci -v /opt/apps/jenkins:/var/jenkins_home -p 8080:8080 -p 50000:50000 -p 45000:45000 jenkins/jenkins:lts

## 查看启动状态
dockeer ps

## 查看启动端口
netstat -ntlp |grep 8080

cd /opt/apps/jenkins/

vim copy_reference_file.log
## 升级站点项的的地址配置文件
cat hudson.model.UpdateCenter.xml
## 备份配置文件
cp  hudson.model.UpdateCenter.xml  hudson.model.UpdateCenter.xml.default
## 【系统管理】【管理插件】【高级】升级站点项的地址修改成，
## 手动修改配置文件或后台修改http://ip:8080/pluginManager/advanced
grep center.json *
hudson.model.UpdateCenter.xml:    <url>https://mirrors.tuna.tsinghua.edu.cn/jenkins/updates/update-center.json</url>

## ldap配置系列二：jenkins集成ldap
https://www.cnblogs.com/zhaojiedi1992/p/zhaojiedi_liunx_52_ldap_for_jenkins.html

## jenkins集成OpenLDAP认证
https://www.cnblogs.com/37Y37/p/9430272.html

## Jenkins学习七：Jenkins的授权和访问控制  
https://www.cnblogs.com/yangxia-test/p/4368778.html

## Jenkins学习四：Jenkins 邮件配置
https://www.cnblogs.com/yangxia-test/p/4366172.html

## Jenkins 持续集成综合实战
https://kefeng.wang/2017/01/06/jenkins/

```




# 七、docker


## 7.1 配置阿里repo安装docker

```sh
## 18.06.1-ce
wget https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo -O /etc/yum.repos.d/docker-ce.repo
# yum install -y yum-utils device-mapper-persistent-data lvm2
# yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

yum makecache
yum list docker-ce --showduplicates | sort -r

yum -y install  docker-ce
systemctl enable docker && systemctl start docker

docker version

## 镜像的导入和导出
docker save rancher/rke-tools:v0.1.59  rancher/coreos-etcd:v3.4.3-rancher1  > etcd.tar
docker load < etcd.tar

## pip3 install docker-compose
yum install python36-devel python36-pip
pip3 install docker-compose 

### docker-compose命令补全
curl -L https://raw.githubusercontent.com/docker/compose/1.27.4/contrib/completion/bash/docker-compose > /etc/bash_completion.d/docker-compose
```

### docker base

```
#1.停止所有的container，这样才能够删除其中的images：
docker stop $(docker ps -a -q)

#如果想要删除所有container的话再加一个指令：
docker rm $(docker ps -a -q)

#2.查看当前有些什么images
docker images

#3.删除images，通过image的id来指定删除谁
docker rmi <image id>

```



### dockers volumes

```ini
	  
增加这个
    volumes:
      - /etc/localtime:/etc/localtime
      - /etc/timezone:/etc/timezone  


https://segmentfault.com/a/1190000005612603
docker run -e TZ="Asia/Shanghai" -v /etc/localtime:/etc/localtime:ro --name=tomcat tomcat:8.0.35-jre8

<p>通过这样的启动方式，就是OK了。<br>当然聪明人肯定不会自己每次都在启动的时候加这些配置，当然在基础镜像里面搞好咯。</p>
```

### docker cp

```sh
### 将主机/www/runoob目录拷贝到容器96f7f14e99ab的/www目录下。
docker cp /www/runoob 96f7f14e99ab:/www/

### 将主机/www/runoob目录拷贝到容器96f7f14e99ab中，目录重命名为www。
docker cp /www/runoob 96f7f14e99ab:/www

### 将容器96f7f14e99ab的/www目录拷贝到主机的/tmp目录中。
docker cp  96f7f14e99ab:/www /tmp/

```

## 7.2 docker-compose

### 7.2.1 docker flask

```ini
https://www.cnblogs.com/soymilk2019/p/11590117.html
```

### 7.2.2 docker nginx

```sh
docker run --name testnginx  -p 888:80  -v /mnt/nz-docker/init/nginx/nz-docker.conf:/etc/nginx/conf.d/default.conf -v /mnt/nz-docker/client/:/usr/share/nginx/html/  nginx:1.12.2

docker run --name testnginx  -p 888:80  -v init/nginx/nz-docker.conf:/etc/nginx/conf.d/default.conf -v client/:/usr/share/nginx/html/  nginx:1.12.2
```


## 7.5 elk - docker

### elk 

```yaml
#确立自己原则的“五步原则”
#
#1、目标：我要什么？
#2、计划：我该怎么做？
#3、行动：我碰到了什么问题？
#4、反思：什么原因？
#5、改进：形成原则

├── docker-compose.yml
├── docker-stack.yml
├── elasticsearch
│   ├── config
│   │   └── elasticsearch.yml
│   └── Dockerfile
├── extensions
│   ├── apm-server
│   ├── app-search
│   ├── curator
│   ├── logspout
├── kibana
│   ├── config
│   │   └── kibana.yml
│   └── Dockerfile
├── LICENSE
├── logstash
│   ├── config
│   │   └── logstash.yml
│   ├── Dockerfile
│   └── pipeline
│       └── logstash.conf
└── README.md

---
version: '2.2'

services:

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.2.0
    container_name: elasticsearch7.2.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - TZ=Asia/Shanghai
    volumes:
      - esdata:/usr/share/elasticsearch
    hostname: elasticsearch
    restart: always
    ports:
      - 9200:9200
      - 9300:9300

  kibana:
    image: docker.elastic.co/kibana/kibana:7.2.0
    container_name: kibana7.2.0
    environment:
      - elasticsearch.hosts=http://elasticsearch:9200
      - TZ=Asia/Shanghai
    hostname: kibana
    depends_on:
      - elasticsearch
    restart: always
    ports:
      - "5601:5601"

  logstash:
    image: docker.elastic.co/logstash/logstash:7.2.0
    container_name: logstash7.2.0
    environment:
      - TZ=Asia/Shanghai
    hostname: logstash
    restart: always
    depends_on:
      - elasticsearch
    ports:
      - 9600:9600
      - 5044:5044

volumes:
  esdata:
    driver: local

#链接：https://www.jianshu.com/p/24f6548de113
#https://cloud.tencent.com/developer/article/1623379
#https://github.com/deviantony/docker-elk
```

### logstash5 配置文件

```ini
input {
    file {
            path => "/var/log/httpd/access_log"
            type => "http"
            start_position => "beginning"
    }

    file {
            path => "/usr/local/nginx/logs/elk.access.log"
            type => "nginx"
            start_position => "beginning"
    }

    file {
            path => "/var/log/secure"
            type => "secure"
            start_position => "beginning"
    }

    file {
            path => "/var/log/messages"
            type => "system"
            start_position => "beginning"
    }
}


output {
    if [type] == "http" {
        redis {
            host => "192.168.1.202"
            password => 'test'
            port => "6379"
            db => "6"
            data_type => "list"
            key => 'nagios_http' 
        }
    }

    if [type] == "nginx" {
        redis {
            host => "192.168.1.202"
            password => 'test'
            port => "6379"
            db => "6"
            data_type => "list"
            key => 'nagios_nginx' 
        }
    }

    if [type] == "secure" {
        redis {
            host => "192.168.1.202"
            password => 'test'
            port => "6379"
            db => "6"
            data_type => "list"
            key => 'nagios_secure' 
        }
    }

    if [type] == "system" {
        redis {
            host => "192.168.1.202"
            password => 'test'
            port => "6379"
            db => "6"
            data_type => "list"
            key => 'nagios_system' 
        }
    }
} 

# # /usr/share/logstash/bin/logstash -f /etc/logstash/conf.d/full.conf
```



### logstash7 部分配置参考

```ini
{ generator 
    { message => stdin codec => json }
}

filter {
     mutate {
     	 rename => { "[foo][bar]" => "hello" }
		 }
}

input{
  stdin{codec => json_lines}
}

filter{
  mutate{
    rename => {
	    "[f1][f2]" => "f3"
		}
	}
}

output{
  stdout{
    codec => rubydebug{}
	}
}
```



### kafka测试

```ini
https://www.cnblogs.com/xiao987334176/p/10075659.html


/usr/local/kafka/bin/kafka-topics.sh --create --zookeeper 172.16.1.245:2181,172.16.1.243:2181,172.16.1.244:2181/kafka --replication-factor 3 --partitions 1 --topic test-topic

/usr/local/kafka/bin/kafka-topics.sh --describe --zookeeper 172.16.1.245:2181,172.16.1.243:2181,172.16.1.244:2181/kafka --topic test-topic


作者：杨赟快跑
链接：https://www.jianshu.com/p/bdd9608df6b3


/usr/local/kafka/bin/zookeeper-server-start.sh /usr/local/kafka/config/zookeeper.properties 

/usr/local/kafka/bin/kafka-server-start.sh /usr/local/kafka/config/server.properties &


kill -9 `jps |grep afka |awk '{print $1}'`

grep -v '^$' server.properties |grep -v '^#'

ll /usr/local/kafka/zookeeper/
```


### 7.5.4 filebeat7.yml

```yaml
filebeat.inputs:
- type: log
  enabled: true
  # Paths that should be crawled and fetched. Glob based paths.
  paths:
    - /opt/log/games/*/*.log
  ### Multiline options
  multiline.pattern: '^[0-9]{4}'
  multiline.negate: true
  multiline.match: after

  #exclude_files: ["[0-9]{4}-[0-9]{2}-[0-9]{2}.[0-9]{3}.log$"]
  tags: ["games"]

#================================ Logging =====================================
# Sets log level. The default log level is info.
# Available log levels are: error, warning, info, debug
logging.level: info
logging.to_files: true
logging.files:
  path: /opt/log/filebeat7

  name: filebeat.log

######output for kafka#######
output.kafka:
  hosts: ["kafka-s1.demain.com:9093","kafka-s2.demain.com:9093","kafka-s3.demain.com:9093"]
  topic: 'GAMES-NZ'
  partition.round_robin:
    reachable_only: false
  enabled: true
  required_acks: 1
  max_message_bytes: 100000000
  version: "0.10"
  keep_alive: 60s
  compression: gzip
  flush_interval: 10s
  #######ssl########
  ssl.certificate_authorities: "/usr/local/filebeat/keytool/myca.pem"
  ssl.certificate: "/usr/local/filebeat/keytool/client1.pem"
  ssl.key: "/usr/local/filebeat/keytool/client1-key.pem"

```

### 7.5.5 kibana dev tools

```ini
# Dev Tools

## 入门简介
https://www.cnblogs.com/ginb/p/6637236.html

## 官方api
https://www.elastic.co/guide/en/elasticsearch/reference/7.3/cat-health.html

## 集群信息
GET /_cluster/stats?pretty

## 分片大小
GET /_cat/shards?v
# GET _cat/shards?h=index,shard,prirep,state,unassigned.reason

index                        shard prirep state           docs    store ip          node
games-nz_ydwx-2020.11.04     0     r      STARTED        12059    3.5mb 172.16.1.68 es_node-1
games-nz_ydwx-2020.11.04     0     p      STARTED        12059    3.4mb 172.16.1.64 es_node-3


## 列出所有索引
GET /_cat/indices?v
# GET /_cat/indices?v&s=pri.store.size
# GET /_cat/indices?v&s=pri.store.size:desc

health status index                        uuid                   pri rep docs.count docs.deleted store.size pri.store.size
green  open   games-nz_hf-2020.11.03       xWdlWq58RPSjpd7LcA2Ipw   1   1   26337502            0     18.8gb          9.4gb
green  open   games-nz_hf-2020.11.09       Ozy8LS54TKuyEK8mmLMOqA   1   1    1808980            0      1.5gb        769.3mb
green  open   audit-2020.10.25             AggdiOSwQXW0R0EWlNAUig   1   1        186            0    276.8kb        138.4kb

## 是否健康
GET /_cat/health?v

## 返回 bank 索引中的所有文档
GET /bank/_search?q=*&sort=account_number:asc&pretty

## ElasticSearch优化整理
https://www.jianshu.com/p/45a15ca1114f
```

### 7.5.8 py es api

```sh
#pip3 install elasticsearch
#https://www.cnblogs.com/xiao987334176/p/10130712.html
from elasticsearch import Elasticsearch
es = Elasticsearch(['10.10.13.12'], http_auth=('xiao', '123456'), timeout=3600)

es.search(index='logstash-2015.08.20', q='http_status_code:5* AND server_name:"web1"', from_='124119')
```



## 7.6 cdh - docker

```ini
## https://www.cnblogs.com/piperck/p/9917118.html
https://www.cnblogs.com/piperck/p/9917118.html
https://downloads.cloudera.com/demo_vm/docker/cloudera-quickstart-vm-5.13.0-0-beta-docker.tar.gz
```



## 7.16 prometheus - docker

```sh
##
```



### 7.16.8 py prom api

```sh
##
```

#### py alert api

```sh
##
GET /-/healthy 
GET /-/ready  
POST /-/reload

curl -u monitor:fosafer.com 127.0.0.1:9093/-/healthy
curl -XPOST   127.0.0.1:9093/-/reload
curl -XPOST -u monitor:fosafer.com 127.0.0.1:9093/-/reload
```



# 八、Prometheus

## 8.1 prometheus安装

```shell
tar xf 
mkdir /opt/prometheus/
```

## 8.2 promql语法

```sql
### 11xxx 的在线redis
redis_up{redis_host=~".*:11[0-9]{3}"}
### prometheus监控 promsql的常用的几个的写法
## 监控CPU的使用率
100 - (avg by (instance) (irate(node_cpu{instance="10.3.51.200:9100", mode="idle"}[1m])) * 100)
## CPU各个mode的占用率
avg by (instance, mode) (irate(node_cpu{instance="10.3.51.200:9100"}[1m])) * 100
user：cpu花了多少比率运行用户态空间，也就是用户进程占比。用户空间程序是不属于内核的任何进程。 
system：CPU花了多少比率运行内核空间。所有进程和系统资源都有liunx内核处理。 
iowait：读写磁盘的操作比CPU的运行时间慢，CPU负载处理数据，而数据一般在磁盘上需要读到内存中才能处理。当CPU发起读写操作后，需要等着磁盘驱动器将数据读入内存，从而导致CPU等待一段时间无事可做。CPU处于这种状态的等待时间就是iowait时间。 
idle：CPU处于空闲状态的时间比例 irq＆softirq：处理器为中断服务的时间。
irq用于硬件中断，
softirq用于软件中断。 
Nice：用户空间进程的CPU的调度优先级，可以通过调整期优先级来调整用户空间的优先级。

## 机器一分钟的平均负载
node_load1{instance="10.3.51.200:9100"}
## 内存使用率
100 - ((node_memory_MemFree{instance="10.3.51.200:9100"}+node_memory_Cached{instance="10.3.51.200:9100"}+node_memory_Buffers{instance="10.3.51.200:9100"})/node_memory_MemTotal) * 100

### 带宽监控 
## 上行带宽
sum by (instance) (irate(node_network_receive_bytes{instance="10.3.51.200:9100",device!~"bond.*?|lo"}[1m])/128)
## 下行带宽
sum by (instance) (irate(node_network_transmit_bytes{instance="10.3.51.200:9100",device!~"bond.*?|lo"}[1m])/128)
## 入包量
sum by (instance) (rate(node_network_receive_bytes{instance="10.3.51.200:9100",device!="lo"}[1m]))
## 出包量
sum by (instance) (rate(node_network_transmit_bytes{instance="10.3.51.200:9100",device!="lo"}[1m]))

## 磁盘使用率
100 - node_filesystem_free{instance="10.3.51.200:9100",fstype!~"rootfs|selinuxfs|autofs|rpc_pipefs|tmpfs|udev|none|devpts|sysfs|debugfs|fuse.*"} / node_filesystem_size{instance="10.3.51.200:9100",fstype!~"rootfs|selinuxfs|autofs|rpc_pipefs|tmpfs|udev|none|devpts|sysfs|debugfs|fuse.*"} * 100
## 平均请求数
rate(http_requests_total{instance="10.3.51.200:9100"}[1m])

原文：https://blog.csdn.net/sunyuhua_keyboard/article/details/81302165 
版权声明：本文为博主原创文章，转载请附上博文链接！

### 函数列表一些函数有默认的参数，例如：
year(v=vector(time()) instant-vector)
v是参数值，instant-vector是参数类型。
vector(time())是默认值。

abs()
abs(v instant-vector)返回输入向量的所有样本的绝对值。

absent()
absent(v instant-vector)，如果赋值给它的向量具有样本数据，则返回空向量；如果传递的瞬时向量参数没有样本数据，则返回不带度量指标名称且带有标签的样本值为1的结果当监控度量指标时，如果获取到的样本数据是空的， 使用absent方法对告警是非常有用的

absent(nonexistent{job="myjob"}) # => key: value = {job="myjob"}: 
absent(nonexistent{job="myjob", instance=~".*"}) # => {job="myjob"} 1 so smart !
absent(sum(nonexistent{job="myjob"})) # => key:value {}: 0

ceil()
ceil(v instant-vector) 是一个向上舍入为最接近的整数。

changes()
changes(v range-vector) 输入一个范围向量， 返回这个范围向量内每个样本数据值变化的次数。

clamp_max()
clamp_max(v instant-vector, max scalar)函数，输入一个瞬时向量和最大值，样本数据值若大于max，则改为max，否则不变

clamp_min()
clamp_min(v instant-vector)函数，输入一个瞬时向量和最大值，样本数据值小于min，则改为min。否则不变

count_saclar()
count_scalar(v instant-vector) 函数, 输入一个瞬时向量，返回key:value="scalar": 样本个数。而count()函数，输入一个瞬时向量，返回key:value=向量：样本个数，其中结果中的向量允许通过by条件分组。

day_of_month()
day_of_month(v=vector(time()) instant-vector)函数，返回被给定UTC时间所在月的第几天。返回值范围：1~31。

day_of_week()
day_of_week(v=vector(time()) instant-vector)函数，返回被给定UTC时间所在周的第几天。返回值范围：0~6. 0表示星期天。

days_in_month()
days_in_month(v=vector(time()) instant-vector)函数，返回当月一共有多少天。返回值范围：28~31.

delta()
delta(v range-vector)函数，计算一个范围向量v的第一个元素和最后一个元素之间的差值。返回值：key:value=度量指标：差值下面这个表达式例子，返回过去两小时的CPU温度差：delta(cpu_temp_celsius{host="zeus"}[2h])delta函数返回值类型只能是gauges。

deriv()
deriv(v range-vector)函数，计算一个范围向量v中各个时间序列二阶导数，使用简单线性回归deriv二阶导数返回值类型只能是gauges。

drop_common_labels()
drop_common_labels(instant-vector)函数，输入一个瞬时向量，返回值是key:value=度量指标：样本值，其中度量指标是去掉了具有相同标签。 
例如：
http_requests_total{code="200", host="127.0.0.1:9090", method="get"} : 4, 
http_requests_total{code="200", host="127.0.0.1:9090", method="post"} : 5, 
返回值: http_requests_total{method="get"} : 4, http_requests_total{code="200", method="post"} : 5

exp()
exp(v instant-vector)函数，输入一个瞬时向量, 返回各个样本值的e指数值，即为e^N次方。特殊情况如下所示：Exp(+inf) = +Inf Exp(NaN) = NaNfloor()floor(v instant-vector)函数，与ceil()函数相反。 4.3 为 4 。

histogram_quantile()
histogram_quatile(φ float, b instant-vector) 函数计算b向量的φ-直方图 (0 ≤ φ ≤ 1) 。参考中文文献[https://www.howtoing.com/how-to-query-prometheus-on-ubuntu-14-04-part-2/]

holt_winters()
holt_winters(v range-vector, sf scalar, tf scalar)函数基于范围向量v，生成事件序列数据平滑值。平滑因子sf越低, 对老数据越重要。趋势因子tf越高，越多的数据趋势应该被重视。0< sf, tf <=1。 holt_winters仅用于gaugeshour()hour(v=vector(time()) instant-vector)函数返回被给定UTC时间的当前第几个小时，时间范围：0~23。

idelta()
idelta(v range-vector)函数，输入一个范围向量，返回key: value = 度量指标： 每最后两个样本值差值。

increase()
increase(v range-vector)函数， 输入一个范围向量，返回：key:value = 度量指标：last值-first值，自动调整单调性，
如：服务实例重启，则计数器重置。与delta()不同之处在于delta是求差值，而increase返回最后一个减第一个值,可为正为负。下面的表达式例子，返回过去5分钟，连续两个时间序列数据样本值的http请求增加值。
increase(http_requests_total{job="api-server"}[5m])increase的返回值类型只能是counters，主要作用是增加图表和数据的可读性，使用rate记录规则的使用率，以便持续跟踪数据样本值的变化。

irateirate(v range-vector)函数, 输入：范围向量，输出：key: value = 度量指标： (last值-last前一个值)/时间戳差值。它是基于最后两个数据点，自动调整单调性， 如：服务实例重启，则计数器重置。下面表达式针对范围向量中的每个时间序列数据，返回两个最新数据点过去5分钟的HTTP请求速率。

irate(http_requests_total{job="api-server"}[5m])irate只能用于绘制快速移动的计数器。因为速率的简单更改可以重置FOR子句，利用警报和缓慢移动的计数器，完全由罕见的尖峰组成的图形很难阅读。

label_replace()对于v中的每个时间序列，
label_replace(v instant-vector, dst_label string, replacement string, src_label string, regex string) 将正则表达式与标签值src_label匹配。如果匹配，则返回时间序列，标签值dst_label被替换的扩展替换。$1替换为第一个匹配子组，$2替换为第二个等。如果正则表达式不匹配，则时间序列不会更改。另一种更容易的理解是：label_replace函数，输入：瞬时向量，输出：key: value = 度量指标： 值（要替换的内容：首先，针对src_label标签，对该标签值进行regex正则表达式匹配。如果不能匹配的度量指标，则不发生任何改变；否则，如果匹配，则把dst_label标签的标签纸替换为replacement 下面这个例子返回一个向量值a带有foo标签： 

label_replace(up{job="api-server", serice="a:c"}, "foo", "$1", "service", "(.):.")

ln()
ln(v instance-vector)计算瞬时向量v中所有样本数据的自然对数。特殊例子：ln(+Inf) = +Inf ln(0) = -Inf ln(x<0) = NaN ln(NaN) = NaN

log2()
log2(v instant-vector)函数计算瞬时向量v中所有样本数据的二进制对数。

log10()
log10(v instant-vector)函数计算瞬时向量v中所有样本数据的10进制对数。相当于ln()minute()minute(v=vector(time()) instant-vector)函数返回给定UTC时间当前小时的第多少分钟。结果范围：0~59。

month()
month(v=vector(time()) instant-vector)函数返回给定UTC时间当前属于第几个月，结果范围：0~12。

predict_linear()
predict_linear(v range-vector, t scalar)预测函数，输入：范围向量和从现在起t秒后，输出：不带有度量指标，只有标签列表的结果值。例如：predict_linear(http_requests_total{code="200",instance="120.77.65.193:9090",job="prometheus",method="get"}[5m], 5)
结果：
{code="200",handler="query_range",instance="120.77.65.193:9090",job="prometheus",method="get"} 1
{code="200",handler="prometheus",instance="120.77.65.193:9090",job="prometheus",method="get"} 4283.449995397104
{code="200",handler="static",instance="120.77.65.193:9090",job="prometheus",method="get"} 22.99999999999999
{code="200",handler="query",instance="120.77.65.193:9090",job="prometheus",method="get"} 130.90381188596754
{code="200",handler="graph",instance="120.77.65.193:9090",job="prometheus",method="get"} 2
{code="200",handler="label_values",instance="120.77.65.193:9090",job="prometheus",method="get"} 2

rate()
rate(v range-vector)函数, 输入：范围向量，输出：key: value = 不带有度量指标，且只有标签列表：(last值-first值)/时间差srate(http_requests_total[5m])结果：{code="200",handler="label_values",instance="120.77.65.193:9090",job="prometheus",method="get"} 0{code="200",handler="query_range",instance="120.77.65.193:9090",job="prometheus",method="get"} 0{code="200",handler="prometheus",instance="120.77.65.193:9090",job="prometheus",method="get"} 0.2{code="200",handler="query",instance="120.77.65.193:9090",job="prometheus",method="get"} 0.003389830508474576{code="422",handler="query",instance="120.77.65.193:9090",job="prometheus",method="get"} 0{code="200",handler="static",instance="120.77.65.193:9090",job="prometheus",method="get"} 0{code="200",handler="graph",instance="120.77.65.193:9090",job="prometheus",method="get"} 0{code="400",handler="query",instance="120.77.65.193:9090",job="prometheus",method="get"} 0rate()函数返回值类型只能用counters， 当用图表显示增长缓慢的样本数据时，这个函数是非常合适的。注意：当rate函数和聚合方式联合使用时，一般先使用rate函数，再使用聚合操作, 否则，当服务实例重启后，rate无法检测到counter重置。

resets()
resets()函数, 输入：一个范围向量，输出：key-value=没有度量指标，且有标签列表[在这个范围向量中每个度量指标被重置的次数]。在两个连续样本数据值下降，也可以理解为counter被重置。 示例：resets(http_requests_total[5m])结果：{code="200",handler="label_values",instance="120.77.65.193:9090",job="prometheus",method="get"} 0{code="200",handler="query_range",instance="120.77.65.193:9090",job="prometheus",method="get"} 0{code="200",handler="prometheus",instance="120.77.65.193:9090",job="prometheus",method="get"} 0{code="200",handler="query",instance="120.77.65.193:9090",job="prometheus",method="get"} 0{code="422",handler="query",instance="120.77.65.193:9090",job="prometheus",method="get"} 0{code="200",handler="static",instance="120.77.65.193:9090",job="prometheus",method="get"} 0{code="200",handler="graph",instance="120.77.65.193:9090",job="prometheus",method="get"} 0{code="400",handler="query",instance="120.77.65.193:9090",job="prometheus",method="get"} 0resets只能和counters一起使用。

round()
round(v instant-vector, to_nearest 1= scalar)函数，与ceil和floor函数类似，输入：瞬时向量，输出：指定整数级的四舍五入值, 如果不指定，则是1以内的四舍五入。

scalar()
scalar(v instant-vector)函数, 输入：瞬时向量，输出：key: value = “scalar”, 样本值[如果度量指标样本数量大于1或者等于0, 则样本值为NaN, 否则，样本值本身]

sort()
sort(v instant-vector)函数，输入：瞬时向量，输出：key: value = 度量指标：样本值[升序排列]

sort_desc()
sort_desc(v instant-vector)函数，输入：瞬时向量，输出：key: value = 度量指标：样本值[降序排列]

sqrt()
sqrt(v instant-vector)函数，输入：瞬时向量，输出：key: value = 度量指标： 样本值的平方根

time()
time()函数，返回从1970-01-01到现在的秒数，注意：它不是直接返回当前时间，而是时间戳

vector()
vector(s scalar)函数，返回：key: value= {}, 传入参数值

year()
year(v=vector(time()) instant-vector), 返回年份。_over_time()下面的函数列表允许传入一个范围向量，返回一个带有聚合的瞬时向量:
avg_over_time(range-vector): 范围向量内每个度量指标的平均值。
min_over_time(range-vector): 范围向量内每个度量指标的最小值。
max_over_time(range-vector): 范围向量内每个度量指标的最大值。
sum_over_time(range-vector): 范围向量内每个度量指标的求和值。
count_over_time(range-vector): 范围向量内每个度量指标的样本数据个数。
quantile_over_time(scalar, range-vector): 范围向量内每个度量指标的样本数据值分位数，φ-quantile (0 ≤ φ ≤ 1)
stddev_over_time(range-vector): 范围向量内每个度量指标的总体标准偏差。
stdvar_over_time(range-vector): 范围向量内每个度量指标的总体标准方差。
转自：https://github.com/1046102779/prometheus/blob/master/prometheus/querying/functions.md
https://github.com/prometheus/prometheus/blob/master/docs/querying/functions.md


irate(node_cpu[2m])
irate(node_load1{instance="172.16.1.43:9301"}[8h])
max(prometheus_http_request_duration_seconds_count{instance="129.211.99.141:9090"})
max_over_time(prometheus_http_request_duration_seconds_count{instance="129.211.99.141:9090"}[2m])
```

## 8.5 Grafana 

```ini
常用模板编号：
node-exporter: cn/8919,en/11074
k8s: 13105
docker: 12831
alertmanager: 9578
blackbox_exportre: 9965
```



# 九、kubernetes

> [Kubernetes（k8s）中文文档 名称解释：Deployment_Kubernetes中文社区](https://www.kubernetes.org.cn/deployment)

```ini
####################
https://zhuanlan.zhihu.com/p/53260098

怎么样？是不是很神奇？

所以，Docker的第二句口号就是："Build once，Run anywhere（搭建一次，到处能用）"。

Docker技术的三大核心概念，分别是：

镜像（Image）
容器（Container）
仓库（Repository）

一个K8S系统，通常称为一个K8S集群（Cluster）,主要包括两个部分：

一个Master节点（主节点）
一群Node节点（计算节点）

Master节点包括: API Server、Scheduler、Controller manager、etcd。

API Server是整个系统的对外接口，供客户端和其它组件调用，相当于"营业厅"。

Scheduler负责对集群内部的资源进行调度，相当于"调度室"。

Controller manager负责管理控制器，相当于"大总管"。


Node节点包括Docker、kubelet、kube-proxy、Fluentd、kube-dns（可选），还有就是Pod。

Pod是Kubernetes最基本的操作单元。一个Pod代表着集群中运行的一个进程，它内部封装了一个或多个紧密相关的容器。除了Pod之外，K8S还有一个Service的概念，一个Service可以看作一组提供相同服务的Pod的对外访问接口。这段不太好理解，跳过吧。

Docker，不用说了，创建容器的。

Kubelet，主要负责监视指派到它所在Node上的Pod，包括创建、修改、监控、删除等。

Kube-proxy，主要负责为Pod对象提供代理。

Fluentd，主要负责日志收集、存储与查询。
```



## 9.1 kubeadm 安装k8s

### 9.1.1 机器初始化（准备环境）

```shell
### 关闭防火墙：
systemctl stop firewalld
systemctl disable firewalld

### 关闭selinux：
sed -i 's/enforcing/disabled/' /etc/selinux/config 
setenforce 0

### 关闭swap：
swapoff -a  #临时
sed -i '/swap/ s/^\(.*\)$/#\1/g' /etc/fstab
### vim /etc/fstab  永久

### 添加主机名与IP对应关系（记得设置主机名）：
## hostnamectl --static set-hostname  k8s-node02
cat >> /etc/hosts <<EOF
192.168.204.140 k8s-master
192.168.204.141 k8s-node1
192.168.204.142 k8s-node2

EOF
### 将桥接的IPv4流量传递到iptables的链：
cat > /etc/sysctl.d/k8s.conf << EOF
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF
sysctl --system

yum install -y conntrack ntpdate ntp ipvsadm ipset jq iptables curl sysstat libseccomp wget

### repo配置
mkdir /etc/yum.repo.d/bak
mv /etc/yum.repo.d/*.repo /etc/yum.repo.d/bak
wget -O /etc/yum.repos.d/epel.repo  http://mirrors.aliyun.com/repo/epel-7.repo

wget -O /etc/yum.repos.d/CentOS-Base.repo  http://mirrors.aliyun.com/repo/Centos-7.repo

wget -O /etc/yum.repos.d/docker-ce.repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo 

### 安装指定版本的docker
yum makecache
yum -y install docker-ce-18.06.1.ce-3.el7
systemctl enable docker && systemctl start docker

docker --version

### 配置k8s repo
cat > /etc/yum.repos.d/kubernetes.repo << EOF
[kubernetes]
name=Kubernetes
baseurl=https://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=0
repo_gpgcheck=0
gpgkey=https://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg https://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF

### 4.3 安装kubeadm，kubelet和kubectl
### 由于版本更新频繁，这里指定版本号部署：

yum install -y kubelet-1.15.2 kubeadm-1.15.2 kubectl-1.15.2
systemctl enable kubelet && systemctl start kubelet
```

### 9.1.2 master部署

```sh
### 在192.168.204.140 （Master）执行。

kubeadm init \
  --apiserver-advertise-address=192.168.204.140 \
  --image-repository registry.aliyuncs.com/google_containers \
  --kubernetes-version v1.15.0 \
  --service-cidr=10.1.0.0/16 \
  --pod-network-cidr=10.244.0.0/16


### 由于默认拉取镜像地址k8s.gcr.io国内无法访问，这里指定阿里云镜像仓库地址。

### 使用kubectl工具：

## bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
kubectl get nodes
kubectl get pods -A
## 6. 安装Pod网络插件（CNI）

## kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/a70459be0084506e4ec919aa1c1141408878db11b/Documentation/kube-flannel.yml

kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml

## https://www.cnblogs.com/hongdada/p/11395200.html
docker pull quay-mirror.qiniu.com/coreos/flannel:v0.11.0-amd64
docker tag quay-mirror.qiniu.com/coreos/flannel:v0.11.0-amd64 quay.io/coreos/flannel:v0.11.0-amd64
docker rmi quay-mirror.qiniu.com/coreos/flannel:v0.11.0-amd64 

海外服务器执行：
docker save gcr.io/google_containers/kubernetes-dashboard-amd64:v1.5.1 > dashboard.tar
docker save registry.access.redhat.com/rhel7/pod-infrastructure:latest > podinfrastructure.tar
scp *.tar root@你国内的外网IP:/home/tar
各个node上执行：
docker load < dashboard.tar
docker load < podinfrastructure.tar

[root@k8s-master01 ~]# kubectl get pods -A -o wide
NAMESPACE     NAME                                   READY   STATUS                  RESTARTS   AGE   IP                NODE           NOMINATED NODE   READINESS GATES
kube-system   coredns-bccdc95cf-rbpfs                0/1     Pending                 0          28m   <none>            <none>         <none>           <none>
kube-system   coredns-bccdc95cf-tsdf6                0/1     Pending                 0          28m   <none>            <none>         <none>           <none>
kube-system   etcd-k8s-master01                      1/1     Running                 0          28m   192.168.204.140   k8s-master01   <none>           <none>
kube-system   kube-apiserver-k8s-master01            1/1     Running                 0          28m   192.168.204.140   k8s-master01   <none>           <none>
kube-system   kube-controller-manager-k8s-master01   1/1     Running                 1          28m   192.168.204.140   k8s-master01   <none>           <none>
kube-system   kube-flannel-ds-amd64-4jqnj            0/1     Init:ImagePullBackOff   0          19m   192.168.204.140   k8s-master01   <none>           <none>
kube-system   kube-proxy-rpl4s                       1/1     Running                 0          28m   192.168.204.140   k8s-master01   <none>           <none>
kube-system   kube-scheduler-k8s-master01            1/1     Running                 1          28m   192.168.204.140   k8s-master01   <none>           <none>

### 确保能够访问到quay.io这个registery。
### 如果下载失败，可以改成这个镜像地址：lizhenliang/flannel:v0.11.0-amd64

kubectl  delete pods kube-flannel-ds-amd64-4jqnj -n kube-system
```



### 9.1.3 node部署

```sh
## 在192.168.204.141/142 （Node）执行。
## 向集群添加新节点，执行在kubeadm init输出的kubeadm join命令：
kubeadm join 192.168.204.140:6443 --token vr3h2n.8tq4754f0qugtesu \
    --discovery-token-ca-cert-hash sha256:a300b8ebdb144938a3aabbba76bc98968c9546ebb9083445b764ea037b172503

## master 执行 get pods -A  发现flannel自动注册
kube-system   kube-flannel-ds-amd64-m8vvw            1/1     Running   1          35s

```



### 9.1.4 测试集群

```sh
### 在Kubernetes集群中创建一个pod，验证是否正常运行：

kubectl create deployment nginx --image=nginx
kubectl expose deployment nginx --port=80 --type=NodePort
kubectl get pod,svc

### 访问地址：http://NodeIP:Port  
http://192.168.204.135:30586/	
```



### 9.1.5 部署dashboard

```sh
docker pull sacred02/kubernetes-dashboard-amd64:v1.10.1
docker tag sacred02/kubernetes-dashboard-amd64:v1.10.1 k8s.gcr.io/kubernetes-dashboard-amd64:v1.10.1
docker rmi sacred02/kubernetes-dashboard-amd64:v1.10.1
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v1.10.1/src/deploy/recommended/kubernetes-dashboard.yaml

### 默认镜像国内无法访问，修改镜像地址为： lizhenliang/kubernetes-dashboard-amd64:v1.10.1

### 默认Dashboard只能集群内部访问，修改 Service 为 NodePort 类型，暴露到外部：

kind: Service
apiVersion: v1
metadata:
  labels:
    k8s-app: kubernetes-dashboard
  name: kubernetes-dashboard
  namespace: kube-system
spec:
  type: NodePort
  ports:
    - port: 443
      targetPort: 8443
      nodePort: 30001
  selector:
    k8s-app: kubernetes-dashboard

kubectl apply -f kubernetes-dashboard.yaml

访问地址：http://NodeIP:30001

### 创建service account并绑定默认cluster-admin管理员集群角色：

kubectl create serviceaccount dashboard-admin -n kube-system
kubectl create clusterrolebinding dashboard-admin --clusterrole=cluster-admin --serviceaccount=kube-system:dashboard-admin
kubectl describe secrets -n kube-system $(kubectl -n kube-system get secret | awk '/dashboard-admin/{print $1}')

使用输出的token登录Dashboard。

### 更新https证书有效期，解决只能由火狐浏览器访问，其他浏览器无法访问问题
### https://www.cnblogs.com/xiajq/p/11322568.html

mkdir key && cd key
openssl genrsa -out dashboard.key 2048 

openssl req -new -out dashboard.csr -key dashboard.key -subj '/CN=172.19.0.48'

openssl x509 -req -in dashboard.csr -signkey dashboard.key -out dashboard.crt 

kubectl delete secret kubernetes-dashboard-certs -n kube-system

kubectl create secret generic kubernetes-dashboard-certs --from-file=dashboard.key --from-file=dashboard.crt -n kube-system  #新的证书

kubectl delete pod kubernetes-dashboard-746dfd476-b2r5f -n kube-system    #重启服务


```



## 9.2 rancher安装k8s

```sh
yum -y install docker-ce-18.06.1.ce-3.el7

## 18.06.1-ce

wget https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo -O /etc/yum.repos.d/docker-ce.repo
yum makecache
yum list docker-ce --showduplicates | sort -r

yum    install docker-ce-18.09.1.ce-3.el7
systemctl enable docker && systemctl start docker

docker version

rm -rf /opt/apps/rancher

docker run -d --restart=unless-stopped -v /opt/apps/rancher:/var/lib/rancher/ -p 80:80 -p 443:443 rancher/rancher


sudo docker run -d --privileged --restart=unless-stopped --net=host -v /etc/kubernetes:/etc/kubernetes -v /var/run:/var/run rancher/rancher-agent:v2.4.5 --server https://192.168.204.222 --token 8jnbplvpmfh2whfl8vdjrlqzpnjj8nmvvxstrq9bkh7zc9d2g54xgm --ca-checksum 4cf464173b12436e203b80dc537a1db4543e87c6cf17c4a2e34bfde51b843c37 --node-name master222 --internal-address 192.168.204.222 --etcd --controlplane --worker

sudo docker run -d --privileged --restart=unless-stopped --net=host -v /etc/kubernetes:/etc/kubernetes -v /var/run:/var/run rancher/rancher-agent:v2.4.5 --server https://192.168.204.222 --token xc8v54vtsfc4gv8x6lvzjsdh8l9h8jd6jgkvtngv9rc724fm96wqk2 --ca-checksum ca0c7092f76162c056f79a7bdffe439cdfd7f74b298e2831b3d9792f0fda798f --node-name master222 --internal-address 192.168.204.222 --etcd --controlplane --worker


## 镜像的导入和导出
docker save rancher/rke-tools:v0.1.59 > tools.tar
docker save rancher/coreos-etcd:v3.4.3-rancher1  > etcd.tar
docker load < etcd.tar
docker load < tools.tar
```



## 9.9 排除 001 cluster-dns问题

```ini
修改/usr/lib/systemd/system/kubelet.service  参数：cluster-dns  cluster-domain 
kubectl  describe pod kubernetes-dashboard-746dfd476-mdv5n  -n kube-system

## 报错：kubelet does not have ClusterDNS IP configured and cannot create PodJ解决方案

[root@VM_0_48_centos dashboard]# cat /usr/lib/systemd/system/kubelet.service
[Unit]
Description=Kubernetes Kubelet
After=docker.service
Requires=docker.service

[Service]
EnvironmentFile=/opt/kubernetes/cfg/kubelet
ExecStart=/opt/kubernetes/bin/kubelet $KUBELET_OPTS
Restart=on-failure
KillMode=process

[Install]
WantedBy=multi-user.target


[root@VM_0_48_centos dashboard]# cat /opt/kubernetes/cfg/kubelet
KUBELET_OPTS="--logtostderr=true \
--v=4 \
--hostname-override=172.19.0.48 \
--cluster-dns=10.0.0.2 \             ### 配置dns
--cluster-domain=cluster.local \   ###配置域名
--kubeconfig=/opt/kubernetes/cfg/kubelet.kubeconfig \
--bootstrap-kubeconfig=/opt/kubernetes/cfg/bootstrap.kubeconfig \
--cert-dir=/opt/kubernetes/ssl \
--pod-infra-container-image=registry.cn-hangzhou.aliyuncs.com/google-containers/pause-amd64:3.0"

修改完以后，重启服务发现正常


## k8s dashboard 安装和证书更新
https://www.cnblogs.com/xiajq/p/11322568.html


## Kubernetes的Deployment与ReplicaSet了解与基础操作
https://cloud.tencent.com/developer/article/1347201
Deployment是新一代用于Pod管理的对象，与Replication Controller相比，它提供了更加完善的功能，使用起来更加简单方便。

## 比较 Deployment 与 ReplicaSet
　　ReplicaSet 也是用来管理多个 Pod 的副本，那么 Deployment 和 ReplicaSet 的区别在哪里呢？
　　当我们创建了 Deployment 之后，实际上也创建了 ReplicaSet，所以说 Deployment 管理着 ReplicaSet（实际上 Deployment 比 ReplicaSet 有着更多功能）

#Deployment 管理着 ReplicaSet，因此当 Deployment 伸缩时，由它管理的 ReplicaSet 也会发生伸缩：

但反过来，如果我们直接伸缩 ReplicaSet，那么 Deployment 也会相应发生伸缩吗？答案是不会的。

kubectl  apply -f nginx-deployment.yaml

kubectl  rollout status deployments nginx-deployment

kubectl  edit deploy nginx-service

kubectl  rollout history deployment nginx-service

kubectl  rollout history deployment nginx-service --revision=2
kubectl  rollout history deployment nginx-service --revision=1
## 假设我们想回滚到上一个版本，上一个版本的版本号是 1，那么可以执行：

kubectl  rollout undo deployments nginx-service --to-revision=1

## k8s证书
https://www.cnblogs.com/centos-python/articles/11043570.html

## k8s 使用篇 - deployment
## https://my.oschina.net/u/914655/blog/1635492
## https://blog.csdn.net/weixin_34268753/article/details/89586977
Deployment管理Pods和ReplicaSets，提供声明式更新。和老的ReplicationController（命令式管理）对应，发展趋势是取代老的，所以后面也不会起文章单独讨论ReplicationController了。

```



# **项目实战**

## 000 LVS+Keepalive双机热备

```sh
## keepalived工作原理  https://www.cnblogs.com/xiangsikai/p/8436431.html
　　keepalived是集群管理中保证集群高可用的一个服务软件，其功能类似于heartbeat，用来防止单点故障。

　　keepalived是以VRRP协议为实现基础的，VRRP全称Virtual Router Redundancy Protocol，即虚拟路由冗余协议。

　　虚拟路由冗余协议，可以认为是实现路由器高可用的协议，即将N台提供相同功能的路由器组成一个路由器组，这个组里面有一个master和多个backup，master上面有一个对外提供服务的vip（该路由器所在局域网内其他机器的默认路由为该vip），master会发组播，当backup收不到vrrp包时就认为master宕掉了，这时就需要根据VRRP的优先级来选举一个backup当master。这样的话就可以保证路由器的高可用了。

　　keepalived主要有三个模块，分别是core、check和vrrp。core模块为keepalived的核心，负责主进程的启动、维护以及全局配置文件的加载和解析。check负责健康检查，包括常见的各种检查方式。vrrp模块是来实现VRRP协议的。


## 安装keepalived
yum -y install keepalived* ipvsadm
## 加载内核模块
modprobe ip_vs
## 备份配置文件
mv /etc/keepalived/keepalived.conf /etc/keepalived/keepalived.conf_bak

cat /etc/keepalived/keepalived.conf
global_defs {
    router_id LVS_TEST    #服务器名字
}

vrrp_instance VI_1 {
    state MASTER    #配置主备，备用机此配置项为BACKUP
    interface enp0s3    #指定接口
    virtual_router_id 51    #指定路由ID，主备必须一样
    priority 101    #设置优先级，主略高于备份
    advert_int 1    #设置检查时间
    authentication {
        auth_type PASS    #设置验证加密方式
        auth_type 1234    #设置验证密码
    }
    virtual_ipaddress {
        192.168.31.200
    }
}

virtual_server 192.168.31.200 80 {
    delay_loop 3    #健康检查时间
    lb_algo rr    #LVS调度算法
    lb_kind DR   #LVS工作模式
    !persistence 60    #是否保持连接，！不保持
    protocol TCP    #服务采用TCP协议
    real_server 192.168.31.113 80 {
        weight 1    #权重
        TCP_CHECK {    #TCP检查
            connect_port 80   #检查端口80
            connect_timeout 3    #超时时间3秒
            nb_get_retry 3    #重试次数3次
            delay_before_retry 4    #重试间隔4秒
        }
    }
    real_server 192.168.31.150 80 {
        weight 1
        TCP_CHECK {
            connect_port 80
            connect_timeout 3
            nb_get_retry 3
            delay_before_retry 4
        }
    }
}


## 启动keepalived
systemctl restart keepalived && systemctl enable keepalived
```

## 001 haproxy+keepalived 基于四层

```sh
## https://www.cnblogs.com/MacoLee/p/5853356.html

 HAProxy的balance8种负载均衡算法：
   1.roundrobin : 基于权重轮循。
   2.static-rr : 基于权重轮循。静态算法，运行时改变无法生效
   3.source : 基于请求源IP的算法。对请求的源IP进行hash运算，然后将结果与后端服务器的权重总数想除后转发至某台匹配服务器。使同一IP客户端请求始终被转发到某特定的后端服务器。
   4.leastconn : 最小连接。（适合数据库负载均衡，不适合会话短的环境） 
   5.uri : 对部分或整体URI进行hash运算，再与服务器的总权重想除，最后转发到匹配后端。
   6.uri_param : 根据URL路径中参数进行转发，保证在后端服务器数量不变的情况下，同一用户请求分发到同一机器。
   7.hdr(<name>) : 根据http头转发，如果不存在http头。则使用简单轮循。
```



## 002 nginx+keepalived 基于七层

```sh
## 
```





## 003 vue+git+docker+jenkins cicd 

https://www.cnblogs.com/xiao987334176/p/12345304.html

## 004 Jenkins+Gitlab+Harbor+Rancher+k8s 

https://www.cnblogs.com/xiao987334176/p/13074198.html

## 005 Docker通过EFK（Elasticsearch + Fluentd + Kibana）

https://www.cnblogs.com/xiao987334176/p/12376980.html

## 006 基于docker 搭建Prometheus+Grafana
```ini
https://www.cnblogs.com/xiao987334176/p/9930517.html
## 几点思考
1、node 主机的自动发现，端口自动发现
2、redis 自动发现
3、mysql 自动发现
4、alertmanager 
```


# 附： tips

## 001 时间格式化

```python
import datetime
#获得当前时间
now = datetime.datetime.now()  ->这是时间数组格式
#转换为指定的格式:
otherStyleTime = now.strftime("%Y%m%d_%H%M%S")

import time
now_time = time.strftime('%Y-%m-%d %H:%M:%S')

## bash
Now_Time=`(date +%Y%m%d%H%M%S)`
NowStamp=`(date +%s)`
echo "当前时间和当前时间戳" $Now_Time $NowStamp
```

## 002 check_url.sh

```sh
#!/bin/bash
####################################################
# Author: channel
# Github: https://github.com/yes5144
# Time: 2018-03-10 16:05:56# Version: V1.0
# Description: This is just a test scripts
####################################################
. /etc/init.d/functions
check_count=0
url_list=(http://www.baidu.com http://192.168.204.123 http://www.google.cn)
function wait(){
    echo -n 'after 3 seconds, check url.'
    for ((i=0;i<3;i++))
    do
        echo -n "."; sleep 1
    done
    echo ''
}

function check_url(){
    wait
    for ((i=0; i<`echo ${#url_list[*]}`; i++))
    do
        wget -o /dev/null -T 3 --tries=1 --spider ${url_list[$i]} >/dev/null 2>&1
        if [ $? -eq 0 ]
        then
            action "${url_list[$i]}" /bin/true
        else
            action "${url_list[$i]}" /bin/false
        fi
    done
    echo ''
    ((check_count++))
}

main(){
    while true
    do
        check_url
        echo -e "\033[32m------- check count: ${check_count}-------\033[0m"
        sleep 10
    done
}

main

```



## 003 正则表达式（样例）

```sh
## sed正则表达式
sed -e 's/:\+\s\+/:/' -e 's/ /_/g' -e '/^$/d' -e 's/[(%)]//g' -e '/^1/d' -e 's/[(*)]//g' /tmp/${RAND}.sql_out.temp > /tmp/${RAND}.sql_out.temp.1
## 后面还有一行：
sed -ni 'H;${x;s/\n/ /g;p}' /tmp/${RAND}.sql_out.temp.1 

-e 's/:\+\s\+/:/' -e 's/ /_/g' 把每一行 第一次出现的 "连续 n 个 : 及 后面的m个空格" 替换成 : , 再把这一行中剩余的类似匹配内容替换成 _ , 其中 n >= 1, m>=1
比如如果某行的内容是sss:: ppp: MMM则替换后变成sss:ppp_MMM

## 然后
-e '/^$/d'删除空行
## 然后
-e 's/[(%)]//g' 把每行出现的 ( 或者 % 或者 ) 字符全部删除,
比如abc()% 被替换成 abc
## 然后
-e '/^1/d' 将 以字符 1 开头的行删除
## 最后
-e 's/[(*)]//'把每行第一次出现的 ( 或者 * 或者 ) 字符删除.

注意,上面的每一个 -e 命令处理的对象都是前一条 -e 命令处理完后的结果.
所以假定有一个文件内容为
abc #unchanged line
sss:: ppp: (M%MM)zzz :::: end # change to sss:ppp_MMMzzz_end
1me #this line will be deleted
2123(* #change to 2123
end of file #unchanged

## 经过上面的命令后,变成
abc #unchanged line
sss:ppp_M%MMzzz _end # change to sss:ppp_MMMzzz _end
2123 #change to 2123
end of file #unchanged



Now_Time=`(date +%Y%m%d%H%M%S)`
NowStamp=`(date +%s)`
echo "当前时间和当前时间戳" $Now_Time $NowStamp

#grep
grep -E '([0-9]{1,}\.){3,}([0-9]{1,})' version*.txt  --color
#sed
sed -i "s/\(\([0-9]\{1,\}\.\)\{3,\}\)\([0-9]\{1,\}\)/\1${Now_Time}/g" version*.txt
```



## 004 sh_echo_colorful.sh

```sh
echo_r () {
    [ $# -ne 1 ] && return 0
    echo -e "\033[31m$1\033[0m"
}
echo_g () {
    [ $# -ne 1 ] && return 0
    echo -e "\033[32m$1\033[0m"
}
echo_y () {
    [ $# -ne 1 ] && return 0
    echo -e "\033[33m$1\033[0m"
}
echo_b () {
    [ $# -ne 1 ] && return 0
    echo -e "\033[34m$1\033[0m"
}

export PS1="\[$(tput bold)$(tput setab 0)$(tput setaf 1)\][\u@\h \W]# \[$(tput sgr0)\]"

PS1='\[\e[37;1m\][\[\e[31;1m\]\u\[\e[34;1m\]@\[\e[32;1m\]\h \[\e[31;1m\]\w \[\e[33;1m\]\t\[\e[37;1m\]]\[\e[32;1m\]\$ \[\e[m\]'
```

### 004 shell log

```sh
#/bin/bash
sys_log="./test_log.log"

# func of log
#定义了三个级别的日志

function log_info()
{
  local format_date=`date +%Y%m%d_%H%M%S`
  local para=$1
  echo "${format_date} [info] $1" >> $sys_log
}

function log_warn()
{
  local format_date=`date +%Y%m%d_%H%M%S`
  local para=$1
  echo "${format_date} [warn] $1" >> $sys_log
}

function log_err()
{
  local format_date=`date +%Y%m%d_%H%M%S`
  local para=$1
  echo "${format_date} [err] $1" >> $sys_log
}

#log_err "wo shi err"
#log_info "wo shi info info"
#log_warn "wo shi warn"
```



## 005 wireshark和Fiddler抓包

```ini
Fiddler是在windows上运行的程序，专门用来捕获HTTP，HTTPS的。

wireshark能获取HTTP，也能获取HTTPS，但是不能解密HTTPS，所以wireshark看不懂HTTPS中的内容

总结，如果是处理HTTP,HTTPS 还是用Fiddler,  其他协议比如TCP,UDP 就用wireshark
https://www.cnblogs.com/TankXiao/archive/2012/10/10/2711777.html
https://www.cnblogs.com/TankXiao/archive/2012/02/06/2337728.html

https://my.oschina.net/u/658658/blog/417739

## Wireshark抓包分析——TCP/IP协议https://zhuanlan.zhihu.com/p/53338327
## Fiddler抓取Android真机上的HTTPS包https://www.cnblogs.com/taojietx/p/7286703.html
## Fiddler抓包工具总结https://www.cnblogs.com/yyhh/p/5140852.htmlhttps://www.dell.com/community/%E7%BB%BC%E5%90%88%E8%AE%A8%E8%AE%BA%E5%8C%BA/%E7%BD%91%E7%BB%9C%E5%9F%BA%E6%9C%AC%E5%8A%9F%E7%B3%BB%E5%88%97-%E7%BB%86%E8%AF%B4%E7%BD%91%E7%BB%9C%E9%82%A3%E4%BA%9B%E4%BA%8B%E5%84%BF-3%E6%9C%8826%E6%97%A5%E6%9B%B4%E6%96%B0/td-p/7045185

## wireshark包过滤
ip.src==192.168.1.102 or ip.dst==192.168.1.102

1 过滤IP，如来源IP或者目标IP等于某个IP
如前面说的例子： ip.src==192.168.1.102 or ip.dst==192.168.1.102
比如TCP，只显示TCP协议。
2 过滤端口
tcp.dstport == 80 // 只显tcp协议的目标端口80
tcp.srcport == 80 // 只显tcp协议的来源端口80
也可以写成tcp.port eq 80 or udp.port eq 80 这样的模式
3 过滤协议
单独写上tcp、udp、xml、http就可以过滤出具体协议的报文。你也可以用tcp or xml这样格式来过滤。
我们还可以更加具体过滤协议的内容，如tcp.flags.syn == 0x02 表示显示包含TCP SYN标志的封包。
4 过滤mac地址
eth.src eq A0:00:00:04:C5:84 // 过滤来源mac地址
eth.dst==A0:00:00:04:C5:84 // 过滤目的mac地址
5 http模式过滤
http.request.method == "GET"
http.request.method == "POST"
http.request.uri == "/img/logo-edu.gif"
http contains "GET"
http contains "HTTP/1."
// GET包
http.request.method == "GET" && http contains "Host: "
http.request.method == "GET" && http contains "User-Agent: "
// POST包
http.request.method == "POST" && http contains "Host: "
http.request.method == "POST" && http contains "User-Agent: "
// 响应包
http contains "HTTP/1.1 200 OK" && http contains "Content-Type: "
http contains "HTTP/1.0 200 OK" && http contains "Content-Type: "
6 过滤内容
contains：包含某字符串
ip.src==192.168.1.107 and udp contains 02:12:21:00:22
ip.src==192.168.1.107 and tcp contains "GET"
前面也有例子，http contains "HTTP/1.0 200 OK" && http contains "Content-Type: "

https://blog.csdn.net/u014530704/article/details/78842000

## 抓包
tcpdump -i ens33  host gc.hgame.com

https://blog.csdn.net/weixin_40576010/article/details/99335491
https://www.cnblogs.com/centos2017/p/7896658.html

```

### 005 抓包mimtproxy

```ini
https://www.cnblogs.com/ITXiaoAng/p/11777060.html#%E4%B8%89%EF%BC%9A%E6%8A%93%E5%8C%85%E5%B7%A5%E5%85%B7mitmproxy%E5%85%8D%E8%B4%B9%E7%9A%84

https://www.cnblogs.com/grandlulu/p/9525417.html

https://blog.csdn.net/freeking101/article/details/83901842

https://www.jianshu.com/p/0eb46f21fee9
```

### 005 tcpdump命令

```sh
tcpdump -i eth0 -s 0 -l
tcpdump -i eth0 -s 0 -l -w - |strings

tcpdump -i ens33  host gc.hgame.com
tcpdump -i eth0 -s 0 -l -w a.pcap src host 192.168.2.191 or dst host 192.168.2.191 

####
## 1.3 常用场景

### 1、获取10.1.85.21和10.1.85.19之间的通信，使用命令注意转义符号。
tcpdump host 10.1.85.21 and \( 10.1.85.19\) -i ens5f0 -nn -c 10

### 2、获取从10.1.85.21发来的包。
tcpdump src host 10.1.85.21 -c 10 -i ens5f1

### 3、监听tcp（udp）端口。
tcpdump tcp port 22 -c 10

### 4、获取主机10.1.85.21和除10.1.85.19之外所有主机的通信。
tcpdump ip host 10.1.85.21 and ! 10.1.85.19 -c 10 -i any

### 5、获取从10.1.85.19且端口主机到10.1.85.21主机的通信。

tcpdump src host 10.1.85.19 and src port 48565 and dst host 10.1.85.21 and dst port 5090 -i any -c 10 -nn


#################3
### 6、抓取所有经过 en0，目的或源地址是 10.37.63.255 的网络数据：
tcpdump -i en0 host 10.37.63.255

### 7、抓取主机10.37.63.255和主机10.37.63.61或10.37.63.95的通信：
tcpdump host 10.37.63.255 and \(10.37.63.61 or 10.37.63.95 \)

### 8、抓取主机192.168.13.210除了和主机10.37.63.61之外所有主机通信的数据包：
tcpdump -n host 10.37.63.255 and ! 10.37.63.61

### 9、抓取主机10.37.63.255除了和主机10.37.63.61之外所有主机通信的ip包
tcpdump ip -n host 10.37.63.255 and ! 10.37.63.61

### 10、抓取主机10.37.63.3发送的所有数据：
tcpdump -i en0 src host 10.37.63.3 （注意数据流向）

### 11、抓取主机10.37.63.3接收的所有数据：
tcpdump -i en0 dst host 10.37.63.3 （注意数据流向） 

### 12、抓取主机10.37.63.3所有在TCP 80端口的数据包：
tcpdump -i en0 host 10.37.63.3 and tcp port 80

### 13、抓取HTTP主机10.37.63.3在80端口接收到的数据包：
tcpdump -i en0 host 10.37.63.3 and dst port 80

### 14、抓取所有经过 en0，目的或源端口是 25 的网络数据
tcpdump -i en0 port 25
tcpdump -i en0 src port 25 # 源端口
tcpdump -i en0 dst port 25网络过滤 # 目的端口

### 15、抓取所有经过 en0，网络是 192.168上的数据包
tcpdump -i en0 net 192.168
tcpdump -i en0 src net 192.168
tcpdump -i en0 dst net 192.168
tcpdump -i en0 net 192.168.1
tcpdump -i en0 net 192.168.1.0/24

### 16、协议过滤
tcpdump -i en0 arp
tcpdump -i en0 ip
tcpdump -i en0 tcp
tcpdump -i en0 udp
tcpdump -i en0 icmp

### 17、抓取所有经过 en0，目的地址是 192.168.1.254 或 192.168.1.200 端口是 80 的 TCP 数据
tcpdump -i en0 '((tcp) and (port 80) and ((dst host 192.168.1.254) or (dst host 192.168.1.200)))'

### 18、抓取所有经过 en0，目标 MAC 地址是 00:01:02:03:04:05 的 ICMP 数据
tcpdump -i eth1 '((icmp) and ((ether dst host 00:01:02:03:04:05)))'

### 19、抓取所有经过 en0，目的网络是 192.168，但目的主机不是 192.168.1.200 的 TCP 数据
tcpdump -i en0 '((tcp) and ((dst net 192.168) and (not dst host 192.168.1.200)))'

### 20、只抓 SYN 包
tcpdump -i en0 'tcp[tcpflags] = tcp-syn'

### 21、抓 SYN, ACK
tcpdump -i en0 'tcp[tcpflags] & tcp-syn != 0 and tcp[tcpflags] & tcp-ack != 0'

### 22、抓 SMTP 数据，抓取数据区开始为"MAIL"的包，"MAIL"的十六进制为 0x4d41494c
tcpdump -i en0 '((port 25) and (tcp[(tcp[12]>>2):4] = 0x4d41494c))'

### 23、抓 HTTP GET 数据，"GET "的十六进制是 0x47455420
tcpdump -i en0 'tcp[(tcp[12]>>2):4] = 0x47455420'

# 0x4745 为"GET"前两个字母"GE",0x4854 为"HTTP"前两个字母"HT"
tcpdump  -XvvennSs 0 -i en0 tcp[20:2]=0x4745 or tcp[20:2]=0x4854

### 24、抓 SSH 返回，"SSH-"的十六进制是 0x5353482D
tcpdump -i en0 'tcp[(tcp[12]>>2):4] = 0x5353482D'

# 抓老版本的 SSH 返回信息，如"SSH-1.99.."
tcpdump -i en0 '(tcp[(tcp[12]>>2):4] = 0x5353482D) and (tcp[((tcp[12]>>2)+4):2] = 0x312E)'

### 25、抓 DNS 请求数据
tcpdump -i en0 udp dst port 53

### 26、用-c 参数指定抓多少个包
time tcpdump -nn -i en0 'tcp[tcpflags] = tcp-syn' -c 10000 > /dev/null

上面的命令计算抓 10000 个 SYN 包花费多少时间，可以判断访问量大概是多少。

### 27、实时抓取端口号8000的GET包，然后写入GET.log
tcpdump -i en0 '((port 8000) and (tcp[(tcp[12]>>2):4]=0x47455420))' -nnAl -w /tmp/GET.log

作者：道无虚
链接：https://www.jianshu.com/p/23427a80fc9d

作者：猿码架构
链接：https://www.jianshu.com/p/a62ed1bb5b20

```



## 006

## 007 压测
### 007 redis压测

```sh
## redis压测
redis-cli --latency -h `host` -p `port`
redis-cli --latency -h 10.10.10.210 -p 7379

INFO commandstats 
```

### 007 nginx压测

```sh
bin/wrk -c30 -t1 -s conf/nginx_log.lua http://localhost:8095

ab -n 1000 -c 100 http://www.load_balance.com/buy/ticket

## 配置负载均衡
upstream load_rule {
       server 127.0.0.1:3001 weight=1;
       server 127.0.0.1:3002 weight=2;
       server 127.0.0.1:3003 weight=3;
       server 127.0.0.1:3004 weight=4;
    }
    ...
server {
    listen       80;
    server_name  load_balance.com www.load_balance.com;
    location / {
       proxy_pass http://load_rule;
    }
}

统计日志中的结果，3001-3004 端口分别得到了 100、200、300、400 的请求量。这和我在 Nginx 中配置的权重占比很好的吻合在了一起，并且负载后的流量非常的均匀、随机。


```



## 008 虚拟内存使用排行

```sh
for i in `cd /proc;ls |grep "^[0-9]"|awk ' $0 >100'` ;do awk '/Swap:/{a=a+$2}END{print '"$i"',a/1024"M"}' /proc/$i/smaps ;done |sort -k2nr|head

for file in /proc/*/status ; do awk '/VmSwap|Name|^Pid/{printf $2 " " $3}END{ print ""}' $file; done | sort -k 3 -n -r | head


free -m

sync

echo 3 > /proc/sys/vm/drop_caches

free -m

swapoff -a

free -m

swapon -a

free -m
```

## 009 Linux端口预留

```sh
# 预留端口避免占用ip_local_reserved_ports
bl_ports=`egrep -o '=[0-9]{4,5}$'  /opt/www/*/*gs*/*server.conf |awk -F'=' '{print $NF}' |sort -n |uniq |xargs echo |sed 's/ /,/g'`
sysctl -w net.ipv4.ip_local_reserved_ports=$bl_ports


sysctl -w net.ipv4.ip_local_reserved_ports=11181,11281,12182
echo "39003"  > /proc/sys/net/ipv4/ip_local_reserved_ports
echo "39003,39004" >  /proc/sys/net/ipv4/ip_local_reserved_ports
echo "39003-39004"  > /proc/sys/net/ipv4/ip_local_reserved_ports
```



## 010 清空memcache

```sh
## 清空memcache
### https://blog.csdn.net/hadeys/article/details/6217472
echo "flush_all" | nc localhost 11211

```





## 011 redis 数据持久化

```sh
## Redis 五大数据类型有：
String 类型，Hash 类型，List 类型，Set 类型，Zset（Sortedset）类型。其中常用的是前三个


## 数据安全 aof, rdb
https://www.cnblogs.com/itdragon/p/7906481.html
Redis 默认开启RDB持久化方式，在指定的时间间隔内，执行指定次数的写操作，则将内存中的数据写入到磁盘中。
RDB 持久化适合大规模的数据恢复但它的数据一致性和完整性较差。
Redis 需要手动开启AOF持久化方式，默认是每秒将写操作日志追加到AOF文件中。
AOF 的数据完整性比RDB高，但记录内容多了，会影响数据恢复的效率。
Redis 针对 AOF文件大的问题，提供重写的瘦身机制。
若只打算用Redis 做缓存，可以关闭持久化。
若打算使用Redis 的持久化。建议RDB和AOF都开启。其实RDB更适合做数据的备份，留一后手。AOF出问题了，还有RDB


## 内存淘汰策略
实际上Redis定义了几种策略用来处理这种情况：
noeviction(默认策略)：对于写请求不再提供服务，直接返回错误（DEL请求和部分特殊请求除外）
allkeys-lru：从所有key中使用LRU算法进行淘汰
volatile-lru：从设置了过期时间的key中使用LRU算法进行淘汰
allkeys-random：从所有key中随机淘汰数据
volatile-random：从设置了过期时间的key中随机淘汰
volatile-ttl：在设置了过期时间的key中，根据key的过期时间进行淘汰，越早过期的越优先被淘汰

作者：千山qianshan
链接：https://juejin.im/post/6844903927037558792
来源：掘金
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。


## 缓存雪崩， 缓存穿透， 缓存
```





## 012 python常用pip模块

```ini
cat  /root/.pip/pip.conf
[global]
index-url = http://mirrors.aliyun.com/pypi/simple/
[install]
trusted-host=mirrors.aliyun.com

## 运维
os, commands, subprocess, logging, Jinja2, PyMySQL, redis, 

## 爬虫
requests, bs4, selenium, pyquery

## 框架
django, flask, fastapi, 
```

### 012 pip使用指定源

```ini
pip install flask

pip install -i http://pypi.douban.com/simple/ --trusted-host=pypi.douban.com/simple ipython

## linux 添加pip源
cat  ~/.pip/pip.conf
[global]
index-url = http://mirrors.aliyun.com/pypi/simple/
[install]
trusted-host=mirrors.aliyun.com
```





## 013 npm or yarn

```sh
https://www.cnblogs.com/xifengxiaoma/tag/vue/

https://www.cnblogs.com/xifengxiaoma/p/9533018.html
npm install  => yarn install
npm install --save [package] => yarn add [package]
npm install --save-dev [package] => yarn add [package] --dev
npm install --global [package] => yarn global add [package]
npm uninstall --save [package] => yarn remove [package]
npm uninstall --save-dev [package] => yarn remove [package]


yarn add sass-loader node-sass --dev

<style lang="scss">

</style>

yarn add mockjs --dev

```





## 014 查看zip包里面的文件和大小

```python
#!/usr/bin/env python
import zipfile
z = zipfile.ZipFile("test.zip","r")
for filename in z.namelist():
  print 'File:',filename,
  bytes = z.read(filename)
  print 'has',len(bytes),'bytes'

```



## 015 日志切割logrotate

```ini
rpm -qf  /etc/logrotate.conf
logrotate-3.7.8-26.el6_7.x86_64

/opt/log/nginx/*.log
{
    daily
    missingok
    rotate 1
    compress
    notifempty
    copytruncate
    dateext
    dateformat %Y-%m-%d
}
```





## 016 xxx




## 017 xxx

```sh

```


## 018 xxx

```sh

```


## 019 获取git commit id

```sh
https://blog.csdn.net/liurizhou/article/details/89234032

git log  --pretty="%s"  -2

git log  --pretty="%H"  -2
git log  --pretty="%h"  -2
```


## 020 访问url 分阶段展示耗时

```sh
# https://github.com/reorx/httpstat 
# 以前遇到了一台服务器请求某个api很慢，怀疑是dns但是没有证据，这下让他无处遁形
# wget https://raw.githubusercontent.com/reorx/httpstat/master/httpstat.py
pip install httpstat
python httpstat.py httpbin.org/get


```



## 021 MySQL binlog2sql 解析binlog

```ini
https://github.com/danfengcao/binlog2sql

## 
https://github.com/danfengcao/binlog2sql/blob/master/example/mysql-flashback-priciple-and-practice.md

## records
https://github.com/kennethreitz-archive/records
```



## 022 InnoDB 和MyISAM 不同点

```ini
MyISAM与InnoDB 的区别（9个不同点）

1. InnoDB支持事务，MyISAM不支持，对于InnoDB每一条SQL语言都默认封装成事务，自动提交，这样会影响速度，所以最好把多条SQL语言放在begin和commit之间，组成一个事务； 

2. InnoDB支持外键，而MyISAM不支持。对一个包含外键的InnoDB表转为MYISAM会失败
5. Innodb不支持全文索引，而MyISAM支持全文索引，在涉及全文索引领域的查询效率上MyISAM速度更快高；PS：5.7以后的InnoDB支持全文索引了

6. MyISAM表格可以被压缩后进行查询操作
7. InnoDB支持表、行(默认)级锁，而MyISAM支持表级锁
8、InnoDB表必须有主键（用户没有指定的话会自己找或生产一个主键），而Myisam可以没有
9、Innodb存储文件有frm、ibd，而Myisam是frm、MYD、MYI
        Innodb：frm是表定义文件，ibd是数据文件
        Myisam：frm是表定义文件，myd是数据文件，myi是索引文件

```



## 023 MySQL忘记密码

```ini
vim /etc/my.cnf
[mysqld]
skip-grant-tables

### MySQL5.6
UPDATE mysql.user SET Password = password('123456') WHERE User = 'root' ; 
### MySQL5.7
update mysql.user set authentication_string=password('123qwe') where user='root' and Host = 'localhost';

```



## 024  MySQL审计 yearning

```ini
## https://www.jianshu.com/p/c9c3aaaf6e0b
```



## 025 Waiting for table flush 阻塞查询的问题

```ini
## https://blog.csdn.net/donghaixiaolongwang/article/details/76099697
2、易引发这种情况的操作
慢查询+FLUSH TABLES tbl_name, ALTER TABLE, RENAME TABLE, REPAIR TABLE, ANALYZE TABLE, orOPTIMIZE TABLE  这些操作。

例如：比如在mysqldump、innobackupex进行备份时就很有可能引发这种情况。

3、解决方案
找出慢查询kill掉，并进行SQL优化防止再次引发。

4、预防措施
在业务高峰期不要对数据库进行FLUSH TABLES tbl_name, ALTER TABLE, RENAME TABLE, REPAIR TABLE, ANALYZE TABLE, orOPTIMIZE TABLE 这些操作。

备份、DDL语句等操作尽量避开业务高峰。
### 
SELECT CONCAT('kill  ',id,';') from PROCESSLIST WHERE state ='updating' and (info like "%xxxx_server_info%" and info like "update%") limit 50
```



## 026 mysql时间

```ini
## 1、当前日期
select DATE_SUB(curdate(),INTERVAL 0 DAY) ;
## 2、明天日期
select DATE_SUB(curdate(),INTERVAL -1 DAY) ;
## 3、昨天日期
select DATE_SUB(curdate(),INTERVAL 1 DAY) ;
## 4、前一个小时时间
select date_sub(now(), interval 1 hour);
## 5、后一个小时时间
select date_sub(now(), interval -1 hour);
## 6、前30分钟时间
select date_add(now(),interval -30 minute)
## 7、后30分钟时间
select date_add(now(),interval 30 minute)
## 8、取得当天：
SELECT curdate();
```




## 027


## 028


## 029


## 030


## 031


## 032


## 033


## 034


## 035


## 036


## 037


## 038


## 039


## 040


## 041


## 042


## 043


## 044


## 045


## 046


## 047


## 048


## 049

## 050 前端

```ini
## bootstrap
https://www.runoob.com/bootstrap/bootstrap-affix-plugin.html
https://www.w3cschool.cn/bootstrap/html-css-bootstrap-radiobutton.html

## jQuery 加载 json 数据
https://www.cnblogs.com/aademeng/articles/9788385.html

## jQuery 添加元素
https://www.runoob.com/jquery/jquery-dom-set.html

## ant-design
https://www.yuque.com/ant-design/course/wybhm9

## gin
https://book.eddycjy.com/golang/gin/log.html

## vue
https://github.com/opendigg/awesome-github-vue
```



## 051 vue动态菜单

```javascript
## https://www.cnblogs.com/woai3c/p/11052975.html

    <!-- 动态菜单 -->
    <div v-for="(item, index) in menuItems" :key="index">
        <Submenu v-if="item.children" :name="index">
            <template slot="title">
                <Icon :size="item.size" :type="item.type"/>
                <span v-show="isShowAsideTitle">{{item.text}}</span>
            </template>
            <div v-for="(subItem, i) in item.children" :key="index + i">
                <Submenu v-if="subItem.children" :name="index + '-' + i">
                    <template slot="title">
                        <Icon :size="subItem.size" :type="subItem.type"/>
                        <span v-show="isShowAsideTitle">{{subItem.text}}</span>
                    </template>
                    <MenuItem class="menu-level-3" v-for="(threeItem, k) in subItem.children" :name="threeItem.name" :key="index + i + k">
                        <Icon :size="threeItem.size" :type="threeItem.type"/>
                        <span v-show="isShowAsideTitle">{{threeItem.text}}</span>
                    </MenuItem>
                </Submenu>
                <MenuItem v-else v-show="isShowAsideTitle" :name="subItem.name">
                    <Icon :size="subItem.size" :type="subItem.type"/>
                    <span v-show="isShowAsideTitle">{{subItem.text}}</span>
                </MenuItem>
            </div>
        </Submenu>
        <MenuItem v-else :name="item.name">
            <Icon :size="item.size" :type="item.type" />
            <span v-show="isShowAsideTitle">{{item.text}}</span>
        </MenuItem>
    </div>
```




## 052


## 053


## 054


## 055


## 056


## 057


## 058


## 059

## 060 python 第三方包制作

```ini
## Python 第三方包制作教程
https://www.cnblogs.com/streakingBird/p/4056765.html

https://www.jianshu.com/p/19f1e564a29d
https://www.cnblogs.com/panwenbin-logs/p/13219332.html
https://www.jianshu.com/p/c6055e8873ee

Django 中使用 ajax 请求的正确姿势

## git 0基础入门—git入门与实践（1）—详细图解git安装详情及超详细的入门介绍！（2020.06.30更新）
https://blog.csdn.net/u013946061/article/details/107023191
git config --globe user.email “xxx@example.com”
--globe 代表全局设置，即设置一次就够了。
git config --globe user.name "张三"

git config --global -l

git commit -a -m "描述" 从工作目录提交到暂存区后，直接提交

## golang prometheus
### Go开发属于自己的exporter
https://blog.csdn.net/weixin_45413603/article/details/107024467
### 使用golang编写Prometheus Exporter
https://blog.csdn.net/u014029783/article/details/80001251
### prometheus数据采集exporter全家桶
https://blog.csdn.net/weixin_34212189/article/details/91673377

名称.(type)用于类型查询,
名称.(具体类型)用于类型转换

## Google Protobuf简明教程
https://www.jianshu.com/p/b723053a86a6

## python 操作protobuf
https://www.jianshu.com/p/091b99beb6bc

```



## 061 python 'is' 和 '==' 区别

```ini
https://www.cnblogs.com/CheeseZH/p/5260560.html

在讲is和==这两种运算符区别之前，首先要知道Python中对象包含的三个基本要素，分别是：id(身份标识)、type(数据类型)和value(值)。
1, is 是进行id的比较，== 是进行value的比较。
2, 只有数值型情况下is和==可通用，当字符串中包含非数字或字母字符时，值比较就不能用is只能用==了。

我们在检查 a is b 的时候，其实相当于检查 id(a) == id(b)。而检查 a == b 的时候，实际是调用了对象 a 的 __eq()__ 方法，a == b 相当于 a.__eq__(b)。

Python里和None比较时，为什么是 is None 而不是 == None 呢？

这是因为None在Python里是个单例对象，一个变量如果是None，它一定和None指向同一个内存地址。而 == None背后调用的是__eq__，而__eq__可以被重载，下面是一个 is not None但 == None的例子

连接字符串的时候可以用join也可以用+，但这两者有没有区别呢？
join的性能明显好于+。这是为什么呢？
而join在连接字符串的时候，会先计算需要多大的内存存放结果，然后一次性申请所需内存并将字符串复制过去，这是为什么join的性能优于+的原因。所以在连接字符串数组的时候，我们应考虑优先使用join。

https://zhuanlan.zhihu.com/p/93775624
```

#### 061 python 深浅拷贝

```ini
浅拷贝和深拷贝的区别是：浅拷贝只是将原对象在内存中引用地址拷贝

而深拷贝是将这个对象的所有内容拷贝过来了，包括值与内存地址
```



#### 061 python闭包

```python
# http://c.biancheng.net/view/5335.html
不过使用闭包，可以让程序变得更简洁易读。
# https://zhuanlan.zhihu.com/p/22229197
闭包：就是在一个外函数中定义了一个内函数，内函数里运用了外函数的临时变量，并且 外函数的返回值是内函数的引用。
闭包概念：在一个内部函数中，对外部作用域的变量进行引用，(并且一般外部函数的返回值为内部函数)，那么内部函数就被认为是闭包。
flist =[]
for i in xrange(3):
    def func(x):
        return x*i
    first.append(func)

for f in flist:
    print(f(2))

# 2
flist=[]
for i in xrange(3):
    def makefunc(i):
        def func(x):
            return x*i
        return func
    flist.append(makefunc(i))

for f in flist:
    print(f(2))

    
装饰器(本质就是闭包)：主要作用为已经存在的对象添加额外的功能，例如日志记录、数据校验等。
```

#### 061 python 生成器和迭代器

```ini

## 列表推导式

## django 字典推导式
kwargs ={key: request.POST.get(key) for key in ("motto","region","pic") if request.POST.get(key)}

```



#### 061 python 魔法

```ini
__init__我们很熟悉了,它在对象初始化的时候调用,我们一般将它理解为"构造函数".

__new__

```

#### 061 python 封装、继承和多态

```ini
dd
```



## 062 python 模块

```python
## 
```
#### 062 python多线/进程

> 在 Python 3.2 以后，concurrent.futures是内置的模块，我们可以直接使用。 如果你需要在 Python 2.7 中使用 concurrent.futures , 那么请用 pip 进行安装，
>
> pip install futures

```python
## https://www.cnblogs.com/huchong/p/7459324.html

from concurrent.futures import ProcessPoolExecutor
import os,time,random
def task(n):
    print('%s is running' %os.getpid())
    time.sleep(2)
    return n**2

if __name__ == '__main__':
    p=ProcessPoolExecutor()  #不填则默认为cpu的个数
    l=[]
    start=time.time()
    for i in range(10):
        obj=p.submit(task,i)   #submit()方法返回的是一个future实例，要得到结果需要用obj.result()
        l.append(obj)
        p.shutdown()        #类似用from multiprocessing import Pool实现进程池中的close及join一起的作用
        print('='*30)    # print([obj for obj in l])
        print([obj.result() for obj in l])
    print(time.time()-start)
    
    #上面方法也可写成下面的方法
    # start = time.time()
    # with ProcessPoolExecutor() as p:   #类似打开文件,可省去.shutdown()
    #     future_tasks = [p.submit(task, i) for i in range(10)]
    # print('=' * 30)
    # print([obj.result() for obj in future_tasks])
    # print(time.time() - start)

```

#### 062 re模块

```python
## re
import re
b = "<p>我是测试文本<br/></p><p>我是测试文本\n  \n<br/></p>"
c = re.sub('<[^<]+?>', '', b).replace('\n', '').strip()
print(c)

d = re.findall(r'p>(.*?)</p', b, re.S)
print(d)
```



## 063 API的调用

```ini
##
```

#### 063 salt-api

```ini

```

#### 063 es-api

```ini

```

#### 063 zabbix-api

```ini

```



## 064 shutil压缩处理

```sh
#shutil 对压缩包的处理是调用 ZipFile 和 TarFile 两个模块来进行的，详细：

#zipfile 压缩解压
# https://www.cnblogs.com/xiangsikai/p/7787101.html

import zipfile

# 压缩
z = zipfile.ZipFile('laxi.zip', 'w')
z.write('a.log')
z.write('data.data')
z.close()

# 解压
z = zipfile.ZipFile('laxi.zip', 'r')
z.extractall()
z.close()
```




## 065


## 066


## 067


## 068


## 069

## 070 golang 

```ini
## aliyun tools
https://help.aliyun.com/learn/tool.html

## Go类型专题总结
https://blog.csdn.net/YongYu_IT/article/details/90711434

## Go的&*
https://blog.csdn.net/fujian9544/article/details/100110011

## Golang 中的指针 - Pointer
https://blog.csdn.net/weixin_30323961/article/details/96412686

## [日常] Go语言圣经-Slice切片习题
https://www.cnblogs.com/taoshihan/p/8797499.html

https://www.cnblogs.com/majianguo/p/8186429.html
```




## 071


## 072


## 073


## 074


## 075


## 076


## 077


## 078


## 079


## 080  jvm内存优化

```ini

堆(Heap)和非堆(Non-heap)内存
    按照官方的说法：“Java 虚拟机具有一个堆，堆是运行时数据区域，所有类实例和数组的内存均从此处分配。堆是在 Java 虚拟机启动时创建的。”“在JVM中堆之外的内存称为非堆内存(Non-heap memory)”。可以看出JVM主要管理两种类型的内存：堆和非堆。简单来说堆就是Java代码可及的内存，是留给开发人员使用的；非堆就是JVM留给 自己用的，所以方法区、JVM内部处理或优化所需的内存(如JIT编译后的代码缓存)、每个类结构(如运行时常数池、字段和方法数据)以及方法和构造方法 的代码都在非堆内存中。
堆内存分配
    JVM初始分配的内存由-Xms指定，默认是物理内存的1/64；JVM最大分配的内存由-Xmx指 定，默认是物理内存的1/4。默认空余堆内存小于40%时，JVM就会增大堆直到-Xmx的最大限制；空余堆内存大于70%时，JVM会减少堆直到 -Xms的最小限制。因此服务器一般设置-Xms、-Xmx相等以避免在每次GC 后调整堆的大小。
非堆内存分配
    JVM使用-XX:PermSize设置非堆内存初始值，默认是物理内存的1/64；由XX:MaxPermSize设置最大非堆内存的大小，默认是物理内存的1/4。
JVM内存限制(最大值)
    首先JVM内存限制于实际的最大物理内存(废话！呵呵)，假设物理内存无限大的话，JVM内存的最大值跟操作系统有很大的关系。简单的说就32位处理器虽然 可控内存空间有4GB,但是具体的操作系统会给一个限制，这个限制一般是2GB-3GB（一般来说Windows系统下为1.5G-2G，Linux系统 下为2G-3G），而64bit以上的处理器就不会有限制了。
    
https://blog.csdn.net/cutesource/article/details/5907418
## tomcat优化
https://www.cnblogs.com/jojoword/p/10835112.html
```


## 081  jar Illegal key size

```ini
报错描述：java.security.InvalidKeyException: Illegal key size
原因分析：JRE中自带的“local_policy.jar ”和“US_export_policy.jar”是支持128位密钥的加密算法，而当我们要使用256位密钥算法的时候，已经超出它的范围，无法支持

解决方案：1、## https://blog.csdn.net/dling8/article/details/84061948
          2、升级jdk，比如 java version "1.8.0_74" 升级到 java version "1.8.0_261"

参考链接：https://stackoverflow.com/questions/6481627/java-security-illegal-key-size-or-default-parameters

摘要说明：Make sure you use the latest version of JDK/JRE.
In my case, I had put JCE into JRE folder, but it didn't help. It happened because I was running my project from the IDE directly (using JDK).
Then I updated my JDK and JRE to the latest version (1.8.0_211) and the problem had gone.
```


## 082


## 083


## 084


## 085


## 086


## 087


## 088


## 089

## 090 阿里云 k8s

```ini
阿里云 k8s

ACK 容器服务Kubernetes版
ASK 

ACR 容器镜像服务（Alibaba Cloud Container Registry）

ECI 弹性容器实例ECI


高可用

自动扩容 缩容
https://help.aliyun.com/learn/tool.html
```




## 091


## 092


## 093

## 094

## 095


## 096

## 097 鸡汤几句

```ini
写计划或者一些鼓励自己的话贴在显示器上时时看到，做一条划掉一条，特别有成就感！

所以作为老板，他最希望的事就是自己能帮助到团队里每个员工，能为员工协调资源，能把控风险，掌控大局，最终把事情做好，这样老板自己也能出成绩得到晋升。

如果你能从个人的能力出发，变成了个人的竞争力，再进一步变成了企业的竞争力，这是一件喜闻乐见的事，也是领导想看到的。

你主动展现出愿意承担更多、学习更多的东西的意愿，老板才会把更多的责任交到你的手里面。

所以主动思考，抓住表达红利，你的想法才会得到组织支持和资源支持，相应的你自己也能够实现升职加薪。

凡事有交代，件件有着落，事事有回音

怎么做一个踏实靠谱的人呢？你应该做到凡事有交代, 件件有着落, 事事有回音

```

#### 097 鸡汤2

```ini
“我当时没什么自信”，回忆起来那段经历，他这样说。
既然改变已经发生了，那就尽力做好。没有自信，可以建立自信，没有武功，可以从零学起。

他在“绝情谷底”总结了三条生存法则：
1，不要多想，直接去做，反正也没有时间想别的；
2，不敢演讲，那就多练 ，反正客户等着，不讲也不行；
3，不断提高，那就多学，反正总有建（tiao）议（ti）和反（tu）馈（cao）。
他为自己设立了一个目标，一周演讲两次，这样一年下来就讲了三四十次。时间长了，突然有一天，他发现自己在人前讲话不紧张了。

那时感觉自己是被逼的，不过现在挺感谢逼我的人，当时在不确定的情况下我只想一件事情，那就是把手头的事情做好。做着做着就发现，原来我真的可以做的很好。

自信就这么来了。这个人叫格茸扎西。

作者：ThoughtWorks中国
链接：https://www.zhihu.com/question/48406009/answer/155374291
```



## 098 几个链接

```ini
## MySQL 三万字精华总结 + 面试100 问
https://www.jianshu.com/p/24e1179ef563

## 阿里巴巴为什么能抗住90秒100亿？
https://www.jianshu.com/p/f4a907fe1485

## 终于有人把 Docker 讲清楚了，万字详解！
https://www.jianshu.com/p/b650b5521d7d

## 当初我要是这么学习Nginx就好了！
https://www.jianshu.com/p/e90050dc89b6

## 高并发与高可用知识总结
https://www.cnblogs.com/xuwc/p/9138585.html

```

#### 098 高并发

```ini
高并发架构相关概念
https://www.cnblogs.com/-mrl/p/13234927.html

高并发解决方案
https://www.cnblogs.com/cn-sbo/p/10853469.html

java高并发解决方案
https://www.cnblogs.com/alex96/p/12152388.html

```



## 099 Github上有趣的100个python项目

```ini
## Github上有趣的100个python项目
https://www.jianshu.com/p/d74659727d26

## https://github.com/kennethreitz-archive/records

## https://github.com/hangsz/pandas-tutorial

## https://github.com/xianhu/LearnPython

## https://github.com/danfengcao/binlog2sql

## https://github.com/tldr-pages/tldr-python-client

## https://github.com/Delgan/loguru

```

## 100 运维技能0-1 设计落地方案
#### 100.1 linux安全

#### 100.2 linux 压测

#### 100.3 nginx 动态负载均衡

#### 100.4 k8s

#### 100.5 salt-ssh 实现批量安装salt-minion

#### 100.6 巡检模板



#### yd-mongo迁移到阿里云

```sh
## 几个概念
# databases, collection, ducument, index
# databases, table,  record, index
https://www.cnblogs.com/clsn/p/8244206.html
https://www.cnblogs.com/shaosks/p/9318209.html

## 备份
mongodump -h dbhost -d dbname -o dbdirectory
mongodump -h 192.168.1.18:27017 -d smp_maint_2 -o /opt/backup_data/mongo/momgodump
## 恢复
mongorestore -h dbhost -d dbname --dir dbdirectory  # xxx.bson的目录名
mongorestore -h 192.168.1.18:27017 -d smp_maint_2_restore --dir /opt/backup_data/mongo/momgodump/test


## 其他导入导出
#https://www.cnblogs.com/clsn/p/8244206.html
### 默认导出了JSON格式的数据
mongoexport -h 10.0.0.152:27017 -uroot -proot --authenticationDatabase admin -d app -c vast -o /home/mongod/backup/vasts.dat

mongoexport -h 10.0.0.152:27017 -uroot -proot --authenticationDatabase admin  -d app -c vast --type=csv -f id,name -o /home/mongod/backup/vast_csv.dat

mongoimport -h 10.0.0.152:27017 -uroot -proot --authenticationDatabase admin  -d app -c vast  --drop /home/mongod/backup/vasts.dat

mongoimport -h 10.0.0.152:27017 -uroot -proot --authenticationDatabase admin -d app -c vast --type=csv --headerline --file vast_csv.dat

## mongoexport/mongoimport与mongodump/mongorestore的对比
mongoexport/mongoimport导入/导出的是JSON格式，而mongodump/mongorestore导入/导出的是BSON格式。
JSON可读性强但体积较大，BSON则是二进制文件，体积小但对人类几乎没有可读性。
在一些mongodb版本之间，BSON格式可能会随版本不同而有所不同，所以不同版本之间用mongodump/mongorestore可能不会成功，具体要看版本之间的兼容性。当无法使用BSON进行跨版本的数据迁移的时候，使用JSON格式即mongoexport/mongoimport是一个可选项。跨版本的mongodump/mongorestore并不推荐，实在要做请先检查文档看两个版本是否兼容（大部分时候是的）。
JSON虽然具有较好的跨版本通用性，但其只保留了数据部分，不保留索引，账户等其他基础信息。使用时应该注意。
## 授权

## 分片
https://blog.csdn.net/tanga842428/article/details/52584770?locationNum=9&fps=1

```



#### yd-MySQL迁移到阿里云

#### yd-传统java应用上阿里k8s

#### yd-阿里云监控

