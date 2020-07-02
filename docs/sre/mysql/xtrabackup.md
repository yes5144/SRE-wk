## xtrabackup

```
#!/bin/sh
# add ling
## https://cloud.tencent.com/developer/article/1441289

###### 全量备份的脚本

INNOBACKUPEX=innobackupex
INNOBACKUPEXFULL=/usr/bin/$INNOBACKUPEX
TODAY=`date +%Y%m%d%H%M`
YESTERDAY=`date -d"yesterday" +%Y%m%d%H%M`
USEROPTIONS="--user=user --password=123456"
TMPFILE="/logs/mysql/innobackup_$TODAY.$$.tmp"
MYCNF=/etc/my.cnf
MYSQL=/usr/local/mariadb/bin/mysql
MYSQLADMIN=/usr/local/mariadb/bin/mysqladmin
BACKUPDIR=/backup/mysql # 备份的主目录
FULLBACKUPDIR=$BACKUPDIR/full # 全库备份的目录
INCRBACKUPDIR=$BACKUPDIR/incr # 增量备份的目录
KEEP=1 # 保留几个全库备份
 
# Grab start time
#############################################################################
# Display error message and exit
#############################################################################
error()
{
    echo "$1" 1>&2
    exit 1
}
 
# Check options before proceeding
if [ ! -x $INNOBACKUPEXFULL ]; then
  error "$INNOBACKUPEXFULL does not exist."
fi
 
if [ ! -d $BACKUPDIR ]; then
  error "Backup destination folder: $BACKUPDIR does not exist."
fi
 
if [ -z "`$MYSQLADMIN $USEROPTIONS status | grep 'Uptime'`" ] ; then
 error "HALTED: MySQL does not appear to be running."
fi
 
if ! `echo 'exit' | $MYSQL -s $USEROPTIONS` ; then
 error "HALTED: Supplied mysql username or password appears to be incorrect (not copied here for security, see script)."
fi
 
# Some info output
echo "----------------------------"
echo
echo "$0: MySQL backup script"
echo "started: `date`"
echo
 
# Create full and incr backup directories if they not exist.
for i in $FULLBACKUPDIR $INCRBACKUPDIR
do
        if [ ! -d $i ]; then
                mkdir -pv $i
        fi
done
 
# 压缩上传前一天的备份
echo "压缩前一天的备份，scp到远程主机"
cd $BACKUPDIR
tar -zcvf $YESTERDAY.tar.gz ./full/ ./incr/
scp -P 8022 $YESTERDAY.tar.gz root@192.168.10.46:/data/backup/mysql/
if [ $? = 0 ]; then
  rm -rf $BACKUPDIR/full $BACKUPDIR/incr
  echo "Running new full backup."
  innobackupex --defaults-file=$MYCNF $USEROPTIONS $FULLBACKUPDIR > $TMPFILE 2>&1
else
  echo "Error with scp."
fi
 
if [ -z "`tail -1 $TMPFILE | grep 'completed OK!'`" ] ; then
 echo "$INNOBACKUPEX failed:"; echo
 echo "---------- ERROR OUTPUT from $INNOBACKUPEX ----------"
# cat $TMPFILE
# rm -f $TMPFILE
 exit 1
fi

# 这里获取这次备份的目录 
THISBACKUP=`awk -- "/Backup created in directory/ { split( \\\$0, p, \"'\" ) ; print p[2] }" $TMPFILE`
echo "THISBACKUP=$THISBACKUP"
#rm -f $TMPFILE
echo "Databases backed up successfully to: $THISBACKUP"

# Cleanup
echo "delete tar files of 3 days ago"
find $BACKUPDIR/ -mtime +3 -name "*.tar.gz"  -exec rm -rf {} \;
 
echo
echo "completed: `date`"
exit 0



#!/bin/sh
# add ling

###### 增量备份的脚本

INNOBACKUPEX=innobackupex
INNOBACKUPEXFULL=/usr/bin/$INNOBACKUPEX
TODAY=`date +%Y%m%d%H%M`
USEROPTIONS="--user=user --password=123456"
TMPFILE="/logs/mysql/incr_$TODAY.$$.tmp"
MYCNF=/etc/my.cnf
MYSQL=/usr/local/mariadb/bin/mysql
MYSQLADMIN=/usr/local/mariadb/bin/mysqladmin
BACKUPDIR=/backup/mysql # 备份的主目录
FULLBACKUPDIR=$BACKUPDIR/full # 全库备份的目录
INCRBACKUPDIR=$BACKUPDIR/incr # 增量备份的目录

#############################################################################
# Display error message and exit
#############################################################################
error()
{
    echo "$1" 1>&2
    exit 1
}
 
# Check options before proceeding
if [ ! -x $INNOBACKUPEXFULL ]; then
  error "$INNOBACKUPEXFULL does not exist."
fi
 
if [ ! -d $BACKUPDIR ]; then
  error "Backup destination folder: $BACKUPDIR does not exist."
fi
 
if [ -z "`$MYSQLADMIN $USEROPTIONS status | grep 'Uptime'`" ] ; then
 error "HALTED: MySQL does not appear to be running."
fi
 
if ! `echo 'exit' | $MYSQL -s $USEROPTIONS` ; then
 error "HALTED: Supplied mysql username or password appears to be incorrect (not copied here for security, see script)."
fi
 
# Some info output
echo "----------------------------"
echo
echo "$0: MySQL backup script"
echo "started: `date`"
echo
 
# Create full and incr backup directories if they not exist.
for i in $FULLBACKUPDIR $INCRBACKUPDIR
do
        if [ ! -d $i ]; then
                mkdir -pv $i
        fi
done
 
# Find latest full backup
LATEST_FULL=`find $FULLBACKUPDIR -mindepth 1 -maxdepth 1 -type d -printf "%P\n"`
echo "LATEST_FULL=$LATEST_FULL" 

# Run an incremental backup if latest full is still valid.
# Create incremental backups dir if not exists.
TMPINCRDIR=$INCRBACKUPDIR/$LATEST_FULL
mkdir -p $TMPINCRDIR
BACKTYPE="incr"
# Find latest incremental backup.
LATEST_INCR=`find $TMPINCRDIR -mindepth 1 -maxdepth 1 -type d | sort -nr | head -1`
echo "LATEST_INCR=$LATEST_INCR"
  # If this is the first incremental, use the full as base. Otherwise, use the latest incremental as base.
if [ ! $LATEST_INCR ] ; then
  INCRBASEDIR=$FULLBACKUPDIR/$LATEST_FULL
else
  INCRBASEDIR=$LATEST_INCR
fi
echo "Running new incremental backup using $INCRBASEDIR as base."
innobackupex --defaults-file=$MYCNF $USEROPTIONS --incremental $TMPINCRDIR --incremental-basedir $INCRBASEDIR > $TMPFILE 2>&1

 
if [ -z "`tail -1 $TMPFILE | grep 'completed OK!'`" ] ; then
 echo "$INNOBACKUPEX failed:"; echo
 echo "---------- ERROR OUTPUT from $INNOBACKUPEX ----------"
 exit 1
fi

# 这里获取这次备份的目录 
THISBACKUP=`awk -- "/Backup created in directory/ { split( \\\$0, p, \"'\" ) ; print p[2] }" $TMPFILE`
echo "THISBACKUP=$THISBACKUP"
echo
echo "Databases backed up successfully to: $THISBACKUP"

echo
echo "incremental completed: `date`"
exit 0

```