## Anacona3
[Anaconda官网](https://www.anaconda.com/download/)


### 创建一个新的 environment
conda create --name python34 python=3.4

### 查看已经存在的environment
conda info -e

### 激活一个 environment
activate python34  # for windows
source activate python34  # for linux & mac


### 退出一个 environment
deactivate python34 # for windows
source deactivate python34  # for linux


### 删除一个 environment
conda remove --name python34 --all


### conda 的包管理有点类似pip
conda install numpy


### 查看已经安装的Python包
conda list
conda list -n python34  # 查看指定环境安装的Python包


### 删除一个 Python包
conda remove -n python34 numpy

## anaconda换源：
#### 指定清华的源：
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free/
#### 有资源显示源地址：
conda config --set show_channel_urls yes