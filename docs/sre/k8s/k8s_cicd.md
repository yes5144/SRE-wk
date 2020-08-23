## 基于Jenkins+Gitlab+Harbor+Rancher+k8s CI/CD实现
https://www.cnblogs.com/xiao987334176/p/13074198.html

## 各个组件的功能描述

### Jenkins
- （1）下载gitlab中项目代码
- （2）负载执行镜像的构建、上传下载
- （3）部署到k8s集群

### Gitlab
- （1）项目代码以及配置
- （2）Dockerfile文件

### Harbor
> 这个是vmware公司开源的docker镜像仓库管理系统，比较方便管理维护镜像

- （1）负责构建后镜像的存储

### Rancher
> 容器编排管理工具

- （1）更新stack/service
- （2）实现服务的扩容缩容

### k8s
- （1）简化应用部署
- （2）提高硬件资源利用率
- （3）健康检查和自修复
- （4）自动扩容缩容
- （5）服务发现和负载均衡