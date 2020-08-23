## 自定义命令审查
```shell
## /etc/profile 添加
#export PROMPT_COMMAND='logger -p local0.info "$(ifconfig | grep -E "eth|em" -A 1 | grep "172.2" | grep -oP "(?<=inet )[\d\.]+") $(who am i |awk "{print \$1\" \"\$2\" \"\$3\" \"\$4\" \"\$5}") [`pwd`] $(history1 | { read x cmd; echo "$cmd"; })"'
export PROMPT_COMMAND='logger -p local0.info "$(hostname -i) $(who am i |awk "{print \$1\" \"\$2\" \"\$3\" \"\$4\" \"\$5}") [`pwd`] $(history 1 | { read x cmd; echo "$cmd"; })"'

## /etc/rsyslog.conf 添加
local0.*                                                /var/log/bash.log

```


#### top

#### 进程实时监控 - HTop

#### 实时监控磁盘 IO-IOTop
> IOTop 命令是专门显示硬盘 IO 的命令, 界面风格类似 top 命令。
```
yum install iotop
```

#### 系统资源监控 - NMON
> NMON 是一种在 AIX 与各种 Linux 操作系统上广泛使用的监控与分析工具
```
yum install nmon
```

#### 网络流量监控 - IFTop
> iftop 是类似于 linux 下面 top 的实时流量监控工具。比 iptraf 直观些。
```
yum install iftop 
```
#### 网络流量监控 - IPtraf
> IPtraf 是一个运行在 Linux 下的简单的网络状况分析工具。
```

```

#### 查看进程占用带宽情况 - Nethogs
> Nethogs 是一个终端下的网络流量监控工具可以直观的显示每个进程占用的带宽。
```
yum install nethogs
```