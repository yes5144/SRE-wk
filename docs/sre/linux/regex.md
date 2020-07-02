## 一个正则表达式

```
sed正则表达式
sed -e 's/:\+\s\+/:/' -e 's/ /_/g' -e '/^$/d' -e 's/[(%)]//g' -e '/^1/d' -e 's/[(*)]//g' /tmp/${RAND}.sql_out.temp > /tmp/${RAND}.sql_out.temp.1
后面还有一行：
sed -ni 'H;${x;s/\n/ /g;p}' /tmp/${RAND}.sql_out.temp.1


-e 's/:\+\s\+/:/' -e 's/ /_/g' 
把每一行 第一次出现的 "连续 n 个 : 及 后面的m个空格" 替换成 : , 再把这一行中剩余的类似匹配内容替换成 _ , 其中 n >= 1, m>=1
比如
如果某行的内容是
sss:: ppp: MMM
则替换后变成
sss:ppp_MMM
## 然后
-e '/^$/d'
删除空行
## 然后
-e 's/[(%)]//g' 
把每行出现的 ( 或者 % 或者 ) 字符全部删除,
比如
abc()% 被替换成 abc
## 然后
-e '/^1/d' 
将 以字符 1 开头的行删除
## 最后
-e 's/[(*)]//'
把每行第一次出现的 ( 或者 * 或者 ) 字符删除.


注意,上面的每一个 -e 命令处理的对象都是前一条 -e 命令处理完后的结果.
所以假定有一个文件内容为
abc #unchanged line
sss:: ppp: (M%MM)zzz :::: end # change to sss:ppp_MMMzzz _end
1me #this line will be deleted
2123(* #change to 2123
end of file #unchanged

经过上面的命令后,变成
abc #unchanged line
sss:ppp_M%MMzzz _end # change to sss:ppp_MMMzzz _end
2123 #change to 2123
end of file #unchanged


```