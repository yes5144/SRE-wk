## 1.3 常用场景

### 1、获取10.1.85.21和10.1.85.19之间的通信，使用命令注意转义符号。
tcpdump host 10.1.85.21 and \( 10.1.85.19\) -i ens5f0 -nn -c 10

### 2、获取从10.1.85.21发来的包。
tcpdump src host 10.1.85.21 -c 10 -i ens5f1

### 3、监听tcp（udp）端口。
tcpdump tcp port 22 -c 10

### 4、获取主机10.1.85.21和除10.1.85.19之外所有主机的通信。
tcpdump ip host 10.1.85.21 and ! 10.1.85.19 -c 10 -i any

### 5、获取从10.1.85.19且端口主机到10.1.85.21主机的通信。

tcpdump src host 10.1.85.19 and src port 48565 and dst host 10.1.85.21 and dst port 5090 -i any -c 10 -nn


#################3
### 6、抓取所有经过 en0，目的或源地址是 10.37.63.255 的网络数据：
tcpdump -i en0 host 10.37.63.255

### 7、抓取主机10.37.63.255和主机10.37.63.61或10.37.63.95的通信：
tcpdump host 10.37.63.255 and \(10.37.63.61 or 10.37.63.95 \)

### 8、抓取主机192.168.13.210除了和主机10.37.63.61之外所有主机通信的数据包：
tcpdump -n host 10.37.63.255 and ! 10.37.63.61

### 9、抓取主机10.37.63.255除了和主机10.37.63.61之外所有主机通信的ip包
tcpdump ip -n host 10.37.63.255 and ! 10.37.63.61

### 10、抓取主机10.37.63.3发送的所有数据：
tcpdump -i en0 src host 10.37.63.3 （注意数据流向）

### 11、抓取主机10.37.63.3接收的所有数据：
tcpdump -i en0 dst host 10.37.63.3 （注意数据流向） 

### 12、抓取主机10.37.63.3所有在TCP 80端口的数据包：
tcpdump -i en0 host 10.37.63.3 and tcp port 80

### 13、抓取HTTP主机10.37.63.3在80端口接收到的数据包：
tcpdump -i en0 host 10.37.63.3 and dst port 80

### 14、抓取所有经过 en0，目的或源端口是 25 的网络数据
tcpdump -i en0 port 25
tcpdump -i en0 src port 25 # 源端口
tcpdump -i en0 dst port 25网络过滤 # 目的端口

### 15、抓取所有经过 en0，网络是 192.168上的数据包
tcpdump -i en0 net 192.168
tcpdump -i en0 src net 192.168
tcpdump -i en0 dst net 192.168
tcpdump -i en0 net 192.168.1
tcpdump -i en0 net 192.168.1.0/24

### 16、协议过滤
tcpdump -i en0 arp
tcpdump -i en0 ip
tcpdump -i en0 tcp
tcpdump -i en0 udp
tcpdump -i en0 icmp

### 17、抓取所有经过 en0，目的地址是 192.168.1.254 或 192.168.1.200 端口是 80 的 TCP 数据
tcpdump -i en0 '((tcp) and (port 80) and ((dst host 192.168.1.254) or (dst host 192.168.1.200)))'

### 18、抓取所有经过 en0，目标 MAC 地址是 00:01:02:03:04:05 的 ICMP 数据
tcpdump -i eth1 '((icmp) and ((ether dst host 00:01:02:03:04:05)))'

### 19、抓取所有经过 en0，目的网络是 192.168，但目的主机不是 192.168.1.200 的 TCP 数据
tcpdump -i en0 '((tcp) and ((dst net 192.168) and (not dst host 192.168.1.200)))'

### 20、只抓 SYN 包
tcpdump -i en0 'tcp[tcpflags] = tcp-syn'

### 21、抓 SYN, ACK
tcpdump -i en0 'tcp[tcpflags] & tcp-syn != 0 and tcp[tcpflags] & tcp-ack != 0'

### 22、抓 SMTP 数据，抓取数据区开始为"MAIL"的包，"MAIL"的十六进制为 0x4d41494c
tcpdump -i en0 '((port 25) and (tcp[(tcp[12]>>2):4] = 0x4d41494c))'

### 23、抓 HTTP GET 数据，"GET "的十六进制是 0x47455420
tcpdump -i en0 'tcp[(tcp[12]>>2):4] = 0x47455420'

# 0x4745 为"GET"前两个字母"GE",0x4854 为"HTTP"前两个字母"HT"
tcpdump  -XvvennSs 0 -i en0 tcp[20:2]=0x4745 or tcp[20:2]=0x4854

### 24、抓 SSH 返回，"SSH-"的十六进制是 0x5353482D
tcpdump -i en0 'tcp[(tcp[12]>>2):4] = 0x5353482D'

# 抓老版本的 SSH 返回信息，如"SSH-1.99.."
tcpdump -i en0 '(tcp[(tcp[12]>>2):4] = 0x5353482D) and (tcp[((tcp[12]>>2)+4):2] = 0x312E)'

### 25、抓 DNS 请求数据
tcpdump -i en0 udp dst port 53

### 26、用-c 参数指定抓多少个包
time tcpdump -nn -i en0 'tcp[tcpflags] = tcp-syn' -c 10000 > /dev/null

上面的命令计算抓 10000 个 SYN 包花费多少时间，可以判断访问量大概是多少。

### 27、实时抓取端口号8000的GET包，然后写入GET.log
tcpdump -i en0 '((port 8000) and (tcp[(tcp[12]>>2):4]=0x47455420))' -nnAl -w /tmp/GET.log


作者：道无虚
链接：https://www.jianshu.com/p/23427a80fc9d

作者：猿码架构
链接：https://www.jianshu.com/p/a62ed1bb5b20
