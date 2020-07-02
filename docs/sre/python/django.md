## django
```
Type 'django-admin help <subcommand>' for help on a specific subcommand.
Available subcommands:

[django]
    check
    compilemessages
    createcachetable
    dbshell
    diffsettings
    dumpdata
    flush
    inspectdb
    loaddata
    makemessages
    makemigrations
    migrate
    runserver
    sendtestemail
    shell
    showmigrations
    sqlflush
    sqlmigrate
    sqlsequencereset
    squashmigrations
    startapp
    startproject
    test
    testserver
```

#### 搭建多个互不干扰的开发环境（可选）
```
pip install virtualenv virtualenvwrapper

cat >> ~/.bash_profile <<EOF
export WORKON_HOME=$HOME/.virtualenvs
export PROJECT_HOME=$HOME/workspace
source /usr/bin/virtualenvwrapper.sh
EOF
```
#### 4.2 虚拟环境使用方法：
```
mkvirtualenv zqxt：创建运行环境zqxt

workon zqxt: 工作在 zqxt 环境 或 从其它环境切换到 zqxt 环境

deactivate: 退出终端环境

其它的：

rmvirtualenv ENV：删除运行环境ENV

mkproject mic：创建mic项目和运行环境mic

mktmpenv：创建临时运行环境

lsvirtualenv: 列出可用的运行环境

lssitepackages: 列出当前环境安装了的包

创建的环境是独立的，互不干扰，无需sudo权限即可使用 pip 来进行包的管理

source ~/.bash_profile
```
	
### Django项目创建后，配置settings.py
```
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates'),],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

## static
# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.11/howto/static-files/

STATIC_URL = '/static/'
STATICFILES_DIRS = (os.path.join(BASE_DIR, "static"),)
	
```


### 创建项目
```
pip install -r requirement.txt

django-admin startproject DjangoDevops
python manage.py startapp test1

python manage.py createsuperuser

python manage.py makemigrations
python manage.py migrate

python manage.py runserver

```

### model(数据库)
```
from django.db import models
from django.contrib.auth.model import User

## 新user
class WechatUser(models.Model)
    user = models.OneToOneField(User, models.CASCADE)
    motto = models.CharField(max_length=100,null=True,blank=True)
    pic = models.CharField()
    region = models.CharField()
    
    def __str__(self):
        return self.user.username
        
```

### django admin 
```
admin.register.site(model名字)
```



### 数据库操作
```
```


### hello world
```
```

