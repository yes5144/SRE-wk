## 优化2
```
网上有很多的文章教怎么配置MySQL服务器，但考虑到服务器硬件配置的不同，具体应用的差别，那些文章的做法只能作为初步设置参考，我们需要根据自己的情况进行配置优化，好的做法是MySQL服务器稳定运行了一段时间后运行，根据服务器的”状态”进行优化。 
　　mysql> show global status; 
　　可以列出MySQL服务器运行各种状态值，另外，查询MySQL服务器配置信息语句： 
　　mysql> show variables; 
　　一、慢查询 
　　mysql> show variables like '%slow%'; 
　　+------------------+-------+ 
　　| Variable_name | Value | 
　　+------------------+-------+ 
　　| log_slow_queries | ON | 
　　| slow_launch_time | 2 | 
　　+------------------+-------+ 
　　mysql> show global status like '%slow%'; 
　　+---------------------+-------+ 
　　| Variable_name | Value | 
　　+---------------------+-------+ 
　　| Slow_launch_threads | 0 | 
　　| Slow_queries | 4148 | 
　　+---------------------+-------+　　 


        配置中打开了记录慢查询，执行时间超过2秒的即为慢查询，系统显示有4148个慢查询，你可以分析慢查询日志，找出有问题的SQL语句，慢查询时间不宜设置过长，否则意义不大，最好在5秒以内，如果你需要微秒级别的慢查询，可以考虑给MySQL打补丁：http://www.percona.com/docs/wiki/release:start，记得找对应的版本。 
　　打开慢查询日志可能会对系统性能有一点点影响，如果你的MySQL是主-从结构，可以考虑打开其中一台从服务器的慢查询日志，这样既可以监控慢查询，对系统性能影响又小。 




　　二、连接数 
　　经常会遇见”MySQL: ERROR 1040: Too many connections”的情况，一种是访问量确实很高，MySQL服务器抗不住，这个时候就要考虑增加从服务器分散读压力，另外一种情况是MySQL配置文件中max_connections值过小： 
　　mysql> show variables like 'max_connections'; 
　　+-----------------+-------+ 
　　| Variable_name | Value | 
　　+-----------------+-------+ 
　　| max_connections | 256 | 
　　+-----------------+-------+　　 


       这台MySQL服务器最大连接数是256，然后查询一下服务器响应的最大连接数： 
　　mysql> show global status like ‘Max_used_connections’; 
　　MySQL服务器过去的最大连接数是245，没有达到服务器连接数上限256，应该没有出现1040错误，比较理想的设置是： 
　　Max_used_connections / max_connections * 100% ≈ 85% 
　　最大连接数占上限连接数的85%左右，如果发现比例在10%以下，MySQL服务器连接数上限设置的过高了。 




　　三、Key_buffer_size 
　　key_buffer_size是对MyISAM表性能影响最大的一个参数，下面一台以MyISAM为主要存储引擎服务器的配置： 
　　mysql> show variables like ‘key_buffer_size’; 
　　+-----------------+------------+ 
　　| Variable_name | Value | 
　　+-----------------+------------+ 
　　| key_buffer_size | 536870912 | 
　　+-----------------+------------+　　 


       分配了512MB内存给key_buffer_size，我们再看一下key_buffer_size的使用情况： 
　　mysql> show global status like 'key_read%'; 
　　+------------------------+-------------+ 
　　| Variable_name | Value | mysql 
　　+------------------------+-------------+ 
　　| Key_read_requests | 27813678764 | 
　　| Key_reads | 6798830 | 
　　+------------------------+-------------+　　 


       一共有27813678764个索引读取请求，有6798830个请求在内存中没有找到直接从硬盘读取索引，计算索引未命中缓存的概率： 
　　key_cache_miss_rate = Key_reads / Key_read_requests * 100% 
　　比如上面的数据，key_cache_miss_rate为0.0244%，4000个索引读取请求才有一个直接读硬盘，已经很BT了,key_cache_miss_rate在0.1%以下都很好(每1000个请求有一个直接读硬盘)，如果key_cache_miss_rate在0.01%以下的话，key_buffer_size分配的过多，可以适当减少。 
　　MySQL服务器还提供了key_blocks_*参数： 
　　mysql> show global status like 'key_blocks_u%'; 
　　+------------------------+-------------+ 
　　| Variable_name | Value | 
　　+------------------------+-------------+ 
　　| Key_blocks_unused | 0 | 
　　| Key_blocks_used | 413543 | 
　　+------------------------+-------------+　　 


       Key_blocks_unused表示未使用的缓存簇(blocks)数，Key_blocks_used表示曾经用到的最大的blocks数，比如这台服务器，所有的缓存都用到了，要么增加key_buffer_size，要么就是过渡索引了，把缓存占满了。比较理想的设置： 
　　Key_blocks_used / (Key_blocks_unused + Key_blocks_used) * 100% ≈ 80% 




　　四、临时表 
　　mysql> show global status like 'created_tmp%'; 
　　+-------------------------+---------+ 
　　| Variable_name | Value | 
　　+-------------------------+---------+ 
　　| Created_tmp_disk_tables | 21197 | 
　　| Created_tmp_files | 58 | 
　　| Created_tmp_tables | 1771587 | 
　　+-------------------------+---------+　　 


       每次创建临时表，Created_tmp_tables增加，如果是在磁盘上创建临时表，Created_tmp_disk_tables也增加,Created_tmp_files表示MySQL服务创建的临时文件文件数，比较理想的配置是： 
　　Created_tmp_disk_tables / Created_tmp_tables * 100% <= 25% 
　　比如上面的服务器Created_tmp_disk_tables / Created_tmp_tables * 100% = 1.20%，应该相当好了。我们再看一下MySQL服务器对临时表的配置： 
　　mysql> show variables where Variable_name in ('tmp_table_size', 'max_heap_table_size'); 
　　+---------------------+-----------+ 
　　| Variable_name | Value | 
　　+---------------------+-----------+ 
　　| max_heap_table_size | 268435456 | 
　　| tmp_table_size | 536870912 | 
　　+---------------------+-----------+　　 


      只有256MB以下的临时表才能全部放内存，超过的就会用到硬盘临时表。 
　　五、Open Table情况 
　　mysql> show global status like 'open%tables%'; 
　　+---------------+-------+ 
　　| Variable_name | Value | 
　　+---------------+-------+ 
　　| Open_tables | 919 | 
　　| Opened_tables | 1951 | 
　　+---------------+-------+　　 


      Open_tables表示打开表的数量，Opened_tables表示打开过的表数量，如果Opened_tables数量过大，说明配置中table_cache(5.1.3之后这个值叫做table_open_cache)值可能太小，我们查询一下服务器table_cache值： 
　　mysql> show variables like 'table_cache'; 
　　+---------------+-------+ 
　　| Variable_name | Value | 
　　+---------------+-------+ 
　　| table_cache | 2048 | 
　　+---------------+-------+ 
　　比较合适的值为： 
　　Open_tables / Opened_tables * 100% >= 85% 
　　Open_tables / table_cache * 100% <= 95% 




　　六、进程使用情况 
　　mysql> show global status like ‘Thread%’; 
　　+-------------------+-------+ 
　　| Variable_name | Value | 
　　+-------------------+-------+ 
　　| Threads_cached | 46 | 
　　| Threads_connected | 2 | 
　　| Threads_created | 570 | 
　　| Threads_running | 1 | 
　　+-------------------+-------+　　 


      如果我们在MySQL服务器配置文件中设置了thread_cache_size，当客户端断开之后，服务器处理此客户的线程将会缓存起来以响应下一个客户而不是销毁(前提是缓存数未达上限)。Threads_created表示创建过的线程数，如果发现Threads_created值过大的话，表明MySQL服务器一直在创建线程，这也是比较耗资源，可以适当增加配置文件中thread_cache_size值，查询服务器thread_cache_size配置： 
　　mysql> show variables like 'thread_cache_size'; 
　　+-------------------+-------+ 
　　| Variable_name | Value | 
　　+-------------------+-------+ 
　　| thread_cache_size | 64 | 
　　+-------------------+-------+　　 


      示例中的服务器还是挺健康的。 




　　七、查询缓存(query cache) 
　　mysql> show global status like 'qcache%'; 
　　+-------------------------+-----------+ 
　　| Variable_name | Value | 
　　+-------------------------+-----------+ 
　　| Qcache_free_blocks | 22756 | 
　　| Qcache_free_memory | 76764704 | 
　　| Qcache_hits | 213028692 | 
　　| Qcache_inserts | 208894227 | 
　　| Qcache_lowmem_prunes | 4010916 | 
　　| Qcache_not_cached | 13385031 | 
　　| Qcache_queries_in_cache | 43560 | 
　　| Qcache_total_blocks | 111212 | 
　　+-------------------------+-----------+　　 


       MySQL查询缓存变量解释： 
　　Qcache_free_blocks：缓存中相邻内存块的个数。数目大说明可能有碎片。FLUSH QUERY CACHE会对缓存中的碎片进行整理，从而得到一个空闲块。 
　　Qcache_free_memory：缓存中的空闲内存。 
　　Qcache_hits：每次查询在缓存中命中时就增大 
　　Qcache_inserts：每次插入一个查询时就增大。命中次数除以插入次数就是不中比率。 
　　Qcache_lowmem_prunes：缓存出现内存不足并且必须要进行清理以便为更多查询提供空间的次数。这个数字最好长时间来看;如果这个数字在不断增长，就表示可能碎片非常严重，或者内存很少。(上面的 free_blocks和free_memory可以告诉您属于哪种情况) 
　　Qcache_not_cached：不适合进行缓存的查询的数量，通常是由于这些查询不是 SELECT 语句或者用了now()之类的函数。 
　　Qcache_queries_in_cache：当前缓存的查询(和响应)的数量。 
　　Qcache_total_blocks：缓存中块的数量。 
　　我们再查询一下服务器关于query_cache的配置： 
　　mysql> show variables like 'query_cache%'; 
　　+------------------------------+-----------+ 
　　| Variable_name | Value | 
　　+------------------------------+-----------+ 
　　| query_cache_limit | 2097152 | 
　　| query_cache_min_res_unit | 4096 | 
　　| query_cache_size | 203423744 | 
　　| query_cache_type | ON | 
　　| query_cache_wlock_invalidate | OFF | 


       +——————————+———–+ 
　　各字段的解释： 
　　query_cache_limit：超过此大小的查询将不缓存 
　　query_cache_min_res_unit：缓存块的最小大小 
　　query_cache_size：查询缓存大小 
　　query_cache_type：缓存类型，决定缓存什么样的查询，示例中表示不缓存 select sql_no_cache 查询 
　　query_cache_wlock_invalidate：当有其他客户端正在对MyISAM表进行写操作时，如果查询在query cache中，是否返回cache结果还是等写操作完成再读表获取结果。 
　　query_cache_min_res_unit的配置是一柄”双刃剑”，默认是4KB，设置值大对大数据查询有好处，但如果你的查询都是小数据查询，就容易造成内存碎片和浪费。 
　　查询缓存碎片率 = Qcache_free_blocks / Qcache_total_blocks * 100% 
　　如果查询缓存碎片率超过20%，可以用FLUSH QUERY CACHE整理缓存碎片，或者试试减小query_cache_min_res_unit，如果你的查询都是小数据量的话。 
　　查询缓存利用率 = (query_cache_size - Qcache_free_memory) / query_cache_size * 100% 
　　查询缓存利用率在25%以下的话说明query_cache_size设置的过大，可适当减小;查询缓存利用率在80%以上而且Qcache_lowmem_prunes > 50的话说明query_cache_size可能有点小，要不就是碎片太多。 
　　查询缓存命中率 = (Qcache_hits - Qcache_inserts) / Qcache_hits * 100% 
　　示例服务器 查询缓存碎片率 = 20.46%，查询缓存利用率 = 62.26%，查询缓存命中率 = 1.94%，命中率很差，可能写操作比较频繁吧，而且可能有些碎片。 




　　八、排序使用情况 
　　mysql> show global status like 'sort%'; 
　　+-------------------+------------+ 
　　| Variable_name | Value | 
　　+-------------------+------------+ 
　　| Sort_merge_passes | 29 | 
　　| Sort_range | 37432840 | 
　　| Sort_rows | 9178691532 | 
　　| Sort_scan | 1860569 | 
　　+-------------------+------------+　　 


       Sort_merge_passes 包括两步。MySQL 首先会尝试在内存中做排序，使用的内存大小由系统变量 Sort_buffer_size 决定，如果它的大小不够把所有的记录都读到内存中，MySQL 就会把每次在内存中排序的结果存到临时文件中，等 MySQL 找到所有记录之后，再把临时文件中的记录做一次排序。这再次排序就会增加 Sort_merge_passes。实际上，MySQL 会用另一个临时文件来存再次排序的结果，所以通常会看到 Sort_merge_passes 增加的数值是建临时文件数的两倍。因为用到了临时文件，所以速度可能会比较慢，增加 Sort_buffer_size 会减少 Sort_merge_passes 和 创建临时文件的次数。但盲目的增加 Sort_buffer_size 并不一定能提高速度，见 How fast can you sort data with MySQL?(引自http://qroom.blogspot.com/2007/09/mysql-select-sort.html，貌似被墙) mysql 
　　另外，增加read_rnd_buffer_size(3.2.3是record_rnd_buffer_size)的值对排序的操作也有一点的好处，参见：http://www.mysqlperformanceblog.com/2007/07/24/what-exactly-is-read_rnd_buffer_size/ 




　　九、文件打开数(open_files) 
　　mysql> show global status like 'open_files'; 
　　+---------------+-------+ 
　　| Variable_name | Value | 
　　+---------------+-------+ 
　　| Open_files | 1410 | 
　　+---------------+-------+ 
　　mysql> show variables like 'open_files_limit'; 
　　+------------------+-------+ 
　　| Variable_name | Value | 
　　+------------------+-------+ 
　　| open_files_limit | 4590 | 
　　+------------------+-------+　　 


      比较合适的设置：Open_files / open_files_limit * 100% <= 75% 




　　十、表锁情况 
　　mysql> show global status like 'table_locks%'; 
　　+-----------------------+-----------+ 
　　| Variable_name | Value | 
　　+-----------------------+-----------+ 
　　| Table_locks_immediate | 490206328 | 
　　| Table_locks_waited | 2084912 | 
　　+-----------------------+-----------+　　 


       Table_locks_immediate表示立即释放表锁数，Table_locks_waited表示需要等待的表锁数，如果Table_locks_immediate / Table_locks_waited > 5000，最好采用InnoDB引擎，因为InnoDB是行锁而MyISAM是表锁，对于高并发写入的应用InnoDB效果会好些。示例中的服务器Table_locks_immediate / Table_locks_waited = 235，MyISAM就足够了。 




　　十一、表扫描情况 
　　mysql> show global status like 'handler_read%'; 
　　+-----------------------+-------------+ 
　　| Variable_name | Value | 
　　+-----------------------+-------------+ 
　　| Handler_read_first | 5803750 | 
　　| Handler_read_key | 6049319850 | 
　　| Handler_read_next | 94440908210 | 
　　| Handler_read_prev | 34822001724 | 
　　| Handler_read_rnd | 405482605 | 
　　| Handler_read_rnd_next | 18912877839 | 
　　+-----------------------+-------------+　　 


        各字段解释参见http://hi.baidu.com/thinkinginlamp/blog/item/31690cd7c4bc5cdaa144df9c.html，调出服务器完成的查询请求次数： 
　　mysql> show global status like 'com_select'; 
　　+---------------+-----------+ 
　　| Variable_name | Value | 
　　+---------------+-----------+ 
　　| Com_select | 222693559 | 
　　+---------------+-----------+　　 


       计算表扫描率： 
　　表扫描率 = Handler_read_rnd_next / Com_select 
　　如果表扫描率超过4000，说明进行了太多表扫描，很有可能索引没有建好，增加read_buffer_size值会有一些好处，但最好不要超过8MB。 
　　后记： 
　　文中提到一些数字都是参考值，了解基本原理就可以，除了MySQL提供的各种status值外，操作系统的一些性能指标也很重要，比如常用的top,iostat等，尤其是iostat，现在的系统瓶颈一般都在磁盘IO上，关于iostat的使用. 




----------------------------------- 
http://hi.baidu.com/jiaofu1127/blog/item/c0d98dd973a3b094a1ec9ca0.html 




下载地址 


http://hackmysql.com/mysqlreport 


用法 


perl mysqlreport --user root --password --socket /tmp/mysql5-1.sock 






Report Header: Line 1 
报表的第一行包含了三样不同的信息： 
MySQL Server 的版本、自上次启动后已经过多少时间、目前 Server 的日期与时间。有些人会定时让系统自动产生报表 
(eg. cron)然后用程序去分析进行分析，此时表头将可用来协助您辨识出不同时间点的报表。对于那些租用或使用虚拟主机的管理者，表头可以协助您了 
解自己所需面对的是什么样的 Server。MySQL Server 版本可以指出该 Server 有提供或没有提供那些功能，而它的 
Uptime 则表示该报表具有多大的代表性。Uptime 是重要的指标，可让您了解此份报表所包含的信息是否可能有偏误，一般来说 Uptime 
最少要有一小时会比较适当，甚至光是一小时其实也还不够。例如您的 Server 可能已执行了六个小时，但此六小时皆是在使用率最低的午夜，此时产生出 
的报表就很不具有代表性。最理想的情况下，你会希望 MySQL Server 至少已经执行了一整天，这样子一来你就可以确定报表中的信息已包含了 
Server 负载的高峰与低峰期，而不是只包含其中之一。在范例报表中 Server 只执行了 34 分钟，因此该报表的代表性是不足的，但因为这 
只是用来做范例，也就没什么关系。 
Key Report: Lines 3 - 7 
第一个主要报告 
区块就是 Key Report，因为 Key(Indexes, 索引)是所有信息中最重要的一项。虽然此报表无法告知您 Server 是否有善用 
Index，但它可以告诉您 Server 对于 Shared Key Buffer 的使用状态。请注意，这里所指的 Key Buffer 是指 
MyISAM Storage Engine 所使用的 Shared Key Buffer，InnoDB 所使用的 Key Buffer 并不包 
含在内。 
MySQL Server 支持许多种不同类型的数据表(比较正式的说法是 Storage Engine)，你可以将它们想象为各种不 
同的数据结构，而不同的 Storage Engine 各有其优缺点。其中 MySQL Server 预设是使用 
MyISAM Storage Engine。 
MySQL Server 的 Buffer 大略可分为二种： 
1. Global Buffer：由所有 Client 所共享的 Buffer 
key_buffer 
innodb_buffer_pool 
innodb_log_buffer 
innodb_additional_mem_pool 
net_buffer ...等等 


2. Thread Buffer：个别的 Connection 所需占用的 Buffer 
例如： 
sort_buffer 
myisam_sort_buffer 
read_buffer 
join_buffer 
read_rnd_buffer ...等等 


计算 Server 至少需使用的总内存数量的方式为： 
min_memory_needed = global_buffer + (thread_buffers * max_connection) 
关于 MySQL 的 Cache 机制有一点需要特别注意，各位应该都知道 MyISAM Storage Engine 将每个 table 分成三个 
档案储存在硬盘之中，例如若您有一个数据表的名称为 example，那么您就会在硬盘上发现 example.FRM, example.MYD, 
example.MYI 等三个档案。这三个档案所储存的数据如下： 
FRM： 储存这个数据表的结构 
MYD： Row Data，也就是你存在 example 数据表里的数据 
MYI： 此数据表的索引接下来是重点： 
当 MySQL 要 Cache 某个资料表时，请问 MySQL 会 Cache 哪些资料？ 
答案是： 
MySQL 只会 Cache 索引，也就是 *.MYI 档案，而 Row Data(*.MYD) 则是交由操作系统来负责 Cache。 
接下来我们再回到 Key Buffer，有个很重要的问题我们一直没有回答，就是『到底 Key Buffer 要设定多少才够呢？』。如前所述， 
MySQL 只会 Cache 索引(*.MYI)，因此您只要将数据库中所有的 MYI 档案加总起来，你就会知道大概要设为多少。 
Buffer used: Line 4 
身为 MySQL 的管理者您通常会问的第一个问题是：『Server 到底用掉了多少 key buffer？』。如果您发现 MySQL 只使用了一小 
部份的 Key Buffer，这并不是什么需要注意的问题，因为 MySQL 只会在需要的时候才实际分配与使用 System RAM。也就是说，当 
你设定 MySQL 可使用 512MB 的 RAM 时，并不代表 MySQL 启动的时候将占用 512MB 的 RAM(只有在 MySQL 认为 
需要这么做的时候才会)。报表中的第四行(Buffer used)指出 MySQL "曾经" 耗用过的最大内存数量，因此目前 "正在使用" 的内存 
数量有可能少于（甚至大于）这个数字。MySQL 称此数值为 "High Water Mark"，但在报表的下一行我们将会看到它并不总是如此。无论 
如何，从　Buffer used 我们通常可以看出 key_buffer_size 这个系统变量值是否设定的够大，如果你的 MySQL 已经使用 
了 80~90% 以上的 Key Buffer，你就应该要调高 key_buffer_size。注意，Buffer used 永远不会有使用率超 
过 95% 的情况，因为 MySQL 的官方文件中指出 Share Key Buffer 中有部份将会挪用给内部数据结构使用，因此当 
Buffer used 指出 Share Key Buffer 的使用率高达 95% 时，其实在实务上等于是已使用了 100% 的 
Share Key Buffer。在这个例子中 Server 只使用了 380KB(0.07%) 的 Share Key Buffer，看到这 
里也许您会判断 Server 的 Share Key Buffer 是十分充足的，但请勿太早下定论，我们必须要接着考虑报表中的下一行才能做出客观 
的判断......。 
Current: Line 5 
mysqlreport 使用 
Key_blocks_unused 这个系统变量来决定目前 MySQL "正在使用" 的 Share Key Buffer 大小，只有在 
MySQL Server 4.1.2 以上的版本才会有这个功能。如果报表中的上一行(Buffer used)真的有如 MySQL 官方文件中所 
说的是 "High Water Mark"，那么 Current 所载明的数值应该永远会小于或等于它。但在接下来的例子中我们将会看到，事情并不总 
是如此。目前这台 Server 已经使用了大约 60MB(12%) 的 Share Key Buffer，这是一个好现象因为它代表了你的 
Share Key Buffer 仍然十分充足。Current 与 Buffer used 合在一起看即可提供一个很有用的指标，告诉您目前的 
key_buffer_size 是否充足。 
设定 key_buffer_size 的方式也很简单，只要直接修改 MySQL 的设定档然后重新启动 Server 即可。例如若要将 Key Buffer 设定为 2000MB，则只要在 /etc/my.cnf 中加上： 
[mysqld] 
key_buffer_size=2000M 
Write ratio: Line 6 
索 
引(Indexes, Keys)主要是在内存内(RAM-Based)进行操作的，索引之所以如此有用有部份原因就归功于它们主要是在 RAM 里面运 
作，因此拥有极高的存取效能，不像储存在硬盘中的数据存取速度非常慢。然而，不可否认的是 MySQL 终究还是必须从硬盘中将索引读入 RAM 或是将 
储存在 RAM 中的索引写回硬盘之中。Write ratio 标示着 MySQL 将索引写入硬盘与 MySQL 将索引写入 RAM 的比值 
(Write Ratio = MySQL 将索引写入硬盘的次数 / MySQL 将索引写入 RAM 的次数)。具有接近于 1 的 
Write Ratio 并不是一件很罕见的事，就像 MySQL 官方手册中所说的，如果你的 MySQL 最主要的活动是 Update、 
Insert 等等，那么 Write Ratio 将会很接近于 1。Write Ratio 若大于 1 表示 MySQL 将索引写入硬盘的次数大 
于将索引写入 RAM 的次数，很少有 MySQL Server 的 Write Ratio 会大于 1，绝大部份都应该会小于 1，即便是负载非常 
重的 Server。 
Read ratio: Line 7 
Read Ratio 比 
Write Ratio 来得重要一些，它标示了 MySQL 从硬盘读取索引与从 RAM 读取索引的比值(Read Ratio = MySQL 
从硬盘读取索引的次数 / MySQL 从 RAM 读取索引的次数)。Read Ratio 的值应该要是 0.00 或 0.01，若大于这个值则表 
示 Server 有问题需要进一步的调查，通常此问题的成因是 Share Key Buffer 设得太小造成 MySQL 需要不断地从硬盘中读取 
所需要的索引信息，而这个动作是十分没有效率的并且完全抵消了使用索引可以带来的好处。在 Server 刚启动的头一个小时 Read Ratio 很 
常会出现大于 0.01 的数值，但 Server 执行过一阵子后它应该(也必须)降低至 0.01 或是 0.00。 
Questions Report: Lines 9 - 26 
第 
二个主要的报表区块，Questions，是第二重要的信息，因为它可以告诉你 MySQL 到底都在忙些什么事情。Questions 包含了 
SQL queries 以及 MySQL protocol communications。大部份的人都只在意 Server 每秒可以处理多少查 
询(Queries Per Second, QPS)，但若以整个 Server 的观点来考虑，QPS 其实是非常不精确的数值，它无法有效的告诉您 
Server 的整体运作状况。而 Questions 则提供了较完整的信息，让您一窥 Server 的全貌。 
Total: Line 10 
第 
一个字段单纯的记载 MySQL 总共响应过多少查询，第二个字段则记录响应的频率(QPS)，当大部份的人说『我的 Server 平均每秒处理 
XXX 个查询』时，他们指的其实就是第二个字段所记录的响应频率。此时你应该要反问他们『在那 XXX 个查询之中，MySQL 到底做了哪些事 
情？』，接下来 mysqlreport 将可以协助您回答此问题......。 
Distribution of Total Queries (DTQ): Lines 11 - 15 
所有的 Questions 可以大致区分为五个不同的类别： 
1.Data Manipulation Statements (DMS) 
2.query cache hits (QC Hits) 
3.COM_QUIT 
4.all other Com_ commands 
5.Unknown 
这 
五个类别将会展示在 Lines 11 至 15，但它们的顺序是会改变的。mysqlreport 预设是以查询的总数(第一个字段)来排序，次数越多 
排得越上面，让您可以快速的分辨出 MySQL 大部份时间都在忙些什么东西。理想的情况下，你会希望 MySQL 把大部份的时间都花在 DMS 与 
QC Hits 这两个类别，因为这两个类别才是真正在 "完成正事" 的类别。COM_QUIT、Com_、与 Unknown 也有其存在的必要， 
但它们应该只占了其中的一小部份。在继续深入介绍之前，也许你会好奇第三个字段是做什么用的，它代表了该分类(例如 DMS)占全部 Queries 的 
百分比；若是在子分类(例如 Select)中，则表示该子分类占所属分类(例如 DMS)的百分比。在此范例中 DMS 占了所有 Queries 的 
82.84%，这是一个很好的现象。 
Data manipulation statements(DMS) 包 
含了：ELECT, INSERT, REPLACE, UPDATE, 与 DELETE(技术上来说，其实不只这几个类别但 
mysqlreport 只会用到这几类)。基本上，你可以将 DMS 想成是 MySQL 真正有在做些 "有用的事" 的情况，因此你会希望 
DMS 是 MySQL 最忙着处理的事情。 
QC Hits 
是 MySQL 不需要实际执行 Query 而只要直接从 Query Cache 中即可找到所需数据的次数。拥有高比例的 QC Hits 是让人 
梦寐以求的事，因为从 Query Cache 直接存取所需要的数据是十分快速且有效率的。然而大部份的 MySQL Server 因为各种原因，而 
无法具有非常有效率的 Query Cache。在本范例中 QC Hits 占了所有 Questions 的 16.91%，这是非常好的情况。然 
而，千万不要被这个数值给误导了，在报表中的 38 至 45 行(Query Cache Report)将会告诉您完全不同的状况。这是一个很好的范 
例，展示了 mysqlreport 可以做为深入、相互参照与比对的分析工具。当 QC Hits 看来似乎十分完美时，这个 Server 的 
Qeury Cache Report 却可以明确的告诉您其实事情没有表面上看起来的那样完美，我们在稍后会在回到这个问题。 
COM_QUIT 算是比较不重要的类别，若您不是真的很有兴趣其实您大可忽略这个类别的内容。 
COM_ 这 
个类别代表着所有 MySQL 所执行过的指令，通常与 MySQL protocol 相关。在正常的情况下，你会希望这个类别所占的比例越低越好，因 
为当这个数值很高的时候就表示 MySQL 正忙碌于无关紧要的事情上。若这个数值很高通常代表 MySQL 正遭遇到某些很奇怪的问题，当我们深入讨论 
COM_ 的子类别的时候，我们会在回来探讨这个问题。 
Unknown 是 
推论出来的类别，在理想的状况下，之前所述的四个分类加总起来应该要等于 Questions 总数，但它们通常不会刚好等于。这是因为有些 
Questions MySQL 在处理时会增加 Total Questions 的计数器，但却没有相对应的系统变量用来记录所执行过的 
Questions。在不同的 Server 上这个数值的变异很大，在有些 Server 上这个数值非常的高，在有些 Server 上则非常的 
低，但在大部份的情况下它应该要维持在很低的水平才是。如果这个数值非常的高，可能代表 MySQL Server 有什么地方出了问题。 
Slow: Line 16 
第 16 
行非常的重要：它记录了 MySQL 总共执行了多少次 Slow Query。Slow Query 就是指执行所需时间超过某个时间区间的 
Query，例如执行超过 10 秒的 Query。用来判定是否为 Slow Query 的时间区间是可以透过 long_query_time 
这个系统变量来设定的，MySQL 预设 long_query_time 为 10 秒，但通常我们会将它设定为 5 秒。在最理想的情况下，我们会希 
望看到这个数值等于零，但通常这数值不会是零。一般来说 Slow Query 占 Total Questions 的比例应该要低于 0.05， 
Slow Query 的次数(第一个字段)本身不是很重要，真正需要注意的是 Slow Query 占 Total Questions 的比例，若 
这比例偏高就代表 Server 有些问题需要解决。第四个字段中的『%DMS: 』表示 Slow Query 在所有 DMS 中所占的比例。 
DMS: Lines 17 - 22 
DMS 
的子分类项目可以告诉我们，这台 MySQL Server 是属于哪一个类型的 MySQL Server，例如它是着重在 SELECT 操作或是 
INSERT 操作，大部份的 MySQL Server 都是着重在 SELECT 操作。知道某台 Server 是属于哪一个类型的 
MySQL Server 有助于我们思考报表中的其它信息，例如一台着重在 SELECT 操作的 MySQL Server 的 
Write Ratio 应该会非常的接近 1，并有着较高的 Lock 时间。同时它也隐含了一个意义，就是也许你可以考虑使用
InnoDB Storage Engine，因为 MySQL 预设采用的 MyISAM Storage Engine 所提供的 Lock 层级 
只有 Table Lock(只能针对整个数据表锁定)，而 InnoDB 则提供 Row Lock 层级的锁定机制(可只针对特定的 ROW 进行锁 
定，减少等待时间)。若是着重在 SELECT 操作的 Server，它的 Read Ratio 应该会接近于零，并有着非常低的 
Table Lock 时间。 
在范例中的 Server 是属于着重在 SELECT 操作的 Server：65.72% 的 
Questions 是 SELECT(第三个字段)、79.33% 的 DMS Questions 是 SELECT(第四个字段)。很明显的，这 
是台着重在 SELECT 操作的 Server，知道了此项事实之后，我们才有办法对其进行最佳化。 
Com_: Lines 23 - 26 
这个子分类只有在它的值偏高的时候才需要注意，因为过高的值表示 MySQL 正在忙着处理 "程序方面的东西"，而不是响应使用者的查询。对大部份的 Server 来说这里应该都不会出现偏高的数值，但您最好还是定期的检查一下。 
SELECT and Sort Report: Lines 28 - 36 
大 
致上来说，你只要注意第 29 行与第 31 行：Scan 与 Full Join。Scan 指的是有多少 SELECT statements 造 
成 MySQL 需要进行 Full Table Scan。Full Join 的意思与 Scan 差不多，但它是适用在多个 Tables 相互 
Join 在一起的情况。这二种情况的执行效能都非常的差，因此原则上你会希望这两个数值越低越好。但这也不是绝对的，仍然要考虑实际的情况，例如虽然 
Server 有很高比例的 Scan，但若这些 Scan 都是针对一些只有几十笔数据的 table，那么相对而言它依然是十分有效率的；但反之， 
若这些 Scan 是针对具有上百万笔数据的 table，那么就会严重影响系统效能。 
Query Cache Report: Lines 38 - 45 
Query Cache Report 只有在 MySQL 有支持 Query Cache，以及 Query Cache 功能有开启的情况下才会有这段信息出现。 
Memory usage: Line 39 
此项目指出 Query Cache 的使用状况，若系统已达到 Query Cache 的上限则会连带影响到 Prunes Value，因为当配给的 Memory 不足时，MySQL 必须不断地消除 RAM 中较不常使用的数据以挪出空间摆放新的数据。 
Block Fragmnt: Line 40 
这 
个数值越高表示 Query Cache 的 Fragment 状况越严重，通常它会界于 10%~20% 之间。在此范例中 
Block Fragmnt 为 13.05%，这是可接受的情况，当然你也可以调整 query_cache_min_res_unit 的值来降低 
Block Fragmnt。 
Hits, Inserts, Prunes: Lines 41 - 43 
Hits 
是这三个数值中最重要的一项，因为它指出有多少 SELECT statements 是可直接从 Query Cache 里面取得所需的信息，此数值 
越高就越好。Inserts 和 Prunes 最好是从第 44 行的比值来观察比较容易理解。虽然 Prunes 的值偏高可能代表着 
Query Cache 设得不够大，但并不一定是如此。在本例中只有 55% 的 Query Cache 被使用，有着相对而言算低的 
fragmentation 值，但 Prunes 值偏高，Prunes 的值(16/s)是 QC Hits 的两倍。你可以想象这台 
Server 的 Query Cache 是一颗苹果树，它的树枝被剪去的速度比你采收苹果的速度还快。 
Insrt:Prune and Hit:Insert Ratios: Lines 44 - 45 
第 44 
行中的 Insert 与 Prune 的比值可显示 Query Cache 的挥发性。在一个高度稳定的 Query Cache 中，Insrt 
的值应该要高于 Prune 的值；反之，在一个挥发性较高(较不稳定)的 Query Cache 中，这个比值将会是 1:1 或是偏重在 
Prune 那方，这表示 Query Cache 中的数据有可能在使用到之前就已经被清除了。我们会希望拥有一个稳定的 Query Cache， 
因为稳定的 Query Cache 表示那些被 Cache 在 Query Cache 中的资料会常被用到。高挥发性(较不稳定)的 
Query Cache 代表两件事情：第一，Query Cache 设得太小，需要加大。第二，MySQL 正试图要 cache 所有的东西，甚 
至是那些其实并不需要 cache 的数据。若是第一种状况，只要单纯的加大 Query Cache 即可。若是第二种情况，可能是 MySQL 试图 
要去 cache 所有可以 cache 的数据，你可以使用 SQL_NO_CACHE 来明确的告诉 MySQL 什么资料是你不想要 cache 
的。 
Hit 与 Insert 的比值代表着 Query Cache 的有效性，理想的情况是我们新增了一些 Qeury 到 
Query Cache 中，然后希望得到许多 Hits。因此若是这个 Query Cache 是有效率的，那么该比值应该要偏重在左方。若比值是 
偏重在 Insert 那方，那么这个 Query Cache 的挥发性就太高了。考虑以下这个比值，若 Hit:Insert 为 1:1，那就表示 
Query Cache 中的数据只使用了一次就被清除掉了，换句话说，我们放进去的数据比我们从里面拿出来的数据还多，这样一来就失去了使用 
Query Cache 的意义。回想我们前面所提过的，虽然在本范例中 QC Hit 在全部的 Questions 中占了很高的比例，但实际上我 
们可以发现 QC 的有效性其实是很低的(Hit:Insert 的比值偏重在 Insert 那方)。若造成这个现象的原因是 MySQL 正试图 
cache 所有的东西，那么将 Cache 模式改为 DEMAND 或许可以解决此问题。 
Table Locks Report: Lines 47 - 49 
这 
个部份包含了两项信息：第一项是 Waited，代表 MySQL 需要等待以取得 table lock 的次数。第二项是 Immediate，表示 
MySQL 不需要等待即可立刻取得 table lock 的次数。对数据库来说『等待』几乎可以肯定是一件很不好的事情，因此 Waited 的值 
应该要越小越好。最具有代表性的是第三个字段(Waited 占所有 table lock 的百分比)，这个数值应该要小于 10%，大于这个值就表示 
table/query 的索引设计不良或是有过多的 Slow Query。 
Tables Report: Lines 51 - 53 
Tables Report 
同样包含了二项信息：第一是 Open，显示目前正开启的 table 数量、总共可开启的最大数量，以及 Table Cache 的使用状况。第二是 
Opend，表示截至目前为止 MySQL 总共开启过的 Table 数量，以及除上 Uptime 后的比值。这里有两件事值得注意：首先是 
Table Cache 的使用状况，100% 的 Table Cache 使用率并不是一件坏事但你可以试着调大 Table Cache 以增进 
效能。第二是 MySQL 开启 Table 的平均速率，若这个值很高则表示您的 table_cache 设得太小了，需要调大一些。一般来说， 
MySQL 开启 Table 的平均速率最好是小于 1/s。但大于这个数值也不一定就是坏事，有些调校良好且运作的十分有效率的 
MySQL Server 其值为 7/s 并使用了 100% 的 Table Cache。 
Connections Report: Lines 55 - 57 
Connections Report 
所代表的意义与 Tables Report 相似，请各位以此类推。比较需要注意的是：若你发现 Connections 的使用率接近 100%，也 
许你会想调大 max_connections 的值以允许 MySQL 的 Client 建立更多联机。然而，这通常是一种错误。我们常常可以发现很 
多网络上的数据会教我们要调大 max_connections，但却从来没有给一个明确的理由。事实上，max_connections 的默认值 
(100)，就算是对于负载十分沉重但有良好调校过的 Server 都已十分足够。MySQL 对于单一联机的数据处理通常只需要零点几秒的时间即可完 
成，就算是最大只能使用 100 个联机也够让你用上很长一段时间。若是您的 Server 有着非常高的最大联机数(max connections) 
或是单一联机需要很长时间才可完成，那么问题八成不是 max_connections 的值不够大而是在别的地方，例如 slow queries、索 
引设计不良、甚至是过于缓慢的 DNS 解析。在您将 max_connections 的值调到 100 以上之前，您应该要先确定真的是因为 
Server 过于忙碌而需要调高此数值，而不是其它地方出了问题。每秒平均联机数有可能会很高，事实上，若这个值很高而且 Server 的运作十分 
顺畅，那么这通常会是一个好现象，无需担心。大部份 Server 的每秒平均联机数应该都会低于 5/s。 
Created Temp Report: Lines 59 - 62 
MySQL 
可以建立暂时性的数据表，它可建立在硬盘中、档案里、或是 RAM 之中，而 Created Temp Report 则提供了相关的数据供您参考。这 
些数据大多是相对而言，没有一定的标准，但将暂时性的数据表建立在硬盘中是十分没有效率的，因此 Disk table 的值最好是三者中最小的一个。当 
暂时性的数据表被建立在硬盘中，表示此数据表没有办法被放进 RAM 里面（因为 tmp_table_size 的值设得不够大）。 
Threads, Aborted, Bytes Reports: Lines 64 - 76 
这 
几个部份大多没什么好解释的，只有一个项目值得特别说明：第 66 行的最后一个字段(%Hit)。每一个连接到 MySQL 的联机都是由不同的 
Thread 来处理，当 MySQL 启动时会预先建立一些 Threads 并保留在 Thread Cache 中，如此一来 MySQL 就不 
用一直忙着建立与删除 Threads。但当每秒最大联机数大于 MySQL 的 Thread Cache 时，MySQL 就会进入 
Thread Thrash 的状态：它不断地建立新的 Threads 以满足不断增加的联机的需求。当 Thread Thrash 发生时，% 
Hit 的数值就会降低。在本范例中 %Hit 的值为 0.05%，这是非常不好的，因为它表示几乎每一个新进来的联机都会造成 MySQL 建立新的 
Thread。我们可以看到在此范例中造成此现象的原凶就在第 66 行的第一个字段，我们可以发现 Thread Cache 的值为 0，因此 
thread_cache_size 的值需要调大。 
话说回来，究竟 %Hit 接近于零真的有什么关系吗？Jeremy Zawondy 曾 
在部落格上说到：Thread caching 并不是我们最需要关心的问题，但当你解决了所有其它更严重的问题之后，它就会是最严重的问题 

使用 show full processlist 可以打印出当前执行的查询语句.  

```