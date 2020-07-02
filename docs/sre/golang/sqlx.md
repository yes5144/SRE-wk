## sqlx

### 连接数据库
```
package models

import (
    "log"

    _ "github.com/go-sql-driver/mysql"
    "github.com/jmoiron/sqlx"
)

var DB *sqlx.DB

func init() {
    var err error
    // DB := 赋值，是局部变量，只能函数内部使用
    DB, err = sqlx.Open("mysql", "root:channel@tcp(192.168.204.222:3306)/gindemo?parseTime=true")
    if err != nil {
        log.Fatalln(err)
    }
    // defer DB.Close()

    DB.SetMaxIdleConns(20)
    DB.SetMaxOpenConns(20)

    if err := DB.Ping(); err != nil {
        log.Fatalln(err)
    }
}

```