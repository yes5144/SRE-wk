## install

```
yum install docker
docker search gitlab
docker pull gitlab/gitlab-ce

mkdir -p /opt/apps/gitlab/{config,logs,data}

chmod 777 -R /opt/apps/gitlab

docker run -d --hostname gitlab.example.com\
    -p 443:443 -p 8181:80 -p 2222:22 \
    --name gitlab \--restart always \
    -v /opt/apps/gitlab/config:/etc/gitlab \
    -v /opt/apps/gitlab/logs:/var/log/gitlab \
    -v /opt/apps/gitlab/data:/var/opt/gitlab \
    -v /etc/localtime:/etc/localtime \
    gitlab/gitlab-ce:latest

## 
vim /opt/apps/gitlab/config/gitlab.rb
gitlab_rails['gitlab_ssh_host'] = '192.168.204.222'
gitlab_rails['gitlab_shell_ssh_port'] = 2222

```