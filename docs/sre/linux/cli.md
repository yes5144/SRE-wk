## 常用cli
```
find
sed
awk
grep

# 基于目录深度搜索
## 向下最大深度限制为3
find . -maxdepth 3 -type f
## 搜索出深度距离当前目录至少2个子目录的所有文件
find . -mindepth 2 -type f

## 
find . -name "*.txt" -o -name "*.pdf"

## 正则
find . -regex ".*\(\.txt\|\.pdf\)$"
find . -iregex ".*\(\.txt\|\.pdf\)$"

sed -i 's/sa/sre/g' file_name
awk -F":" '{print $NF}'

find . -maxdepth 1  -name 'nz_*' -mtime +5 |xargs -i mv {} 2020-04-20

```