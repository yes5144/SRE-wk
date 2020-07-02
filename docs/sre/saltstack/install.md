## install

> saltstack采用c/s架构，角色分为master/slave，建议采用yum部署

### 安装
```
## 指定阿里云epel.repo, salt.repo 华为云 Centos-Base.repo
yum install https://mirrors.aliyun.com/saltstack/yum/redhat/salt-repo-latest-2.el6.noarch.rpm

sed -i "s/repo.saltstack.com/mirrors.aliyun.com\/saltstack/g" /etc/yum.repos.d/salt-latest.repo
sed -i "s/latest/2016.11/g" /etc/yum.repos.d/salt-latest.repo

yum makecache
yum install salt-master salt-minion salt-api

```
### salt-api安装配置
```
https://www.cnblogs.com/gavin11/p/11599859.html
## salt-api 安装
https://www.cnblogs.com/xiewenming/p/7716660.html

```

#### 配置minion
```
vim  /etc/salt/minion
master: master-id
id: hostname<weiyi>

```
#### 管理 salt key
```
salt-key  -L
salt-key  -A
salt-key  -D
salt-key  -a <ID>
salt-key  -d <ID>
salt-key  -l acc|grep -c -v 'Accepted Keys:'
```

### salt命令入门

```shell

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
salt-run jobs.list_job 20151208172130003474
salt-run jobs.lookup_jid 20190426130418644064

https://docs.saltstack.com/en/latest/ref/states/backup_mode.html#file-state-backups

```

#### 组织主机节点
```
vim  /etc/salt/master
nodegroups:
  web: 'L@192.168.204.12,192.168.204.13'
  db: 'L@192.168.204.32,192.168.204.33'
## 无需重启salt-master，保存即可生效
salt -N web test.ping
salt -N db test.ping
```
#### 模块的调用
```
## ping模块
salt node1 test.ping
## cmd模块
salt node2 cmd.run 'id'
salt node2 cmd.run 'curl -L http://scripts.example.com/scripts/example.sh |bash'
### 想携带参数？
salt node2 cmd.scripts salt://scripts/example.sh "arg1 arg2 'arg   3'"
salt node2 cmd.scripts http://scripts.example.com/scripts/example.sh "arguments"

## pkg模块
salt node2 pkg.install 'vsftpd,lftp'
salt node2 pkg.remove 'vsftpd,lftp'

## file.replace
salt node1 file.replace /ets/ssh/sshd_config pattern='#Port 22' repl='Port 22'

## manage
```

#### SLS(salt state)

#### Grain
```
salt node1 grains.ls |wc -l
salt node1 grains.item server_type
salt node1 grains.item ip4_interfaces:eth0

```
#### Pillar
> Pillar和Grain的区别是什么？
> Grain是在Master上面创建的，但它的取值来自于Minion，而且Grain的代码是通过调用模块saltutil.sync_grains将其同步到Minion上面执行的。在执行结果没有返回之前，Grain的值时未知的，需要根据Minion的实际环境确认。
> 和Grain不同的是，Pillar是在Master上定义和存储的，是为了编写sls文件时便于引用而创建的，它的变量和赋值在执行之前就已经确定好了，和Minion的状态没有关系。

### salt-run 结果详情查看
```
salt-run jobs.list_jobs   |grep -B20  '10.1.3'
salt-run jobs.list_jobs   |grep -B20  'Python-2.7.3/bin/supervisorctl stop dj_gm_ser'
salt-run jobs.lookup_jid  20191107102202302460

```

### salt-api参数变更

```
https://docs.saltstack.com/en/latest/ref/clients/index.html

tgt_type --

    The type of tgt. Allowed values:
    glob - Bash glob completion - Default
    pcre - Perl style regular expression
    list - Python list of hosts
    grain - Match based on a grain comparison
    grain_pcre - Grain comparison with a regex
    pillar - Pillar data comparison
    pillar_pcre - Pillar data comparison with a regex
    nodegroup - Match on nodegroup
    range - Use a Range server for matching
    compound - Pass a compound match string
    ipcidr - Match based on Subnet (CIDR notation) or IPv4 address.
Changed in version 2017.7.0: Renamed from expr_form to tgt_type

```