### django 其他笔记
```

## django笔记

pip install django==2.2.4

python-admin startproject mysite
cd mysite
python manage.py startapp cmdb

## 在mysite/settings.py末尾添加
STATIC_URL = '/static/'
STATICFILES_DIRS = (os.path.join(BASE_DIR, "static"),)

## urls
from django.conf.urls import re_path, include
from django.contrib import admin

## views
from django.shortcuts import render
from django.shortcuts import HttpResponse
from django.shortcuts import redirect


一、路由系统，URL
	1、url(r'^index/', views.index),    url(r'^home/', views.Home.as_view()),
	2、url(r'^detail-(\d+).html', views.detail),
	3、url(r'^detail-(?P<nid>\d+)-(?P<uid>\d+).html', views.detail),
	
二、视图
	1、获取用户请求数据
		request.GET
		request.POST
		request.FILES
	
	2、checkbox的多选的内容
		request.POST.getlist()
	
	3、上传文件
		（form特殊处理  method="post" enctype="multipart/form-data"）
		obj = request.FILES.get('fafafa')
		obj.name
		f = open(obj.name, mode='wb')
		for item in obj.chunks():
			f.write(item)
		f.close()
	
	## cbv 和 fbv
	def func(request, nid, uid):
		pass
	
	def func(request, **kwargs):
		kwargs = {'nid': 1, 'uid': 3}
		
	def func(request, *args, **kwargs):
		args = (2,9)
	
	4、name
		对URL路由关系进行命名，以后可以根据此名称生成自己想要的URL
		
		url(r'^asdfasdf/', views.index, name='i1'),
		url(r'^sell/(\d+)/(\d+)/', views.index, name='i2'),
		url(r'^buy/(?P(pid>\d+)/(?P<nid>\d+)/', views.index, name='i3'),
		
		def func(request, *args, **kwargs):
			from django.urls import reverse
			url1 = reverse('i1')									# asdfasdf/
			url1 = reverse('i2', args=(1,2,))						# sell/1/2/
			url1 = reverse('i3', kwargs={'pid': 1, 'nid': 9})		# buy/1/9/
		
		xxx.html
			{% url 'i1' %}											# asdfasdf/
			{% url 'i2' 1 2%}										# sell/1/2/
			{% url 'i3' pid=1 nid=9 %}								# buy/1/9/
		
		模板语言
			{% url 'index' %}
			{% url 'index' 3 8 %}
		
		def index(request, nid, uid):
			#当前的URL
			print(request.path_info)
			
			#/asddkjf/13/
			from django.urls import reverse
			# v = reverse('index', args=(90,33,))
			v = reverse('index', kwargs={'nid':1,'uid':'')}
			
	5、路由分发
		from django.conf.urls import re_path, include
		from django.contrib import admin

		urlpatterns = [
			# re_path('', admin.site.urls),
			re_path('admin/', admin.site.urls),
			re_path('blog/', include("blog.urls", namespace='blog')),
		]


	6、默认值
	https://www.cnblogs.com/wupeiqi/arcicles/5237704.html
	7、命名空间
	https://www.cnblogs.com/wupeiqi/arcicles/5237704.html
	
三、模板


四、ORM操作

	select * from tb where id> 1;
	# 对应关系
	models.tb.objects.filter(id__gt=1)
	models.tb.objects.filter(id=1)
	models.tb.objects.filter(id__lt=1)
	
	## 1 创建类 （code first）
	
		from django.db import models
		# app01_userinfo (默认命名app_类名)
		class UserInfo(models.Model):
			# id列，自增，主键
			# 用户名列， 字符串类型， 指定长度
			username = models.CharField(max_length=32)
			password = models.CharField(max_length=64)
	
	## 2 注册APP
		在mysite/settings添加APP
	
	## 3 执行命令
		python manage.py  makemigrations
		python manage.py  migrate
	
	## 4 *********注意**********
		Django默认使用MySQLdb模块链接MySQL
		python3中没有了，需要主动修改pymysql
		修改mysite/__init__.py 添加如下代码
		import pymysql
		pymysql.install_as_MySQLdb()
		
	## orm增删改查
	### 增 1
	models.tb.objects.create(username='root',password='123')
	### 增 2
	dict_user = {'username':'alex','password'='234'}
	models.tb.objects.create(**dict_user)
	### 查 1
	results = models.tb.objects.all()  ## 返回的是QuerySet，是一个列表[obj,obj,obj]
	print(results.query ) # 转换为SQL语句
	### 查 2
	results = models.tb.objects.filter(username='root')
	results = models.tb.objects.filter(username='root').first()
	results = models.tb.objects.filter(username='root').count()
	### 删 1
	models.tb.objects.filter(username='root').delete()
	
	### 更新
		models.tb.objects.filter(username='root').update(password='7899')


	一对多：
		1，外键
		2，外键字段_id
		3，models.tb.objects.create(name='root', user_group_id=1)
		4，userlist = models.tb.objects.all()
			for row in userlist:
				print (row.id)
				print (row.user_group.id)
				print (row.user_group.caption)
	
	
		v1 = models.Host.objects.filter(nid__gt=0)
		v2 = models.Host.objects.filter(nid__gt=0).values('nid','hostname','b_id','b__caption')
		v2 = models.Host.objects.filter(nid__gt=0).values_list('nid','hostname','b_id','b__caption')
		
		## __ 神奇的双下滑线
		
		##
		<tbody>
            {% for row in host_list %}
                <tr hostid="{{ row.id }}" bid="{{ row.b_id }}">
                    <td>{{ forloop.counter }}</td>
                    <td>{{ row.hostname }}</td>
                    <td>{{ row.ip }}</td>
                    <td>{{ row.port }}</td>
                    <td>{{ row.b.caption }}</td>
                </tr>
            {% endfor %}
        </tbody>
		
		## 初始ajax，jQuery提供 ajax
		$.ajax({
			url: "/test_ajax",
			type: "GET",
			data: {'user':'root', 'pwd': '123123'},
			success: function(data){
				// data是服务器端返回的字符串
				var obj = JSON.parse(data);
				alert(data);
				}
			});
		
		绑定事件
		
		## 建议：永远让服务器端返回一个字典
		
		return HttpResponse（json.dumps(字典))

多对多

	创建多对多
	
		方式一、自定义关系表
			class Host(models.Model):
				nid = models.AutoField(primary_key=True, )
				hostname = models.CharField(max_length=32,db_index=True)
				ip = models.GenericIPAddressField(db_index=True)
				port = models.IntegerField()
				b = models.ForeignKey("Business", to_field='id', on_delete=True)

			class Application(models.Model):
				name = models.CharField(max_length=32)

			class HostToApp(models.Model):
				hobj = models.ForeignKey(to='Host',to_field='nid', on_delete=True)
				aobj = models.ForeignKey(to='Application',to_field='id', on_delete=True)
		
		方式二、django自动创建关系表
			
			class Host(models.Model):
				nid = models.AutoField(primary_key=True, )
				hostname = models.CharField(max_length=32,db_index=True)
				ip = models.GenericIPAddressField(db_index=True)
				port = models.IntegerField()
				b = models.ForeignKey("Business", to_field='id', on_delete=True)

			class Application(models.Model):
				name = models.CharField(max_length=32)
				r = models.ManyToManyField('Host')
		
			自动创建的无法直接对第三张表进行操作
			obj = Application.objects.get(id=1)
			obj.name
			
			第三张表操作
			obj.r.add(1)
			obj.r.add(2)
			obj.r.add(2,3,4)
			obj.r.add(*[1,2,3,4])
			
			obj.r.remove(1)
			obj.r.remove(2,4)
			obj.r.remove(*[3,5,7])
			
			obj.r.clear()
			obj.r.set([3,5,7])
			
			obj.r.all()
			
回忆总结：
	/crm/  include('app01.urls', namespace='m1'),
	
	app01.urls
	/index/  name='nl'
	
3、
	def func(request):
		request.POST
		request.GET
		request.FILES
		request.getlist
		request.method
		request.path_info
		
		## print(request.environ)
		print(type(request))
		for k,v in request.environ.items():
			print k, v
		
		return render,HttpResponse, redirect
		
4、模板
	render(request, 'index.html')
	
5、models
	class User(models.Model):
		username = models.CharField(max_length=32)
		email = models.EmailField()
		
	有验证功能
		Django Admin后台
	无验证功能
		models.User.objects.create(username='root', email='addfd')
		models.User.objects.filter(id=1).update(email='888')
		
	class UserType(models.Model):
		name = models.CharField(max_length=32)
	
	class User(models.Model):
		username = models.CharField(max_length=32)
		email = models.EmailField()
		user_type = models.ForeignKey('UserType')
		
	user_list = models.User.objects.all()
	for obj in user_list:
		obj.username, obj.email, obj.user_type_id, obj.user_type.name, obj.
	
	
	
## django信号

obj = models.Assets(username= 'root')
obj.save()

## 一、一大波model操作
	1，创建数据库表
		# 单表
		# app01_user ==>tb1
		# users
		class User(models.Model):
			name = models.CharField(max_length=32)
			pwd = models.CharField(max_length=32)
			
			class Meta:
				# 数据库中生成的表的名称，默认app名称 + 下划线 + 类名
				db_table = "tb1"
				
				index_together = [
					("name","pwd"),
					]
				# 最左前缀模式：
				
				unique_together = (("driver", "restaurant"),)
				
				verbose_name = "上课记录"
				verbose_name_plural = "上课记录"
				
		# ForeignKey 一对多  延伸出 一对一，多对多
		## 一对多
			class UserType(models.Model):
				name = model.CharField(max_length=32)
				
			class User(models.Model):
				name = models.CharField(max_length=32)
				pwd = models.CharField(max_length=32)
				ut = models.ForeignKey(to='UserType',to_field='id', on_delete=models.SET(3))
				
			# UserType.objects.filter(id=1).delete() 如果没有on_delete默认也会删除关联表User的对应记录
			
			# 正向操作1 
			v = models.User.objects.all()
			for item in v:
				item.user
				item.pwd
				item.ut.name
			
			# 正向操作2 用一对多字段跨表
			models.User.objects.all().values('user','ut__name')
			
			# 反向操作1 
			v = models.UserType.objects.all()
			for item in v:
				item.name
				item.id
				item.user_set.all()
			
			## ForeignKey设置 related_name=aaa呢，如何操作？
			# 反向操作2 用表名跨表
			models.UserType.objects.all().values('name','user_pwd')
		
		# 多对多
			a，django创建第三张表
				m2m.remove
				m2m.add
				m2m.set
				m2m.clear
			
			b，自定义第三张表（）
			
			c，自定义第三张表（有m2m字段）
		
		
		
	2，操作数据库表
		a，基本操作
		b，QuerySet中的方法：
			- 返回的是QuerySet类型
			
			# 和性能相关的查询参数 select_related(), prefetch_related()
				# select_related()
					users = models.User.objects.all()
					for row in users:
						print (row.user)
						print (row.ut.name) # 不加select_related()，默认会再发一次SQL请求
					
					users = models.User.objects.all().select_related('ut')
			
				# prefetch_related()
					users = models.User.objects.filter(id__gt=30).prefetch_related("ut")
					# 相当于如下，不跨表
					# select * from user where id>30
					# 获取上一步骤中所有的ut_id=[1,2]
					# select * from user_type where id in (1,2)
					
			
			
	
	3，数据验证（弱）
	obj = models.UserInfo.objects.create(username='root',email='root')
	obj.full_clean()
	obj.save()
		full_clean进行验证的步骤
			- 每个字段的正则表达
			- clean钩子

## 二、Form表单
	1，数据验证（强大）
		- 每一个字段（正则，字段钩子）
		- clean
		- _post_clean
		对于错误信息：__all__
	from django import forms
	from django.forms import fields
	from django.forms import widgets
	
	
	
## 三、ModelForm（Model和Form耦合太强）
	1，数据库操作
	2，数据验证
	
	Model +Form => 验证 + 数据库操作
	- class LoginModelForm(xxx)
		利用model.A中的字段
		
	1、生成HTML标签： class Meta:
	2、mf = xxxModelForm(instance=ModelObj)
	3、额外的标签： is_remeber = Ffields.CharField(widgets=Fwidgets.CheckboxInput())
	4、各种验证 is_valid() ->各种钩子
	5、mf.save()  # 可以直接保存包括多对多
		或
		instance =mf.save(False)
		instance.save()
		mf.save_m2m()
		
	
## 四、序列化操作

	ErrorDict
		自定义

	QuerySet
		- 自定义encoder
		
		- 第一种
			from django.core import serializers
			v = models.Tb.objects.all()
			data = serializers.serialize("json",v)
		 第二种
			import json
			from datetime import date
			from datetime import datetime
			
			class JsonCustomEncoder(json.JSONEncoder):
				def default(self, fields):
					if isinstance(fields, datetime):
						return fields.strftime('%Y-%m-%d %H:%M:%S')
					elif isinstance(fields,date):
						return fields.strftime('%Y-%m-%d')
					else:
						return json.JSONEncoder.default(self, fields)
			
			v = models.Tb.objects.values('id','name','ctime')
			v = list(v)
			v = json.dumps(v,cls=JsonCustomEncoder)
		 
	
## 五、Ajax操作
	- 原生ajax
	- 跨域请求（jsonp, CORS）

	如果发送【普通数据】 --> jQuery, XMLHttpRequest, iframe
	
	# 文件上传（预览）
	- Form提交
	- Ajax上传文件
	
	时机：
		如果发送的是【文件】-> iframe, jQuery(FormData), XMLHttpRequest(FormData)
		
	# 图片验证
	
	
## Day25

	- 博客
	
	- CMDB
		- 资产采集
		- API(API认证)
		- 可视化管理
		
	subprocess.getoutput('hostname')
	
	class Ba

```

### django的model序列化
```
Django创建model后
model.table.objects.all() model.table.objects.filter(id=1) QuerySet 可迭代

model.table.objects.get(id=1) 不可迭代

https://www.django.cn/course/show-31.html
```