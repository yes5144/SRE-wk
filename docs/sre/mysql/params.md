## 参数优化
```
Mysql-配置优化

#vim /etc/my.cnf  
在[mysqld]里面修改红色部分的参数。 (大概 37行下面 )
[mysqld]
skip-external-locking
key_buffer_size = 256M
max_allowed_packet = 100M      // 允许最大的包，默认 1M
table_open_cache = 4096      //表缓存大小，默认512
sort_buffer_size = 2M
read_buffer_size = 2M
read_rnd_buffer_size = 8M
myisam_sort_buffer_size = 64M
query_cache_size = 256M  // 查询缓存大小，默认 32M
# Try number of CPU's*2 for thread_concurrency
thread_concurrency = 8       // 这个参数改为 cpu核心数的2倍。
可以通过看cpu核心 #cat /proc/cpuinfo  |grep processor |wc -l

###############下面这些参数手动添加 ###################
log-error=/data/log/mysql.err.log 
skip-name-resolv            // 跳过DNS解析。
max_connections = 3000         //Mysql 最大的连接数
max_connect_errors = 200000 //Mysql 最大错误连接数
open_files_limit = 65535    // 打开文件最大限制数量
table_definition_cache = 4096
tmp_table_size = 32M
max_heap_table_size = 32M
innodb_file_per_table   
innodb_flush_method  = O_DIRECT
log-bin-trust-function-creators=1

slow_query_log                        
long_query_time = 0.5
slow_query_log_file = /data/log/slowquery.log
 

thread_cache_size = 4
table_cache = 64
###################### 添加上面内容 ####################

###修改下面的参数，在mysql配置文件下面的位置。
去掉下面二个参数前面的 #号，然后修改参数
innodb_buffer_pool_size = 3G    //修改为物理内存的80%，例如服务器内存为 4G，这里修改为 3G就可以。如果服务器上面运行有其他服务（ apache）可以改为内存的50%，查看内存命令 #free  -g |grep Mem |awk -F ' ' '{print $2}'
innodb_flush_log_at_trx_commit = 2    //binlog提交模式，默认是1

修改完成后保存，重启 mysql服务器。
#service mysqld restart


#################################
Mysql-5.7 优化参数

max_connections=2000
max_connect_errors=100000
interactive_timeout=36000
wait_timeout=36000
skip_name_resolve=ON
sync_binlog=2
expire_logs_days=10
max_binlog_size=512M
open_files_limit=10000
binlog_cache_size=1G
table_open_cache=4096
query_cache_size=64M
sort_buffer_size=4M
read_buffer_size=64k
max_allowed_packet=512M
innodb_buffer_pool_size=8G
innodb_buffer_pool_instances=1G
innodb_flush_log_at_trx_commit=1
innodb_log_buffer_size=8M


max_connections：允许客户端并发连接的最大数量，默认值是151，一般将该参数设置为500-2000
max_connect_errors：如果客户端尝试连接的错误数量超过这个参数设置的值，则服务器不再接受新的客户端连接。可以通过清空主机的缓存来解除服务器的这种阻止新连接的状态，通过FLUSH HOSTS或mysqladmin flush-hosts命令来清空缓存。这个参数的默认值是100，一般将该参数设置为100000。

interactive_timeout：Mysql关闭交互连接前的等待时间，单位是秒，默认是8小时，建议不要将该参数设置超过24小时，即86400

wait_timeout：Mysql关闭非交互连接前的等待时间，单位是秒，默认是8小时，建议不要将该参数设置超过24小时，即86400

skip_name_resolve：如果这个参数设为OFF，则MySQL服务在检查客户端连接的时候会解析主机名；如果这个参数设为ON，则MySQL服务只会使用IP，在这种情况下，授权表中的Host字段必须是IP地址或localhost。
这个参数默认是关闭的

back_log：MySQL服务器连接请求队列所能处理的最大连接请求数，如果队列放满了，后续的连接才会拒绝。当主要的MySQL线程在很短时间内获取大量连接请求时，这个参数会生效。接下来，MySQL主线程会花费很短的时间去检查连接，然后开启新的线程。这个参数指定了MySQL的TCP/IP监听队列的大小。如果MySQL服务器在短时间内有大量的连接，可以增加这个参数。
文件相关参数sync_binlog：控制二进制日志被同步到磁盘前二进制日志提交组的数量。当这个参数为0的时候，二进制日志不会被同步到磁盘；当这个参数设为0以上的数值时，就会有设置该数值的二进制提交组定期同步日志到磁盘。当这个参数设为1的时候，所有事务在提交前会被同步到二进制日志中，因而即使MySQL服务器发生意外重启，任何二进制日志中没有的事务只会处于准备状态，这会导致MySQL服务器自动恢复以回滚这些事务。这样就会保证二进制日志不会丢失事务，是最安全的选项；同时由于增加了磁盘写，这对性能有一定降低。将这个参数设为1以上的数值会提高数据库的性能，但同时会伴随数据丢失的风险。建议将该参数设为2、4、6、8、16。

expire_logs_days：二进制日志自动删掉的时间间隔。默认值为0，代表不会自动删除二进制日志。想手动删除二进制日志，可以执行 PURGE BINARY LOGS。

max_binlog_size：二进制日志文件的最大容量，当写入的二进制日志超过这个值的时候，会完成当前二进制的写入，向新的二进制日志写入日志。这个参数最小值时4096字节；最大值和默认值时1GB。相同事务中的语句都会写入同一个二进制日志，当一个事务很大时，二进制日志实际的大小会超过max_binlog_size参数设置的值。如果max_relay_log_size参数设为0，则max_relay_log_size参数会使用和max_binlog_size参数同样的大小。建议将此参数设为512M。

local_infile：是否允许客户端使用LOAD DATA INFILE语句。如果这个参数没有开启，客户端不能在LOAD DATA语句中使用LOCAL参数。

open_files_limit：操作系统允许MySQL服务打开的文件数量。这个参数实际的值以系统启动时设定的值、max_connections和table_open_cache为基础，使用下列的规则：
10 + max_connections + (table_open_cache * 2)
max_connections * 5
MySQL启动时指定open_files_limit的值

缓存控制参数binlog_cache_size：在事务中二进制日志使用的缓存大小。如果MySQL服务器支持所有的存储引擎且启用二进制日志，每个客户端都会被分配一个二进制日志缓存。如果数据库中有很多大的事务，增大这个缓存可以获得更好的性能。
Binlog_cache_use和Binlog_cache_disk_use这两个参数对于binlog_cache_size参数的优化很有用。binlog_cache_size参数只设置事务所使用的缓存，非事务SQL语句所使用的缓存由binlog_stmt_cache_size系统参数控制。建议不要将这个参数设为超过64MB，以防止客户端连接多而影响MySQL服务的性能。

max_binlog_cache_size：如果一个事务需要的内存超过这个参数，服务器会报错"Multi-statement transaction required more than 'max_binlog_cache_size' bytes"。这个参数最大的推荐值是4GB，这是因为MySQL不能在二进制日志设为超过4GB的情况下正常的工作。建议将该参数设为binlog_cache_size*2。

binlog_stmt_cache_size：这个参数决定二进制日志处理非事务性语句的缓存。如果MySQL服务支持任何事务性的存储引擎且开启了二进制日志，每个客户端连接都会被分配二进制日志事务和语句缓存。如果数据库中经常运行大的事务，增加这个缓存可以获得更好的性能。

table_open_cache：所有线程能打开的表的数量。

thread_cache_size：MySQL服务缓存以重用的线程数。当客户端断开连接的时候，如果线程缓存没有使用满，则客户端的线程被放入缓存中。如果有客户端断开连接后再次连接到MySQL服务且线程在缓存中，则MySQL服务会优先使用缓存中的线程；如果线程缓存没有这些线程，则MySQL服务器会创建新的线程。如果数据库有很多的新连接，可以增加这个参数来提升性能。如果MySQL服务器每秒有上百个连接，可以增大thread_cache_size参数来使MySQL服务器使用缓存的线程。通过检查Connections和Threads_created状态参数，可以判断线程缓存是否足够。这个参数默认的值是由下面的公式来决定的：8 + (max_connections / 100)

建议将此参数设置为300~500。线程缓存的命中率计算公式为(1-thread_created/connections)*100%，可以通过这个公式来优化和调整thread_cache_size参数。
query_cache_size：为查询结果所分配的缓存。默认这个参数是没有开启的。这个参数的值应设为整数的1024倍，如果设为其他值则会被自动调整为接近此数值的1024倍。这个参数最小需要40KB。建议不要将此参数设为大于256MB，以免占用太多的系统内存。

query_cache_min_res_unit：查询缓存所分配的最小块的大小。默认值是4096(4KB)。

query_cache_type：设置查询缓存的类型。当这个参数为0或OFF时，则MySQL服务器不会启用查询缓存；当这个参数为1或ON时，则MySQL服务器会缓存所有查询结果（除了带有SELECT SQL_NO_CACHE的语句）；当这个参数为2或DEMAND时，则MySQL服务器只会缓存带有SELECT SQL_CACHE的语句。

sort_buffer_size：每个会话执行排序操作所分配的内存大小。想要增大max_sort_length参数，需要增大sort_buffer_size参数。如果在SHOW GLOBAL STATUS输出结果中看到每秒输出的Sort_merge_passes状态参数很大，可以考虑增大sort_buffer_size这个值来提高ORDER BY 和 GROUP BY的处理速度。建议设置为1~4MB。当个别会话需要执行大的排序操作时，在会话级别增大这个参数。

read_buffer_size：为每个线程对MyISAm表执行顺序读所分配的内存。如果数据库有很多顺序读，可以增加这个参数，默认值是131072字节。这个参数的值需要是4KB的整数倍。这个参数也用在下面场景中：
当执行ORDER BY操作时，缓存索引到临时文件（不是临时表）中；
执行批量插入到分区表中；
缓存嵌套查询的执行结果。

read_rnd_buffer_size：这个参数用在MyISAM表和任何存储引擎表随机读所使用的内存。当从MyISAM表中以键排序读取数据的时候，扫描的行将使用这个缓存以避免磁盘的扫描。将这个值设到一个较大的值可以显著提升ORDER BY的性能。然后，这个参数会应用到所有的客户端连接，所有不应该将这个参数在全局级别设为一个较大的值；在运行大查询的会话中，在会话级别增大这个参数即可。

join_buffer_size：MySQL服务器用来作普通索引扫描、范围索引扫描和不使用索引而执行全表扫描这些操作所用的缓存大小。通常，获取最快连接的方法是增加索引。当不能增加索引的时候，使全连接变快的方法是增大join_buffer_size参数。对于执行全连接的两张表，每张表都被分配一块连接内存。对于没有使用索引的多表复杂连接，需要多块连接内存。通常来说，可以将此参数在全局上设置一个较小的值，而在需要执行大连接的会话中在会话级别进行设置。默认值是256KB。

net_buffer_length：每个客户端线程和连接缓存和结果缓存交互，每个缓存最初都被分配大小为net_buffer_length的容量，并动态增长，直至达到max_allowed_packet参数的大小。当每条SQL语句执行完毕后，结果缓存会缩小到net_buffer_length大小。不建议更改这个参数，除非你的系统有很少的内存，可以调整这个参数。如果语句需要的内存超过了这个参数的大小，则连接缓存会自动增大。net_buffer_length参数最大可以设置到1MB。不能在会话级别设置这个参数。

max_allowed_packet：网络传输时单个数据包的大小。默认值是4MB。包信息缓存的初始值是由net_buffer_length指定的，但是包可能会增长到max_allowed_packet参数设置的值。如果要使用BLOB字段或长字符串，需要增加这个参数的值。这个参数的值需要设置成和最大的BLOB字段一样的大小。max_allowed_packet参数的协议限制是1GB。这个参数应该是1024整数倍。

bulk_insert_buffer_size：MyISAM表使用一种特殊的树状缓存来提高批量插入的速度，如INSERT ... SELECT,INSERT ... VALUES (...),(...), ...,对空表执行执行LOAD DATA INFILE。这个参数每个线程的树状缓存大小。将这个参数设为0会关闭这个参数。这个参数的默认值是8MB。
max_heap_table_size：这个参数设置用户创建的MEMORY表允许增长的最大容量，这个参数用来MEMORY表的MAX_ROWS值。设置这个参数对已有的MEMORY表没有影响，除非表重建或执行ALTER TABLE、TRUNCATE TABLE语句。

这个参数也和tmp_table_size参数一起来现在内部in-memory表的大小。如果内存表使用频繁，可以增大这个参数的值。

tmp_table_size：内部内存临时表的最大内存。这个参数不会应用到用户创建的MEMORY表。如果内存临时表的大小超过了这个参数的值，则MySQL会自动将超出的部分转化为磁盘上的临时表。在MySQL 5.7.5版本，internal_tmp_disk_storage_engine存储引擎将作为磁盘临时表的默认引擎。在MySQL 5.7.5之前的版本，会使用MyISAM存储引擎。如果有很多的GROUP BY查询且系统内存充裕，可以考虑增大这个参数。

innodb_buffer_pool_dump_at_shutdown：指定在MySQL服务关闭时，是否记录InnoDB缓存池中的缓存页，以缩短下次重启时的预热过程。通常和innodb_buffer_pool_load_at_startup参数搭配使用。innodb_buffer_pool_dump_pct参数定义了保留的最近使用缓存页的百分比。

innodb_buffer_pool_dump_now：立刻记录InnoDB缓冲池中的缓存页。通常和innodb_buffer_pool_load_now搭配使用。

innodb_buffer_pool_load_at_startup：指定MySQL服务在启动时，InnoDB缓冲池通过加载之前的缓存页数据来自动预热。通常和innodb_buffer_pool_dump_at_shutdown参数搭配使用。

innodb_buffer_pool_load_now：立刻通过加载数据页来预热InnoDB缓冲池，无需重启数据库服务。可以用来在性能测试时，将缓存改成到一个已知的状态；或在数据库运行报表查询或维护后，将数据库改成到一个正常的状态。
MyISAM参数key_buffer_size：所有线程所共有的MyISAM表索引缓存，这块缓存被索引块使用。增大这个参数可以增加索引的读写性能，在主要使用MyISAM存储引擎的系统中，可设置这个参数为机器总内存的25%。如果将这个参数设置很大，比如设为机器总内存的50%以上，机器会开始page且变得异常缓慢。可以通过SHOW STATUS 语句查看 Key_read_requests,Key_reads,Key_write_requests, and Key_writes这些状态值。正常情况下Key_reads/Key_read_requests 比率应该小于0.01。数据库更新和删除操作频繁的时候，Key_writes/Key_write_requests 比率应该接近1。

key_cache_block_size：key缓存的块大小，默认值是1024字节。

myisam_sort_buffer_size：在REPAIR TABLE、CREATE INDEX 或 ALTER TABLE操作中，MyISAM索引排序使用的缓存大小。

myisam_max_sort_file_size：当重建MyISAM索引的时候，例如执行REPAIR TABLE、 ALTER TABLE、 或 LOAD DATA INFILE命令，MySQL允许使用的临时文件的最大容量。如果MyISAM索引文件超过了这个值且磁盘还有充裕的空间，增大这个参数有助于提高性能。

myisam_repair_threads：如果这个参数的值大于1，则MyISAM表在执行Repair操作的排序过程中，在创建索引的时候会启用并行，默认值为1。
InnoDB参数innodb_buffer_pool_size：InnDB存储引擎缓存表和索引数据所使用的内存大小。默认值是128MB。在以InnDB存储引擎为主的系统中，可以将这个参数设为机器物理内存的80%。同时需要注意：
设置较大物理内存时是否会引擎页的交换而导致性能下降；
InnoDB存储引擎会为缓存和控制表结构信息使用部分内存，因而实际花费的内存会比设置的值大于10%；
这个参数设置的越大，初始化内存池的时间越长。在MySQL 5.7.5版本，可以以chunk为单位增加或减少内存池的大小。chunk的大小可以通过innodb_buffer_pool_chunk_size参数设定，默认值是128MB。内存池的大小可以等于或是innodb_buffer_pool_chunk_size * innodb_buffer_pool_instances的整数倍。

innodb_buffer_pool_instances：InnoDB缓存池被分成的区域数。对于1GB以上大的InnoDB缓存，将缓存分成多个部分可以提高MySQL服务的并发性，减少不同线程读缓存页的读写竞争。每个缓存池有它单独的空闲列表、刷新列表、LRU列表和其他连接到内存池的数据结构，它们被mutex锁保护。这个参数只有将innodb_buffer_pool_size参数设为1GB或以上时才生效。建议将每个分成的内存区域设为1GB大小。

innodb_max_dirty_pages_pct：当Innodb缓存池中脏页所占的百分比达到这个参数的值时，InnoDB会从缓存中向磁盘写入数据。默认值是75。
innodb_thread_concurrency：InnoDB存储引擎可以并发使用的最大线程数。当InnoDB使用的线程超过这参数的值时，后面的线程会进入等待状态，以先进先出的算法来处理。等待锁的线程不计入这个参数的值。这个参数的范围是0~1000。默认值是0。当这个参数为0时，代表InnoDB线程的并发数没有限制，这样会导致MySQL创建它所需要的尽可能多的线程。设置这个参数可以参考下面规则：
如果用户线程的并发数小于64，可以将这个参数设为0；
如果系统并发很严重，可以先将这个参数设为128，然后再逐渐将这个参数减小到96, 80, 64或其他数值，直到找到性能较好的一个数值。

innodb_flush_method：指定刷新数据到InnoDB数据文件和日志文件的方法，刷新方法会对I/O有影响。如果这个参数的值为空，在类Unix系统上，这个参数的默认值为fsync；在Windows系统上，这个参数的默认值为async_unbuffered。在类Unix系统上，这个参数可设置的值如下：
fsync:InnoDB使用fsync()系统函数来刷新数据和日志文件，fsync是默认参数。
O_DSYNC:InnoDB使用O_SYNC函数来打开和刷新日志文件，使用fsync()函数刷新数据文件
littlesync:这个选项用在内部性能的测试，目前MySQL尚不支持，使用这个参数又一定的风险
nosync:这个选项用在内部性能的测试，目前MySQL尚不支持，使用这个参数又一定的风险
O_DIRECT:InnoDB使用O_DIRECT（或者directio()在Solaris）函数打开数据文件，使用fsync()刷新数据文件和日志文件
O_DIRECT_NO_FSYNC:在刷新I/O时，InnoDB使用O_DIRECT方式。

在有RAID卡和写缓存的系统中，O_DIRECT有助于避免InnoDB缓存池和操作系统缓存之间的双重缓存。在InnoDB数据和日志文件放在SAN存储上面的系统，默认值或O_DSYNC方法会对以读为主的数据库起到加速作用。
innodb_data_home_dir：InnoDB系统表空间所使用的数据文件的物理路径，默认路径是MySQL数据文件路径。如果这个参数的值为空，可以在innodb_data_file_path参数里使用绝对路径

innodb_data_file_path：InnoDB数据文件的路径和大小。

innodb_file_per_table：当这个参数启用的时候，InnoDB会将新建表的数据和索引单独存放在.ibd格式的文件中，而不是存放在系统表空间中。当这张表被删除或TRUNCATE时，InnoDB表所占用的存储会被释放。这个设定会开启InnoDB的一些其他特性，比如表的压缩。当这个参数关闭的时候，InnoDB会将表和索引的数据存放到系统表空间的ibdata文件中，这会有一个问题，因为系统表空间不会缩小，这样设置会导致空间无法回放。

innodb_undo_directory：InnoDB undo日志所在表空间的物理路径。和innodb_undo_logs、innodb_undo_tablespaces参数配合，来设置undo日志的路径，默认路径是数据文件路径。

innodb_undo_logs：指定InnoDB使用的undo日志的个数。在MySQL 5.7.2版本，32个undo日志被临时表预留使用，并且这些日志存放在临时表表空间(ibtmp1)中。如果undo日志只存放在系统表空间中，想要额外分配供数据修改事务用的undo日志，innodb_undo_logs参数必须设置为32以上的整数。如果你配置了单独的undo表空间，要将innodb_undo_logs参数设为33以上来分配额外供数据修改事务使用的undo日志。每个undo日志最多可以支持1024个事务。如果这个参数没有设置，则它会设为默认值128。

innodb_undo_tablespaces：undo日志的表空间文件数量。默认，所有的undo日志都是系统表空间的一部分。因为在运行大的事务时，undo日志会增大，将undo日志设置在多个表空间中可以减少一个表空间的大小。undo表空间文件创建在innodb_undo_directory参数指定的路径下，以undoN格式命名，N是以0开头的一系列整数。undo表空间的默认大小为10M。需要在初始化InnoDB前设置innodb_undo_tablespaces这个参数。在MySQL 5.7.2版本，在128个undo日志中，有32个undo日志是为临时表所预留的，有95个undo日志供undo表空间使用。

innodb_log_files_in_group：InnoDB日志组包含的日志个数。InnoDB以循环的方式写入日志。这个参数的默认值和推荐值均是2。日志的路径由innodb_log_group_home_dir参数设定。

innodb_log_group_home_dir：InnoDB重做日志文件的物理路径，重做日志的数量由innodb_log_files_in_group参数指定。如果不指定任何InnoDB日志参数，MySQL默认会在MySQL数据文件路径下面创建两个名为ib_logfile0、ib_logfile1的两个重做日志文件，它们的大小由innodb_log_file_size参数设定。

innodb_log_file_size：日志组中每个日志文件的字节大小。所有日志文件的大小(innodb_log_file_size * innodb_log_files_in_group)不能超过512GB。

innodb_log_buffer_size：InnoDB写入磁盘日志文件所使用的缓存字节大小。如果innodb_page_size参数为32K，则默认值是8MB；如果innodb_page_size参数为64K，则默认值是16MB。如果日志的缓存设置较大，则MySQL在处理大事务时，在提交事务前无需向磁盘写入日志文件。建议设置此参数为4~8MB。

innodb_flush_log_at_trx_commit：当提交相关的I/O操作被批量重新排列时，这个参数控制提交操作的ACID一致性和高性能之间的平衡。可以改变这个参数的默认值来提升数据库的性能，但是在数据库宕机的时候会丢失少量的事务。这个参数的默认值为1，代表数据库遵照完整的ACID模型，每当事务提交时，InnoDB日志缓存中的内容均会被刷新到日志文件，并写入到磁盘。当这个参数为0时，InnDB日志缓存大概每秒刷新一次日志文件到磁盘。当事务提交时，日志缓存不会立刻写入日志文件，这样的机制不会100%保证每秒都向日志文件刷新日志，当mysqld进程宕掉的时候可能会丢失持续时间为1秒左右的事务数据。当这个参数为2时，当事务提交后，InnoDB日志缓存中的内容会写入到日志文件且日志文件，日志文件以大概每秒一次的频率刷新到磁盘。在MySQL 5.6.6版本，InnoDB日志刷新频率由innodb_flush_log_at_timeout参数决定。通常将个参数设为1。

innodb_flush_log_at_timeout：写入或刷新日志的时间间隔。这个参数是在MySQL 5.6.6版本引入的。在MySQL 5.6.6版本之前，刷新的频率是每秒刷新一次。innodb_flush_log_at_timeout参数的默认值也是1秒刷新一次。

innodb_lock_wait_timeout：InnDB事务等待行锁的时间长度。默认值是50秒。当一个事务锁定了一行，这时另外一个事务想访问并修改这一行，当等待时间达到innodb_lock_wait_timeout参数设置的值时，MySQL会报错"ERROR 1205 (HY000): Lock wait timeout exceeded; try restarting transaction"，同时会回滚语句（不是回滚整个事务）。如果想回滚整个事务，需要使用--innodb_rollback_on_timeout参数启动MySQL。在高交互性的应用系统或OLTP系统上，可以减小这个参数来快速显示用户的反馈或把更新放入队列稍后处理。在数据仓库中，为了更好的处理运行时间长的操作，可以增大这个参数。这个参数只应用在InnoDB行锁上，这个参数对表级锁无效。这个参数不适用于死锁，因为发生死锁时，InnoDB会立刻检测到死锁并将发生死锁的一个事务回退。

innodb_fast_shutdown：InnoDB关库模式。如果这个参数为0，InnoDB会做一个缓慢关机，在关机前会做完整的刷新操作，这个级别的关库操作会持续数分钟，当缓存中的数据量很大时，甚至会持续几个小时；如果数据库要执行版本升级或降级，需要执行这个级别的关库操作，以保证所有的数据变更都写入到数据文件。如果这个参数的值是1（默认值），为了节省关库时间，InnoDB会跳过新操作，而是在下一次开机的时候通过crash recovery方式执行刷新操作。如果这个参数的值是2，InnoDB会刷新日志并以冷方式关库，就像MySQL宕机一样，没有提交的事务会丢失，在下一次开启数据库时，crash recovery所需要的时间更长；在紧急或排错情形下，需要立刻关闭数据库时，会使用这种方式停库。

```