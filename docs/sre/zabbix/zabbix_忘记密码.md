## 忘记密码

```
Zabbix 忘记密码？
https://jingyan.baidu.com/article/455a9950a8e6aca167277866.html
 
1这里自己找个控制台去生成一个MD5加密的密码，这里密码设置的是redhat
[root@zabbix ~]# echo -n  redhat  | openssl md5
(stdin)= e2798af12a7a0f4f70b4d69efbc25f4d
2自己去更新密码
update users set  passwd='e2798af12a7a0f4f70b4d69efbc25f4d' where userid = '1';
或者或者
> update  users set passwd=md5("zabbix") where userid='1';
```