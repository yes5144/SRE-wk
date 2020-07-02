## install
```
## docker-compose

docker pull jenkins/jenkins:lts

mkdir -p  /opt/apps/jenkins
chmod 777 /opt/apps/jenkins
docker run -it --name jenkinssci -v /opt/apps/jenkins:/var/jenkins_home \
-p 8080:8080 -p 50000:50000 -p 45000:45000 \
jenkins/jenkins:lts

## 修改默认插件仓库 hudson.model.UpdateCenter.xml
http://mirror.xmission.com/jenkins/updates/update-center.json

https://kefeng.wang/2017/01/06/jenkins/

```
### Jenkins 参数化构建
```
https://www.cnblogs.com/Dev0ps/p/9125232.html

```
### Jenkins webhooks触发构建
```
## svn
https://blog.csdn.net/q13554515812/article/details/86651851
https://blog.csdn.net/kongsuhongbaby/article/details/100170537
https://www.cnblogs.com/jianxuanbing/p/6835765.html

## github

```

### windows jenkins 安装
```
https://blog.csdn.net/yuanfang_jlht/article/details/51577773

## win7 下载在H盘，powershell 执行 java -jar jenkins.war
## 访问127.0.0.1:8080
[jenkins_notify_email002.html] was not found in $JENKINS_HOME/email-templates.
默认$JENKINS_HOME在C:\Users\Admin\.jenkins

## jenkins
http://www.eryajf.net/category/%E6%9C%AF%E4%B8%9A%E4%B8%93%E6%94%BB/%E8%87%AA%E5%8A%A8%E5%8C%96%E8%BF%90%E7%BB%B4/jenkins

## ldap配置系列二：jenkins集成ldap
https://www.cnblogs.com/zhaojiedi1992/p/zhaojiedi_liunx_52_ldap_for_jenkins.html

## jenkins集成OpenLDAP认证
https://www.cnblogs.com/37Y37/p/9430272.html

## Jenkins 持续集成综合实战
https://kefeng.wang/2017/01/06/jenkins/
  
## Jenkins学习七：Jenkins的授权和访问控制  
https://www.cnblogs.com/yangxia-test/p/4368778.html
```

### Jenkins常用API

```shell
# 常用 Jenkins REST API 列表
## Job - CRUD
## Create a Job with config.xml
curl -X POST "http://user:password@<Jenkins_URL>/createItem?name=<Job_Name>" --data-binary "@newconfig.xml" -H "Content-Type: text/xml"

## Retrieve/Fetch a Job’s config.xml
curl -X GET http://user:password@<Jenkins_URL>/job/<Job_Name>/config.xml

## Update a Job’s config.xml
curl -X POST http://user:password@<Jenkins_URL>/job/<Job_Name>/config.xml --data-binary "@mymodifiedlocalconfig.xml"

## Delete a job
curl -X POST http://user:password@<Jenkins_URL>/job/<Job_Name>/doDelete

## Build - CONTROL
Perform a Build
curl -X POST http://user:password@<Jenkins_URL>/job/<Job_Name>/build

## 如果该 build 使用参数化构建，则需用如下方式进行构建：

curl -X POST http://user:password@<Jenkins_URL>/job/JOB_NAME/build --data --data-urlencode json=<Parameters>

## Retrieve a Build
curl -X GET http://user:password@<Jenkins_URL>/queue/api/json?<Filter_Condition>

## 例如，可以按照如下的方式查找名字为 name 的 task :
curl -X GET http://user:password@<Jenkins_URL>/queue/api/json?tree=items[id,task[name]]

## 或者可以直接按如下方式访问 Job 最近一次构建的详情：
curl -X GET http://user:password@<Jenkins_URL>/lastBuild/api/json

## Stop a Build
curl -X POST http://user:password@<Jenkins_URL>/job/<Job_Name>/<Build_Number>/stop
## 或者
curl -X POST http://user:password@<Jenkins_URL>/queue/cancelItem?id=<Queue_Item>
--------------------- 
作者：xiaosongluo 
来源：CSDN 
原文：https://blog.csdn.net/xiaosongluo/article/details/52797156 
版权声明：本文为博主原创文章，转载请附上博文链接！
```