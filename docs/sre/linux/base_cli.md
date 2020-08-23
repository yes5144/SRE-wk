## linux 入门
> 没有必要再去争论什么语言的优劣，一门语言只要存活下来，就一定有它的优势所在。
> 世界上只有烂代码，没有烂语言。还是那句话，语言没有三六九等之分，只有合适与否之别。什么是合适？合适就是性价比最好、综合得分最高的那个。

```sh
## 常用命令
ls
ls -lt
ls -Sh

cd
cd -

cp
cp -a  a_dir new_dir

mv

mkdir -p  /opt/apps/jenkins

touch  test_{00..11}.txt

rename

ps -ef|grep tomcat
lsof -i :8080
netstat -ntlp|grep 8080

zip -r name.zip dirname
## 查看zip包
unzip -v name.zip
unzip  name.zip
```

## tmux/screen终端复用
#### tmux 常用操作
```shell
yum install tmux 

tmux  # 默认创建一个会话，以数字命名
tmux ls

tmux new -s ccc   # 新创一个会话ccc命名
tmux ls

tmux a -t aaa     # 返回一个已知aaa会话
tmux detach       # 退出会话不是关闭

tmux kill-session -t bbb  # 关闭会话
tmux ls
```
#### screen 常用操作
```shell
yum install screen

screen -S yourname ## 新建一个叫yourname的session
screen -ls 			## 列出当前所有的session
screen -r yourname ## 回到yourname这个session
screen -d yourname ## 远程detach某个session
screen -d -r yourname ## 结束当前session并回到yourname这个session
```

## 系统监控常用
#### top 
https://www.cnblogs.com/ggjucheng/archive/2012/01/08/2316399.html
```sh
## https://www.cnblogs.com/ggjucheng/archive/2012/01/08/2316399.html
top c

top - 23:12:30 up 1 day,  1:55,  2 users,  load average: 0.00, 0.01, 0.05
Tasks: 113 total,   1 running, 112 sleeping,   0 stopped,   0 zombie
%Cpu0  :  0.0 us,  0.3 sy,  0.0 ni, 99.7 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
KiB Mem :  1865932 total,   154308 free,   612312 used,  1099312 buff/cache
KiB Swap:  2097148 total,  2097144 free,        4 used.  1008592 avail Mem

   PID USER      PR  NI    VIRT    RES    SHR S %CPU %MEM     TIME+ COMMAND
  1084 root      20   0  393776  28988  12496 S  0.3  1.6   2:15.06 docker-containerd --config /var/run/docker/containerd/containerd.toml
     1 root      20   0  125416   3816   2524 S  0.0  0.2   0:02.74 /usr/lib/systemd/systemd --switched-root --system --deserialize 21
     2 root      20   0       0      0      0 S  0.0  0.0   0:00.01 [kthreadd]
     3 root      20   0       0      0      0 S  0.0  0.0   0:00.79 [ksoftirqd/0]
     5 root       0 -20       0      0      0 S  0.0  0.0   0:00.00 [kworker/0:0H]
     7 root      rt   0       0      0      0 S  0.0  0.0   0:00.00 [migration/0]

#############
top   //每隔5秒显式所有进程的资源占用情况
top -d 2  //每隔2秒显式所有进程的资源占用情况
top -c  //每隔5秒显式进程的资源占用情况，并显示进程的命令行参数(默认只有进程名)
top -p 12345 -p 6789//每隔5秒显示pid是12345和pid是6789的两个进程的资源占用情况
top -d 2 -c -p 123456 //每隔2秒显示pid是12345的进程的资源使用情况，并显式该进程启动的命令行参数
```

