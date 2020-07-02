## top排行榜

```
原文链接：https://blog.csdn.net/waltonhuang/article/details/52083868

## log ip
awk '{print $1}' access.log.1 |sort|uniq -c|sort -n

awk '{cnt[$1]++;}END{for(i in cnt){printf("%s\t%s\n", cnt[i], i);}}' access.log.1|sort -n

import re
mydict = {}
with open('/var/log/nginx/access.log.1') as f:
    for line in f:
        match = re.match(r'([0-9]{1,3}\.){3}[0-9]{1,3}', line)
            if match:
                ip = match.group()
                if ip in mydict.keys():
                    mydict[ip] += 1
                else:
                    mydict[ip] = 1

print mydict
```

### 其他
```
## CPU
ps -aux |sort -rnk 4| head -20
## mem
ps -aux |sort -rnk 3| head -20

```