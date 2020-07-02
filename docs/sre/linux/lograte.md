## 配置
```
/opt/log/nginx/*.log
{
    daily
    missingok
    rotate 1
    compress
    notifempty
    copytruncate
    dateext
    dateformat %Y-%m-%d
}

```