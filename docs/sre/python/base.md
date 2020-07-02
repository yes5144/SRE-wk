## 基本数据类型

### pip install 加速
```
pip3 install ipython -i http://pypi.douban.com/simple  --trusted-host pypi.douban.com

pip3 install mysqlclient=1.3.14 -i http://pypi.douban.com/simple  --trusted-host pypi.douban.com

```

### list 列表
```
list1 = [1,3,4,5]
list1.append('k')

```

### tuple 元组
```
t1 = (2,)
t2 = (3,4)

```

### dict 字典
```
# 列表转集合(去重)
list1 = [6, 7, 7, 8, 8, 9]
set(list1)
# {6, 7, 8, 9}
 
#两个列表转字典
list1 = ['key1','key2','key3']
list2 = ['1','2','3']
dict(zip(list1,list2))
# {'key1': '1', 'key2': '2', 'key3': '3'}
 
#嵌套列表转字典
list3 = [['key1','value1'],['key2','value2'],['key3','value3']]
dict(list3)
# {'key1': 'value1', 'key2': 'value2', 'key3': 'value3'}
 
# 列表、元组转字符串
list2 = ['a', 'a', 'b']
''.join(list2)
# 'aab'
 
tup1 = ('a', 'a', 'b')
''.join(tup1)
# 'aab'

## 字典排序
print sorted(sumNewServer.items(), key=lambda d:d[1],reverse=True)
print sorted(sumNewServer.items())

```

### 命令行传参
```
def main():
    ops_choices = {
        "5":["status",["review-server"]],
    }

    parser = argparse.ArgumentParser()
    parser.add_argument("zone")
    parser.add_argument("-k", "--key", help="project app ops", default="4")
    args = parser.parse_args()
    zone = args.zone
    key = args.key
    if args.zone:
        project_zone_ops(zone, key)
    else:
        print color.inRed("Ps: python 09_restart_gs_xxx.py  nz_wx -k 4 ")

if __name__ == '__main__':
    main()

```


#### Python

#### 控制语句
```
## if选择结构
if 条件1:
    代码1
elif 条件2:
    代码2
else:
    代码n
		
## while循环
while 条件:
    代码

## for循环
for 循环变量 in 可迭代对象:
    代码块

### break, continue, pass
```

#### 字符串
```
## 字符串输入
number = int(input('input your favorite number')) # input中参数是输出提示
print(f'Your favorite number is {number}')    # 字符串前的f表示这是一个格式串，变量不存在则报错。

## 字符串运算
alice = 'my name is '
bob = 'Li Hua'

alice +bob
bob * 3
'Li' in bob
alice[0:5]

### 字符串操作符： + * in  not in  []

### 字符串内建方法
count(), find(), isalpha(), isdigit(), join(), lstrip(), replace(), rstrip(), split(), startswith(), strip(), zfill()

print('-'.join(['3'.'2','5','5']))
index=33
print('image'+ str(index).zfill(4))

```
#### 

#### 变量和数据类型
```
## Tuple（元组）
(3,3,2,1)
## Set（集合）
{3,2,1}
## List（列表）
[3,3,2.1]
## Dict（字典）
key:value
## 字符串

```

#### 函数
- 不带默认值参数：def func(a):
- 带默认值参数：def func(a, b=1):
- 任意位置参数：def func(a, b=1, *c):
- 任意键值参数：def func(a, b=1, *c, **d):

这也是他们的出场顺序安排

#### 类和对象
```
对象是类的一个实例。
类在python中由3部分组成--类名、属性和方法。
类的属性分两种，分别是类属性和实例属性

class Vehicle:
	 class_property =0   # 没有self，并且写在方法外，这是类属性
	 
	 def __init__(self):
        temporary_var = -1    # 写在方法里，但是没有self，这是一个局部变量
        self.instance_property = 1  # 有self，这里创建了一个实例属性
        Vehicle.class_property +1   # 操作类属性需要写类名

```

### python 生成器
> 创建生成器的一种方法是利用yield关键字，他的作用和return类似，解释器在函数中遇到yield后会立即返回响应的值。但是yield跟return的最大的不同是，在下次调用这个函数的时候不会从头开始执行，而是会从上次yield返回后的下一句开始执行，并且这时候函数的上下文，简单来说就是各变量的值，也是和上次yield返回的时候是一致的。
> 形象的说，普通使用return的函数每次执行就像是一条线段，从一个端点到另一个端点，但是使用了yield的函数每次执行更像是一个圆，从一个起点开始在固定位置返回后继续绕圈执行。同时关键的一点事，任何使用yield的函数返回值就会成为一个生成器对象。
```
def  my_range(end):
    i = 0
    while i < end:
        yield i   ## 这里返回 i
        i += 1

## print 函数返回对象的类型：
g = my_range(10)
print(type(g))
```

#### 生成器推导式
> 你知道列表推导式吗？其实生成器推导式与列表推导式很相近，只是把中括号变成小括号：
```
gen = (x * x for x in range(5) if x % 2 ==0)
print (type(gen))
for i in gen:
  print(i)

```