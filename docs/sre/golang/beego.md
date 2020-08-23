## beego简介
https://www.bilibili.com/video/BV1GE411i7xL?p=1
- MVC执行逻辑
- beego是一个快速开发go应用的HTTP框架
- 可以用来快速开发api(android,ios)
- 可以开发web及后端服务等各种应用

### beego架构(积木式集合)
- cache 缓存模块
- config 配置模块
- context 上下文模块
- logs 日志模块
- orm 数据库相关
- session 会话
- httplib 网络相关模块

### beego 安装
- go环境,git环境
- goland or vscode
- go get github.com/astaxie/beego
- go get github.com/beego/bee
- bee new myBeegoWeb ## 开发完整web
- bee api myApiServer ## 开发api
- bee run

```sh
curl '127.0.0.1:8080' ## get
curl -d 'id=22' '127.0.0.1:8080' ## post
```

## 控制器controller
```
package controllers
import(
    "github.com/astaxie/beego"
)

type TestArgController struct{
    beego.Controller
}

func (c *TestArgController) Get(){
    id:=c.GetString("id")
    c.Ctx.WriteString(id)

    name:=c.Input().Get("name")
    c.Ctx.WriteString(name)
}
```

## ORM 
- go get github.com/beego/bee
- go get github.com/go-sql-driver/mysql

## views

## MVC 实战

## config模块

## httplib 模块

