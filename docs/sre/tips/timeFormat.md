## 时间格式化

### python时间格式化
```
import datetime
#获得当前时间
now = datetime.datetime.now()  ->这是时间数组格式
#转换为指定的格式:
otherStyleTime = now.strftime("%Y-%m-%d %H:%M:%S")

import
print time.strftime('%Y-%m-%d %H:%M:%S')

```

### shell时间格式化
```
echo $(date +%Y-%m-%d_%H:%M:%S)
echo $(date +%F)

```

### golang时间格式化
```
fmt.Println(time.Now().Format("2006-01-02 15:04:05"))
today := time.Now().Format("20060102")

```

