#### ssh配置文件
```
## 修改默认ssh端口
sed  -i 's@#Port 22@Port 60022@g' /etc/ssh/sshd_config
systemctl restart sshd

```
#### 系统最小化启动

#### 防火墙指定ip限制

#### ssh访问失败次数限制
```
cat  /bin/ssh_scan.sh 
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

## 加入定时任务
echo '####SSH_Failed_Access_Scan####' >>/etc/crontab
echo '*/1 * * * * root sh /bin/ssh_scan.sh' >> /etc/crontab

```

#### 安全扫描工具 - NMap
> NMap 是 Linux 下的网络连接扫描和嗅探工具包用来扫描网上电脑开放的网络连接端。
```
yum install nmap

nmap 10.1.3.20 
nmap -o 10.1.3.20 
```

#### 命令审计
```
https://blog.csdn.net/u010039418/article/details/81038744
```

#### 命令历史收集
```
## vim  /etc/profile # 文末追加
export PROMPT_COMMAND='logger -p local0.info "$(hostname -i) $(who am i |awk "{print \$1\" \"\$2\" \"\$3\" \"\$4\" \"\$5}") [`pwd`] $(history 1 | { read x cmd; echo "$cmd"; })"'

## 修改/etc/rsyslog.conf
local0.*    /var/log/bash.log

systemctl restart rsyslog
```

### 蜜罐 T-Pot
```
https://imlonghao.com/53.html

http://dtag-dev-sec.github.io/mediator/feature/2017/11/07/t-pot-17.10.html

https://cloud.tencent.com/developer/news/291825

```