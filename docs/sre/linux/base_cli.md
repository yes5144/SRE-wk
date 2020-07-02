## linux 入门
> 没有必要再去争论什么语言的优劣，一门语言只要存活下来，就一定有它的优势所在。
> 世界上只有烂代码，没有烂语言。还是那句话，语言没有三六九等之分，只有合适与否之别。什么是合适？合适就是性价比最好、综合得分最高的那个。

```
## 常用命令
ls
cp
mv
rename


```


### tmux,screen

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

#### 文本三剑客
```
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

```
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

```
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

#### ip地址排序
```
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
```
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

 

linux压缩和解压缩命令大全

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
```
yum install nodejs
yum install npm
npm install -g tldr
tldr --update
## 使用实例
tldr kill
```

#### tmux：终端复用工具，替代screen、nohup
##### tmux 常用操作
```
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

##### screen 常用操作
```
yum install screen

screen -S yourname ## 新建一个叫yourname的session
screen -ls 			## 列出当前所有的session
screen -r yourname ## 回到yourname这个session
screen -d yourname ## 远程detach某个session
screen -d -r yourname ## 结束当前session并回到yourname这个session
```
#### htop: 提供更美观、更方便的进程监控工具，替代top命令

#### mycli：mysql客户端，支持语法高亮和命令补全，效果类似ipython，可以替代mysql命令
#### yapf：Google开发的python代码格式规范化工具，支持pep8以及Google代码风格

#### shellcheck：shell脚本静态检查工具，能够识别语法错误以及不规范的写法

#### jq: json文件处理以及格式化显示，支持高亮，可以替换python -m json.tool

#### axel：多线程下载工具，下载文件时可以替代curl、wget

#### mosh：基于UDP的终端连接，可以替代ssh，连接更稳定，即使IP变了，也能自动重连