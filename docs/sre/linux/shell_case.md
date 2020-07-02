## case

```
#!/bin/bash
#

echo "chouka"
mysql -h 127.0.0.1 -P3306 --default-character-set=utf8 -uroot -p'yourpasswd' -e 'use yourpasswd; select count(*) from  chouka;'

echo "zhuanpan"
mysql -h 127.0.0.1 -P3306 --default-character-set=utf8 -uroot -p'yourpasswd' -e 'use yourpasswd; select count(*) from  zhuanpan;'

echo "activity"
mysql -h 127.0.0.1 -P3306 --default-character-set=utf8 -uroot -p'yourpasswd' -e 'use yourpasswd; select count(*) from  activity;'

until [ $# -eq 0 ]
    do
		echo "第一个参数为: $1 当前参数个数为: $#"
		activity=$1
		echo $activity

		case $1 in
			all)
			echo 'all activity'
			;;

			hb)
			echo 'hongbao'
			;;

			ck)
			echo 'chouka'
			;;

			zp)
			echo 'zhuanpan'
			;;
			
			*)
			echo '亲，啥也没有匹配到呀...';;

		esac

    ## 切换下一个位置参数
    shift
done
```