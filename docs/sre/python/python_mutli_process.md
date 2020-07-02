## 多进程 future
> 在 Python 3.2 以后，concurrent.futures是内置的模块，我们可以直接使用。 如果你需要在 Python 2.7 中使用 concurrent.futures , 那么请用 pip 进行安装，pip install futures

### 多进程

```
## https://www.cnblogs.com/huchong/p/7459324.html
from concurrent.futures import ProcessPoolExecutor
import os,time,random
def task(n):
    print('%s is running' %os.getpid())
    time.sleep(2)
    return n**2


if __name__ == '__main__':
    p=ProcessPoolExecutor()  #不填则默认为cpu的个数
    l=[]
    start=time.time()
    for i in range(10):
        obj=p.submit(task,i)   #submit()方法返回的是一个future实例，要得到结果需要用obj.result()
        l.append(obj)

    p.shutdown()  #类似用from multiprocessing import Pool实现进程池中的close及join一起的作用
    print('='*30)
    # print([obj for obj in l])
    print([obj.result() for obj in l])
    print(time.time()-start)

    #上面方法也可写成下面的方法
    # start = time.time()
    # with ProcessPoolExecutor() as p:   #类似打开文件,可省去.shutdown()
    #     future_tasks = [p.submit(task, i) for i in range(10)]
    # print('=' * 30)
    # print([obj.result() for obj in future_tasks])
    # print(time.time() - start)

```