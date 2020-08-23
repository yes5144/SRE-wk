// 参考
// https://github.com/PanJiaChen/vue-element-admin-site/blob/master/docs/.vuepress/config.js

module.exports = {
    title: '运维工程师进阶之路', // 显示在左上角的网页名称以及首页在浏览器标签显示的title名称
    description: 'SRE', // meta 中的描述文字，用于SEO
    // 注入到当前页面的 HTML <head> 中的标签
    head: [
        ['link', { rel: 'icon', href: '/bookDog.png' }],  //浏览器的标签栏的网页图标
    ],
    markdown: {
        lineNumbers: true
    },
    serviceWorker: true,
    themeConfig: {
        logo: '/bookDog.png',
        lastUpdated: 'lastUpdate', // string | boolean
        nav: [
            { text: '首页', link: '/' },
            // {
            //     text: '分类',
            //     ariaLabel: '分类',
            //     items: [
            //         { text: '文章', link: '/sre/linux/cli.md' },
            //         { text: '琐碎', link: '/sre/mysql/install.md' },
            //     ]
            // },
            { text: '功能演示', link: '/sre/linux/cli.md' },
            { text: 'Github', link: 'https://github.com/yes5144' },
        ],
        sidebar: {
            '/sre/': [
                {
                    title: 'Linux开源基石',   // 必要的
                    collapsable: true, // 可选的, 默认值是 true,
                    sidebarDepth: 1,    // 可选的, 默认值是 1
                    children: [
                        ['linux/base_cli.md', '基础命令'],
                        ['linux/system_security.md', '系统安全'],
                        // ['linux/cli.md', '命令组合']
                    ]
                },
                {
                    title: 'Nginx高性能web服务',
                    collapsable: true, // 可选的, 默认值是 true,
                    children: [
                        ['nginx/install.md', 'Nginx安装'],
                        ['nginx/conf.md', 'Nginx配置说明'],
                        ['nginx/benchmark.md', 'Nginx压力测试'],
                    ]
                },
                {
                    title: 'MySQL最好用的关系型数据库',
                    collapsable: true, // 可选的, 默认值是 true,
                    children: [
                        ['mysql/install.md', 'MySQL安装'],
                        ['mysql/params.md', '配置说明1'],
                        ['mysql/params2.md', '配置说明2'],
                        ['mysql/gtid主从复制.md', '基于GTID主从'],
                        ['mysql/docker主从复制.md', 'docker版主从'],
                    ]
                },
                {
                    title: 'gitlab企业代码仓库管理',
                    collapsable: true, // 可选的, 默认值是 true,
                    children: [
                        ['gitlab/install.md', 'gitlab安装']
                    ]
                },
                {
                    title: 'Jenkins持续集成部署',
                    collapsable: true, // 可选的, 默认值是 true,
                    children: [
                        ['jenkins/install.md', 'CICD']
                    ]
                },
                {
                    title: 'Redis多功能nosql数据库',
                    collapsable: true, // 可选的, 默认值是 true,
                    children: [
                        ['redis/install.md', 'Redis安装']
                    ]
                },
                {
                    title: 'Saltstack批量管理工具',
                    collapsable: true, // 可选的, 默认值是 true,
                    children: [
                        ['saltstack/install.md', 'Saltstack安装']
                    ]
                },
                {
                    title: 'Zabbix开源监控系统',
                    collapsable: true, // 可选的, 默认值是 true,
                    children: [
                        ['zabbix/install.md', 'zabbix安装']
                    ]
                },
                {
                    title: 'Prometheus下一代监控系统',
                    collapsable: true, // 可选的, 默认值是 true,
                    children: [
                        ['prometheus/install.md', 'Prometheus安装']
                    ]
                },
                {
                    title: 'Python优雅的编程语言',
                    collapsable: true, // 可选的, 默认值是 true,
                    children: [
                        ['python/base.md', '数据类型和操作'],
                        ['python/django.md', 'django入门'],
                        ['python/django_uwsgi_nginx.md', 'django项目部署'],
                    ]
                },
                {
                    title: 'Docker轻量虚拟化技术',
                    collapsable: true, // 可选的, 默认值是 true,
                    children: [
                        ['docker/install.md', 'Docker安装'],
                        ['docker/dockerfile.md', 'dockerfile详解'],
                        ['docker/docker_prac.md', 'Docker实战'],
                    ]
                },
                {
                    title: 'k8s容器编排利器',
                    collapsable: true, // 可选的, 默认值是 true,
                    children: [
                        ['k8s/install.md', 'k8s容器编排'],
                        ['k8s/5min.md', 'k8s命令入门'],
                    ]
                },
                {
                    title: 'golang',
                    collapsable: true, // 可选的, 默认值是 true,
                    children: [
                        ['golang/install.md', 'golang环境安装']
                    ]
                },
                {
                    title: '小技巧',
                    collapsable: true, // 可选的, 默认值是 true,
                    children: [
                        ['tips/echoColorful.md', 'echo加点颜色'],
                        ['tips/timeFormat.md', 'time格式化字符串'],
                        ['tips/top10.md', 'top排行榜'],
                    ]
                }
            ],
        }
    }
}

