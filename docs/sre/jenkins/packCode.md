### Git
```
git diff这个命令能比较两个提交之间的差异，使用–name-only参数可以只显示文件名。例如：

git diff 608e120 4abe32e --name-only

打包差异文件
git diff 608e120 4abe32e --name-only | xargs zip update.zip

备注：608e120和4abe32e为前后两个提交的commit id

原文：https://blog.csdn.net/liuxinfa/article/details/82878640 
```
### Svn
```
最近接手一个PHP项目，修复GUG和优化功能，由于是已经在用的项目，并且诸如附件上传都是保存到WEB目录下的，

所以不宜采用全量部署的方式来更新软件，最好用增量部署来更新服务器的WEB目录。

程序代码采用SVN管理，在主干上开发，每次部署都建一个tag，这样通过比较tag和主干的差别就可以知道有哪些文件发生了变动。具体的命令格式是： 

svn diff --summarize http://rep_url/tags/proj1_090214 http://rep_url/trunk/proj1 >diff.txt

这个命令比较了 proj1_090214 和 proj1 的差异，并将差异信息输出到文件 diff.txt
summarize  选项的含义是只显示结果的概要，不显示文件的具体差异。

有了diff.txt，就可以知道需要部署哪些文件了，感觉很方便

```