#### 实时流量
https://www.cnblogs.com/ggjucheng/archive/2013/01/13/2858923.html
```sh
yum install sysstat
rpm -ql sysstat |grep bin  #查看rpm软件包里面的可执行文件
sar -n DEV 5 2             #命令后面 5 2 意思是：每5秒钟取一次值，取2次。


## https://www.cnblogs.com/ggjucheng/archive/2013/01/13/2858923.html
iftop是一款实时流量监控工具,监控TCP/IP连接等,缺点就是无报表功能。必须以root身份才能运行。
## 默认监控第一块网卡的流量
iftop
## 指定网卡eth1
iftop -i eth1

进入iftop画面后的一些操作命令(注意大小写)

按h切换是否显示帮助;

按n切换显示本机的IP或主机名;

按s切换是否显示本机的host信息;

按d切换是否显示远端目标主机的host信息;

按t切换显示格式为2行/1行/只显示发送流量/只显示接收流量;

按N切换显示端口号或端口服务名称;

按S切换是否显示本机的端口信息;

按D切换是否显示远端目标主机的端口信息;

按p切换是否显示端口信息;

按P切换暂停/继续显示;

按b切换是否显示平均流量图形条;

按B切换计算2秒或10秒或40秒内的平均流量;

按T切换是否显示每个连接的总流量;

按l打开屏幕过滤功能，输入要过滤的字符，比如ip,按回车后，屏幕就只显示这个IP相关的流量信息;

按L切换显示画面上边的刻度;刻度不同，流量图形条会有变化;

按j或按k可以向上或向下滚动屏幕显示的连接记录;

按1或2或3可以根据右侧显示的三列流量数据进行排序;

按<根据左边的本机名或IP排序;

按>根据远端目标主机的主机名或IP排序;

按o切换是否固定只显示当前的连接;

按f可以编辑过滤代码，这是翻译过来的说法，我还没用过这个！

按!可以使用shell命令，这个没用过！没搞明白啥命令在这好用呢！

按q退出监控。

```
#### 实时磁盘
https://www.cnblogs.com/mululu/p/5959362.html
```sh
## https://www.cnblogs.com/mululu/p/5959362.html
iostat -d -k 2 # 参数 -d 表示，显示设备（磁盘）使用状态；-k某些使用block为单位的列强制使用Kilobytes为单位；2表示，数据显示每隔2秒刷新一次。

iostat -d -x -k 1 10      # -x，该选项将用于显示和io相关的扩展数据。

iostat -d -k 1 10         #查看TPS和吞吐量信息(磁盘读写速度单位为KB)
iostat -d -m 2            #查看TPS和吞吐量信息(磁盘读写速度单位为MB)
iostat -d -x -k 1 10      #查看设备使用率（%util）、响应时间（await） 
iostat -c 1 10            #查看cpu状态
```

