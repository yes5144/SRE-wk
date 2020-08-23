## git 

### 基础三步
```
git add . 
git commit -m 'say something'
git push 

```

### git stash
```
## 原文链接：https://blog.csdn.net/leedaning/java/article/details/51304690

git checkout . #本地所有修改的。没有的提交的，都返回到原来的状态
git stash #把所有没有提交的修改暂存到stash里面。可用git stash pop回复。
git reset --hard HASH #返回到某个节点，不保留修改。
git reset --soft HASH #返回到某个节点。保留修改

git clean -df #返回到某个节点
git clean 参数
    -n 显示 将要 删除的 文件 和  目录
    -f 删除 文件
    -df 删除 文件 和 目录

```

### git tag
```
https://www.jianshu.com/p/cdd80dd15593

```
### git show
```
git log
git show 
git show commitId

```