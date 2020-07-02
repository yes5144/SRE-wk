## 环境配置

```
https://www.jianshu.com/p/c45f8cdca214

### 下载go二进制文件 
wget  https://dl.google.com/go/go1.13.8.linux-amd64.tar.gz
tar  -C /usr/local -xzf go1.13.8.linux-amd64.tar.gz
echo 'export GOROOT=/usr/local/go'  >> /etc/profile
echo 'export PATH=$PATH:$GOROOT/bin' >> /etc/profile
echo 'export GOPATH=/root/learnGo/' >> /etc/profile

source /etc/profile

mkdir  -p /root/learnGo/{src,pkg,bin}


### 使用 goproxy.cn代理  https://github.com/goproxy/goproxy.cn
go env -w GOPROXY=https://goproxy.cn,direct
###

### 使用阿里 go代理 http://mirrors.aliyun.com/goproxy/
export GOPROXY=https://mirrors.aliyun.com/goproxy/


### go环境部署
git clone https://github.com/golang/net.git $GOPATH/src/github.com/golang/net
git clone https://github.com/golang/sys.git $GOPATH/src/github.com/golang/sys
git clone https://github.com/golang/tools.git $GOPATH/src/github.com/golang/tools
git clone https://github.com/golang/sync.git $GOPATH/src/github.com/golang/sync
git clone https://github.com/golang/lint.git $GOPATH/src/github.com/golang/lint

mkdir -p  $GOPATH/src/golang.org/x
cp -a $GOPATH/src/github.com/golang/*  $GOPATH/src/golang.org/x

go get -v github.com/rogpeppe/godef
go get -v github.com/mdempsky/gocode
go get -v github.com/stamblerre/gocode
go get -v golang.org/x/tools/cmd/goimports
go get -v github.com/ramya-rao-a/go-outline
go get -v golang.org/x/tools/cmd/gopls


## vscode代码补全
https://maiyang.me/post/2018-09-14-tips-vscode/

git clone https://github.com/golang/sync.git $GOPATH/src/github.com/golang/sync
git clone https://github.com/golang/lint.git $GOPATH/src/github.com/golang/lint

```