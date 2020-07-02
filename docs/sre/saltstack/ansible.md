### ansible 安装
```
# http://blog.51cto.com/breezey/1555530

# yum install ansible -y

# 查看生成的文件
rpm -ql ansible

/etc/ansible
/etc/ansible/ansible.cfg
/etc/ansible/hosts
/etc/ansible/roles
/usr/bin/ansible

ansible -h
ansible --version

vim /etc/ansible/hosts

[test]
192.168.204.12

ansible -i /etc/ansible/hosts test -u root -m command -a 'ls /home/' -k

可以简化为：ansible test -a 'ls /home/' -k

# 当然也可以基于ssh 认证
# 检测主机是否存活
ansible all -m ping

vim /etc/ansible/hosts

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

#####################################
#22222222222 ansible 常用模块
# 假设已经 基于ssh 认证

# 查看
ansible-doc -l

# 查看具体模块的用法
ansible-doc -s user 
```
### ansible常用模块
```
# 链接
# http://blog.51cto.com/breezey/1555530
1 # 收集客户机的信息
ansible all -m setup

2 # ping 检测是否存活
ansible all -m ping

3 # file 模块
    ansible test -m file -a "src=/etc/fstab dest=/tmp/fstab state=link"
    ansible test -m file -a "path=/tmp/fstab state=absent"
    ansible test -m file -a "path=/tmp/test state=touch"

    ansible test -m file -a 'path=/tmp/d2 state=directory owner=root group=root mode=700'
    ansible test -m command -a 'ls /tmp -lh'

4 # copy 模块
ansible test -m copy -a "src=/srv/myfiles/foo.conf dest=/etc/foo.conf owner=foo group=foo mode=0644"
    ansible test -m copy -a "src=/mine/ntp.conf dest=/etc/ntp.conf owner=root group=root mode=644 backup=yes"
    ansible test -m copy -a "src=/mine/sudoers dest=/etc/sudoers validate='visudo -cf %s'"

# 在管理机当前目录新建文件bbb
echo "this is a test from manager mechine">bbb

ansible test -m copy -a 'src=bbb dest=/tmp/file2 mode=744 user=root group=root'

ansible test -a 'ls -lh /tmp'
ansible test -a 'cat /tmp/file2'

# 再次修改 bbb 文件，再次执行copy模块，添加参数backup=yes

5 # command 模块

6 # shell 模块，对于command模块，支持管道
   ansible test -a 'ps -ef |grep http'
  ansible test -m shell -a 'ps -ef |grep http'
  ansible test -m raw -a 'ps -ef |grep http'

7 # service 模块

    asnible test -m service -a "name=foo pattern=/usr/bin/foo state=started"
    ansible test -m service -a "name=network state=restarted args=eth0"

    ansible test -m service -a 'name=nginx state=started enabled=yes'
    ansible test -m  raw -a 'ps -ef |grep nginx'
    ansible test -m service -a 'name=nginx state=stopped'

ansible test -m service -a 'name=nginx state=restarted sleep=3'

8 # cron 模块

ansible test -m cron -a 'name="a job for reboot" special_time=reboot job="/some/job.sh"'
    ansible test -m cron -a 'name="yum autoupdate" weekday="2" minute=0 hour=12 user="root
    ansible test -m cron  -a 'backup="True" name="test" minute="0" hour="5,2" job="ls -alh > /dev/null"'
    ansilbe test -m cron -a 'cron_file=ansible_yum-autoupdate state=absent'

ansible test -m cron -a 'name="reboot system" hour=2 user=root job="/sbin/reboot"'

ansible test -m command -a 'crontab -l'

ansible test -m cron -a 'name="reboot system" hour=2 user=root job="/sbin/reboot" state=absent'

# 再次查看，已经删除了计划任务

9 # filesystem 模块

10 # yum 模块

ansible test -m yum -a 'name=httpd state=latest'
    ansible test -m yum -a 'name="@Development tools" state=present'
    ansible test -m yum -a 'name=http://nginx.org/packages/centos/6/noarch/RPMS/nginx-release-centos-6-0.el6.ngx.noarch.rpm state=present'

11 # user 管理用户

12 # synchronize 同步模块

    src=some/relative/path dest=/some/absolute/path rsync_path="sudo rsync"
    src=some/relative/path dest=/some/absolute/path archive=no links=yes
    src=some/relative/path dest=/some/absolute/path checksum=yes times=no
    src=/tmp/helloworld dest=/var/www/helloword rsync_opts=--no-motd,--exclude=.git mode=pull

13 # mount

    name=/mnt/dvd src=/dev/sr0 fstype=iso9660 opts=ro state=present
    name=/srv/disk src='LABEL=SOME_LABEL' state=present
    name=/home src='UUID=b3e48f45-f933-4c8e-a700-22a159ec9077' opts=noatime state=present

    ansible test -a 'dd if=/dev/zero of=/disk.img bs=4k count=1024'
    ansible test -a 'losetup /dev/loop0 /disk.img'
    ansible test -m filesystem 'fstype=ext4 force=yes opts=-F dev=/dev/loop0'
    ansible test -m mount 'name=/mnt src=/dev/loop0 fstype=ext4 state=mounted opts=rw'

```
### ansible变量详解
```
##variables Defined in Inventory

##Variables Defined in a Playbook

##Variables Defined in a Commandline

- hosts: mfs_node
  user: "{{ uservar }}"
  tasks:
    - shell: echo "{{ echovar }}"


ansible-playbook command_vars.yml -e 'uservar="root" echovar="helloworld"

ansible-playbook command_vars.yml -e '{"uservar":"root", "echovar":"hello world"}'

ansible-playbook command_vars.yml -e '@test.json'
```

```
cat test.json # 文件内容如下：
uservar: root
echovar: helloworld

## Registered Variables
- hosts: mfs_node
  tasks:
    - shell: echo "5"
      register: result
      ignore_errors: True

    - debug: msg="it failed"
      when: result|failed

    - debug: msg="{{result.stdout}}"

    - shell: /usr/bin/var
      when: result.rc == 5


## roles

## Using Variables: About Jinja2
template: src=foo.cfg.j2 dest={{ remote_install_path }}/foo.cfg

{{ some_variable | default(5) }}


## Facts 系统的和本地的
#### System Facts
  ansible <hostname> -m setup

#### local Facts


# 补充
Omitting Undefined Variables
- name: touch files with an optional mode
  file: dest={{item.path}} state=touch mode={{item.mode|default(omit)}}
  with_items:
    - path: /tmp/foo
    - path: /tmp/bar
    - path: /tmp/bazz
      mode: "0444"  # 这个mode只对bazz 生效


# A YAML Gotcha
# this won't work:

- host: app_servers
  vars:
    app_path: {{ base_path }}/22

# Do it like this and you'll be fine:

- hosts: app_servers
  vars:
    app_path: "{{ base_path }}/22"  # 加上双引号


Playbook Conditionals
# 内置变量
hostvars
groups
group_names

inventory_hostname
inventory_hostname_short

inventory_dir
inventory_file


## when 条件判断
tasks:
  - name: "shutdown Debian flavored systems"
    command: /sbin/shutdown -t now
    when: ansible_os_family == "Debian"

  - name: "shutdown Redlkjdlkfakjdkf"
    command: halt -p
    when: ansible_os_family == "RedHat"
```

http://blog.51cto.com/breezey/1555530

http://docs.ansible.com/ansible/latest/index.html