## 创建py3虚拟环境
```sh
yum install python-setuptools python-devel python-pip
## yum install python36 python36-devel
pip install virtualenvwrapper

#编辑.bashrc文件
vim ~/.bashrc

#添加进去
export WORKON_HOME=$HOME/.virtualenvs
source /usr/bin/virtualenvwrapper.sh

#sudo find / -name virtualenvwrapper.sh      查看你的virtualenvwrapper.sh在什么地方

#重新加载.bashrc文件
source ~/.bashrc

#虚拟环境保存的路径
cd ~/.virtualenvs/      （创建的虚拟环境都会保存在这个目录，前面设置的）

#创建指定python版本的虚拟环境方法
mkvirtualenv -p /usr/bin/python3.6 DjangoDevops

workon: 打印所有的虚拟环境；
mkvirtualenv xxx: 创建 xxx 虚拟环境;
workon xxx: 使用 xxx 虚拟环境;
deactivate: 退出 xxx 虚拟环境；
rmvirtualenv xxx: 删除 xxx 虚拟环境

```
## Centos7升级sqlite3
```sh
## 下载
wget -O sqlite-autoconf-3260000.tar.gz   https://www.sqlite.org/2019/sqlite-autoconf-3270200.tar.gz

## 安装：

tar zxvf sqlite-autoconf-3260000
cd sqlite-autoconf-3260000

./configure make && make install

## rpm -ql sqlite

```




## nginx配置文件
```ini
(DjangoDevops) [root@node1 DjangoDevops]# cat /etc/nginx/conf.d/DjangoDevops.conf
# the upstream component nginx needs to connect to
upstream djangodevops {
# server unix:///path/to/your/mysite/mysite.sock; # for a file socket
server 127.0.0.1:8000; # for a web port socket (we'll use this first)
}
# configuration of the server

server {
# the port your site will be served on
listen      80;
# the domain name it will serve for
server_name 192.168.204.50; # substitute your machine's IP address or FQDN
charset     utf-8;

# max upload size
client_max_body_size 75M;   # adjust to taste

# Django media
location /media  {
    alias /opt/www/github.com/DjangoDevops/media;  # 指向django的media目录
    }


location /static {
    alias /opt/www/github.com/DjangoDevops/static; # 指向django的static目录
    }

# Finally, send all non-media requests to the Django server.
location / {
    uwsgi_pass  djangodevops;
    include     uwsgi_params;
    }
}

## 启动nginx
systemctl start nginx
```

## 下载代码，配置uwsui.ini

```sh
cd /opt/www/github.com/

git clone git@github.com:yes5144/DjangoDevops.git

cat DjangoDevops/DjangoDevops/uwsgi.ini

(MxOnline) [root@node1 DjangoDevops]# cat uwsgi.ini
[uwsgi]

socket =127.0.0.1:8000
chdir = /opt/www/github.com/DjangoDevops
module = DjangoDevops.wsgi
master = true
processes = 4
vacuum = true
virtualenv = /root/.virtualenvs/DjangoDevops/
logto = /tmp/mylog.log

cat /opt/www/github.com/DjangoDevops/require_pip.txt
uwsgi
django
```

## 启动uwsgi
```sh
uwsgi --ini uwsgi.ini

```