### go安装
```
1，二进制安装
2，GVM第三方工具安装
```

### GOPATH设置
```
export GOPATH=/home/apple/mygo
```

### 获取远程包

```
go get github.com/astaxie/beedb

go build

go clean 移除当前源码包里面编译生成的文件。

go fmt 

go get 
这个命令在内部实际上分为两步操作，1、下载；2、go install

go install 这个命令在内部实际上分成两步操作：第一步是生成结果文件（可执行文件或者.a包），第二步会把编译好的结果移到$GOPATH、pkg或者$GOPATH/bin
```
#### go doc
```
如果是buildin包，那么执行 go doc buildin;
如果是http包，那么执行 go doc net/http;
查看某一个包里面的函数，则执行godoc fmt Printf;
查看相应的代码，执行godoc -src fmt Printf

```
#### 其他命令
```
go fix 
go version
go run
go env 
go  list
go help get
```

### 2.2 Go语言基础
```
## 定义变量
var  varName type
var  vName1,  vName2, vName3 type
var  vName type = value
var  vName1, vName2 type =v1, v2

var vName1, vName2 = v1, v2
vName1, vName2 := v1, v2 ## 简短说明，只能在函数内部使用

## 常量
const  constantName = value
const Pi float32 = 3.141592
const i =10000
const MaxThread =90
const prefix = "channel"

## 内置数据类型
### Boolean
### 数值类型
### 字符串
### 错误类型
err := errors.New("emit macho dwarf: elf header corrupted")
if err != nil {
    fmt.Print(err)
}

```
### array  slice  map
```
var  arr [n]type

var arr [10]int
```


### if  for  switch
```
## if
var x int64
x = 11

if x>10 {
	fmt.Println("x is greater than 10")
} else{
	fmt.Println("x is less than 10")
}

if x:=computedValue(); x>10{
	fmt.Println("x is greater than 10")
} else {
	fmt.Println("x is less than 10")
}

if integer ==3{
	fmt.Println("The integer is equal to 3")
}else if integer<3	{
	fmt.Println("The integer is less than 3")
}else{
	fmt.Println("The integer is greater than 3")
}

```

```
## for
	sum :=0
	for index:=0; index<10; index ++{
		sum +=index
	}
	fmt.Println("sum is equel to ", sum)

	sum :=1
	for sum <1000 {
		sum+=sum
	}

	// for 配合range可以读取slice和map的数据
	for k,v :=range map{
		fmt.Println("map's key: ",k)
		fmt.Println("map's value: ",v)
	}

	for _,v :=range map{
		fmt.Println("map's val: ",v)
	}

```
### go字符串截取
```
    // strings
    testStr := "wo_shi_wk.tech"
    testStr = strings.ReplaceAll(testStr, "_", "-")
    log.Println("\n")
    log.Println(strings.LastIndex(testStr, "."))
    log.Println(testStr[strings.LastIndex(testStr, ".")+1:])

```

### 一起实验楼实战一下？？？

https://www.shiyanlou.com/courses/485