#### 1. shift位移
```shell
cat  shift.sh

#!/bin/bash
loop=`expr $(echo $#) / 2`
for i in $(seq 1 $loop)
do 
  echo $1 $2
	shift 2
done
## 如果传递的参数不是偶数，最后一位将被丢弃
```

## 文本三剑客
### grep
```sh
## grep
grep  -c  processor  /proc/cpuinfo
grep  -c  ^root  /etc/passwd*

grep  -i ^port  /etc/ssh/sshd_config

grep  -C1 ^Port  /etc/ssh/sshd_config
grep  -B1 ^Port  /etc/ssh/sshd_config
grep  -A1 ^Port  /etc/ssh/sshd_config

grep  -l ^root /etc/*  ## 显示文件

## 包含于排除
--include=GLOB;
--exclude=GLOB;
--exclude-from=FILE;
--exclude-dir=DIR;

grep  -l  ^root  --exclude=*-  /etc/*

## grep 匹配ip地址
grep -E -o "([0-9]{1,3}[\.]){3}[0-9]{1,3}"  xxx.log
grep -E    "([0-9]{1,3}[\.]){3}[0-9]{1,3}:[0-9]{4,9}" xxx.log

## 显示最后一行匹配
awk '/line/' a | tail -1;

sed -n '/line/p' a | sed -n '$p'
```

### sed
```sh
## sed
sed  -i.bak  EDIT-COMMAND  INPUT-FILE

[Address]s/Pattern/Replacement/FLAGs

sed  "3s/bird/cat/2"  text
sed  "1,3s/bird/cat/g"  text
sed  "/work/s/bird/cat/"  text
sed  "/work/,/push/s/bird/cat/g"  text

sed  "3i\cat"  text
sed  "3a\cat"  text
sed  "3c\cat"  text
sed  "3d"  text
sed  "3r /root/text2"  text  ## 在第三行下方将另一个文件text2的内容追加进去

sed  "3s/.*/cat &/"  text
sed  "3s/.*/& cat/"  text
```

### awk
```sh
## awk
## 统计
awk  /git/  /etc/shadow

awk  '/git/{n++} END {print n}'  /etc/shadow

## 获取某一列
ps -C  qemu-kvm
ps -C  qemu-kvm |awk '{if (NR==6) print $0}'

## 比较
awk  'BEGIN{a=2;b=10;print (a>b)?1:0}'
awk  'BEGIN{a="2";b="10";print (a>b)?1:0}'
awk  'BEGIN{a="2";b="1";print (a>b)?1:0}'

## 求和
ls -l |awk '!/total/ {sum+=$5;line+=1} END {printf "Sum = %d\nLines = %d\nAverage = %d\n", sum, line,sum/line}'

## 求最值
ls -l |awk '!/total/ {if(min=="") min=$5; if ($5<min) min=$5} END {print min}'

ls -l |awk '!/total/ {if(max=="") max=$5; if ($5>max) max=$5} END {print max}'

## 替换
df -Ph  ## 选项-P表示输出结果遵守POSIX标准，一行一个条目

df -Ph |awk '!/Filesystem/ {sub("%","",$5); if ($5>10) print}'
## sub替换函数看上去不太优雅，百分号被删除了。但是我们还可以使用+0方式做些改进
df -Ph |awk '!/Filesystem/  {if ($5+0>10) print}'

```

#### tcpdump
```sh
## -Nn 更详细
## -t 在每列倾倒资料上不显示时间戳记
tcpdump -i eth0 -nntvvv -S tcp port 21
## -X 十六进制
tcpdump -i eth0 -nn -X -S tcp port 21
```

#### ip地址排序
```sh
cat  ip |sort -n -t. -k1,1 -k2,2 -k3,3 -k4,4
```

做事有四种态度
做牛马--把工作当负担，糊弄着做。
做任务--把工作当差事，尽职做。
做产品--把工作当做市场价值，用心去做。
做品牌--把工作当做文化传承，注魂去做。

不得罪人的SE，不是一个好的SE。--坚守红线
只有优秀的SE，没有合格的SE。--精益求精

### 不解压缩，查看压缩包内文件列表
```sh
tar -ztvf file.tar.gz

tar.gz
tar tzvf xxx.tar.gz

tar.bz2
tar tjvf xxx.tar.bz2

zip
unzip -l xxx.zip  (简略模式)
unzip -v xxx.zip (详细模式)

rar
unrar l xxx.rar(简略模式)
unrar v xxx.rar(详细模式)

```
### linux压缩和解压缩命令大全
```
tar命令
　　解包：tar zxvf FileName.tar

　　打包：tar czvf FileName.tar DirName

gz命令
　　解压1：gunzip FileName.gz

　　解压2：gzip -d FileName.gz

　　压缩：gzip FileName

　　.tar.gz 和 .tgz

　　解压：tar zxvf FileName.tar.gz

　　压缩：tar zcvf FileName.tar.gz DirName

   压缩多个文件：tar zcvf FileName.tar.gz DirName1 DirName2 DirName3 ...

bz2命令
　　解压1：bzip2 -d FileName.bz2

　　解压2：bunzip2 FileName.bz2

　　压缩： bzip2 -z FileName

　　.tar.bz2

　　解压：tar jxvf FileName.tar.bz2

　　压缩：tar jcvf FileName.tar.bz2 DirName

bz命令
　　解压1：bzip2 -d FileName.bz

　　解压2：bunzip2 FileName.bz

　　压缩：未知

　　.tar.bz

　　解压：tar jxvf FileName.tar.bz

Z命令
　　解压：uncompress FileName.Z

　　压缩：compress FileName

　　.tar.Z

　　解压：tar Zxvf FileName.tar.Z

　　压缩：tar Zcvf FileName.tar.Z DirName

zip命令
　　解压：unzip FileName.zip

　　压缩：zip FileName.zip DirName

rar命令
　　解压：rar a FileName.rar

　　压缩：r ar e FileName.rar
```

#### tldr：Linux 手册页的简化替代品
> tldr: 如果你经常不想详读man文档，那么你应该试试这个小工具
参考链接：https://www.hi-linux.com/posts/16098.html
参考链接：https://zhuanlan.zhihu.com/p/52637238
```sh
yum install nodejs
yum install npm
npm install -g tldr
tldr --update
## 使用实例
tldr kill
```

#### htop: 提供更美观、更方便的进程监控工具，替代top命令

#### mycli：mysql客户端，支持语法高亮和命令补全，效果类似ipython，可以替代mysql命令
#### yapf：Google开发的python代码格式规范化工具，支持pep8以及Google代码风格

#### shellcheck：shell脚本静态检查工具，能够识别语法错误以及不规范的写法

#### jq: json文件处理以及格式化显示，支持高亮，可以替换python -m json.tool

#### axel：多线程下载工具，下载文件时可以替代curl、wget

#### mosh：基于UDP的终端连接，可以替代ssh，连接更稳定，即使IP变了，也能自动重连