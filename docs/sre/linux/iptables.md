## iptables防火墙

## iptables最常用的规则示例
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



## iptables 四表五链
https://www.cnblogs.com/zhujingzhi/p/9706664.html

```sh
#!/bin/bash
/sbin/iptables -F
/sbin/iptables -X
/sbin/iptables -F -t nat
/sbin/iptables -X -t nat
/sbin/iptables -P INPUT ACCEPT
/sbin/iptables -P OUTPUT ACCEPT
/sbin/iptables -A INPUT -i lo -j ACCEPT
/sbin/iptables -A INPUT -s 192.168.0.0/24 -j ACCEPT
/sbin/iptables -A INPUT -s 192.168.0.0/24  -m state --state NEW -m tcp -p tcp --dport 10050 -j ACCEPT
/sbin/iptables -A INPUT -s 172.17.0.0/16 -j ACCEPT
/sbin/iptables -A INPUT -m state --state RELATED,ESTABLISHED -j ACCEPT
/sbin/iptables -A INPUT -p tcp -m state --state NEW -m tcp --dport 80 -j ACCEPT
/sbin/iptables -A INPUT -p tcp -m state --state NEW -m tcp --dport 443 -j ACCEPT
 
/sbin/iptables -A INPUT -p tcp -m state --state NEW -m tcp --dport 10240 -j ACCEPT
/sbin/iptables -t nat -A PREROUTING -i em1 -d 123.59.32.113 -p tcp --dport 10240 -j DNAT --to-destination 192.168.0.186:5011
 
/sbin/iptables -A INPUT -p tcp -m state --state NEW -m tcp --dport 808 -j ACCEPT
 
/sbin/iptables -A INPUT -s 123.120.0.0/16 -m state --state NEW -m tcp -p tcp --dport 22 -j ACCEPT
/sbin/iptables -A INPUT -s 123.120.0.0/16 -m state --state NEW -m tcp -p tcp --dport 22 -j ACCEPT
/sbin/iptables -A INPUT -s 114.248.0.0/16 -m state --state NEW -m tcp -p tcp --dport 22 -j ACCEPT
/sbin/iptables -A INPUT -s 221.222.0.0/16 -m state --state NEW -m tcp -p tcp --dport 22 -j ACCEPT
/sbin/iptables -A INPUT -s 192.168.0.0/24 -m state --state NEW -m tcp -p tcp --dport 22 -j ACCEPT
 
IPLIST="117.122.219.0/24 61.164.149.0/24 122.228.208.0/24 221.222.0.0/16 114.248.0.0/16 123.120.0.0/16 111.201.0.0/16"
for ip in ${IPLIST};do
        /sbin/iptables -A INPUT -s ${ip} -p tcp -m state --state NEW -m tcp --dport 5000:5100 -j ACCEPT
        /sbin/iptables -A INPUT -s ${ip} -p tcp -m state --state NEW -m tcp --dport 5600:5700 -j ACCEPT
done
nginx=`docker inspect --format '{{ .NetworkSettings.IPAddress }}' synginx`
/sbin/iptables  -t nat -A PREROUTING -d 123.59.32.113 -p tcp -m tcp --dport 80 -j DNAT --to-destination ${nginx}:80
/sbin/iptables -t nat -A POSTROUTING -s 172.17.0.0/16 ! -o docker0 -j MASQUERADE
/sbin/iptables -A INPUT -p ICMP  -j ACCEPT
/sbin/iptables -A INPUT -j DROP
```