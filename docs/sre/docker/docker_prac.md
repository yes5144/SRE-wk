## docker practice

```
docker run -d  --name mysql57_test     -e MYSQL_USER=test -e MYSQL_PASSWORD=test -e MYSQL_DATABASE=test -p 63306:3306 centos/mysql-57-centos7
docker run -d  --name mysql57_bookshop -e MYSQL_ROOT_PASSWORD=channel -p 3306:3306 centos/mysql-57-centos7

### 数据持久化
docker run -d  --name mysql57_test2 -v /opt/data/mysql57:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=channel -p 53306:3306 centos/mysql-57-centos7


docker volume ls

docker inspect mysql |grep docker
 
docker container rename zealous_yonath cs7-mysql57
 
docker tag 
 
## https://hub.docker.com/_/wordpress
## https://hub.docker.com/_/haproxy


## docker wordpress
docker run -d --name mysql57_wordpress -e MYSQL_ALLOW_EMPTY_PASSWORD=yes centos/mysql-57-centos7

docker run -d --name wordpress  -e WORDPRESS_DB_HOST=mysql57_wordpress::3306 --link mysql57_wordpress -p88:80 wordpress
```
### docker-compose
```
cat wordpress.yml

version: '3.1'

services:

  wordpress:
    image: wordpress
    restart: always
    ports:
      - 8080:80
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: exampleuser
      WORDPRESS_DB_PASSWORD: examplepass
      WORDPRESS_DB_NAME: exampledb
    volumes:
      - wordpress:/var/www/html

  db:
    image: mysql:5.7
    restart: always
    environment:
      MYSQL_DATABASE: exampledb
      MYSQL_USER: exampleuser
      MYSQL_PASSWORD: examplepass
      MYSQL_RANDOM_ROOT_PASSWORD: '1'
    volumes:
      - db:/var/lib/mysql

volumes:
  wordpress:
  db:

```
### 伸缩命令
```
docker-compose up --scale web=3 -d

docker ps -aq
docker container ls -aq
```
### docker swarm
```
docker swarm init --advertise-addr=192.168.204.111
docker stack 
```

### Docker Elastic Search
```
docker run -d -p 9200:9200 elasticsearch

## 浏览器访问 
http://192.168.204.130:9200

http://192.168.204.130:9200/index/type/id
index -> database
type  -> type
id 使用post时候，可以省略，系统自动生成id

http://192.168.204.130:9200/dbname/table/22

http://192.168.204.130:9200/dbname/table/_search
http://192.168.204.130:9200/dbname/table/_mapping

https://github.com/olivere/elastic

192.168.204.130:9200/_cat/health?v

https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html
https://www.docker.elastic.co/#
```