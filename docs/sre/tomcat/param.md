## 参数调优
```
今日小技巧：
Jvm参数调优

Tomcat 的启动参数位于tomcat的安装目录\bin目录下，如果你是Linux操作系统就是catalina.sh文件，如果你是Windows操作系统那么 你需要改动的就是catalina.bat文件

JAVA_OPTS="$JAVA_OPTS -server -Xms4096m -Xmx4096m -Xmn1024m -Xss256K -XX:+DisableExplicitGC -XX:MaxTenuringThreshold=15 -XX:+UseParNewGC -XX:+UseConcMarkSweepGC -XX:+CMSParallelRemarkEnabled -XX:+UseCMSCompactAtFullCollection -XX:LargePageSizeInBytes=128m -XX:+UseFastAccessorMethods -XX:+UseCMSInitiatingOccupancyOnly -XX:CMSInitiatingOccupancyFraction=70 -XX:+PrintGC -XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:/home/gclogs/gc.log -Djava.awt.headless=true"

解释：
-server：更高的性能
-Xms4096m：初始堆内存4g
-Xmx4096m：最大堆内存4g
-Xmn1024m：年轻代1g
-Xss256K：每个线程占用的空间
-XX:+DisableExplicitGC：禁止显示调用gc
-XX:MaxTenuringThreshold=15：在年轻代存活次数
-XX:+UseParNewGC：对年轻代采用多线程并行回收
-XX:+UseConcMarkSweepGC：年老代采用CMS回收
-XX:+CMSParallelRemarkEnabled：在使用UseParNewGC 的情况下, 尽量减少 mark 的时间
-XX:+UseCMSCompactAtFullCollection：在使用concurrent gc 的情况下, 防止 memoryfragmention, 对live object 进行整理, 使 memory 碎片减少
-XX:LargePageSizeInBytes=128m：指定 Java heap的分页页面大小
-XX:+UseFastAccessorMethods：get,set 方法转成本地代码
-XX:+UseCMSInitiatingOccupancyOnly：指示只有在 oldgeneration 在使用了初始化的比例后concurrent collector 启动收集
-XX:CMSInitiatingOccupancyFraction=70：年老代到达70%进行gc
-Djava.awt.headless=true ：Headless模式是系统的一种配置模式。在该模式下，系统缺少了显示设备、键盘或鼠标。
-XX:+PrintGC -XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:/home/gclogs/gc.log：打印日志信息

```